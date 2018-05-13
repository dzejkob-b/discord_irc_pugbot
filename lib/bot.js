import _ from 'lodash';
import irc from 'irc-upd';
import logger from 'winston';
import discord from 'discord.js';
import Operator from './operator';
import Participant from './participant';
import Catalog from './catalog';
import IrcUsers from './irc_users';
import DiscordUsers from './discord_users';
import {ConfigurationError} from './errors';
import {formatFromDiscordToIRC, formatFromIRCToDiscord} from './formatting';
import {exit, run_again} from './cli';

const REQUIRED_FIELDS = ['server', 'nickname', 'channelDiscord', 'channelIrc', 'discordToken'];
const NICK_COLORS = ['light_blue', 'dark_blue', 'light_red', 'dark_red', 'light_green', 'dark_green', 'magenta', 'light_magenta', 'orange', 'yellow', 'cyan', 'light_cyan'];
const patternMatch = /{\$(.+?)}/g;

/**
 * An IRC bot, works as a middleman for all communication
 * @param {object} options
 */
class Bot {
    constructor(options) {
        REQUIRED_FIELDS.forEach((field) => {
            if (!options[field]) {
                throw new ConfigurationError(`Missing configuration field ${field}`);
            }
        });

        this.operRef = new Operator(this, options);

        this.discordReady = false;
        this.discord = new discord.Client({autoReconnect: true});

        this.server = options.server;
        this.nickname = options.nickname;
        this.ircOptions = options.ircOptions;
        this.discordToken = options.discordToken;
        this.ircNickColor = options.ircNickColor !== false; // default to true
        this.ircAuthName = options.ircAuthName;
        this.ircAuthPassword = options.ircAuthPassword;
        this.ircMode = options.ircMode;

        this.channelDiscord = options.channelDiscord;
        this.channelIrc = options.channelIrc;

        // Nicks to ignore
        this.ignoreUsers = options.ignoreUsers || {};
        this.ignoreUsers.irc = this.ignoreUsers.irc || [];
        this.ignoreUsers.discord = this.ignoreUsers.discord || [];

        // "{$keyName}" => "variableValue"
        // author/nickname: nickname of the user who sent the message
        // discordChannel: Discord channel (e.g. #general)
        // ircChannel: IRC channel (e.g. #irc)
        // text: the (appropriately formatted) message content
        this.format = options.format || {};

        // "{$keyName}" => "variableValue"
        // displayUsername: nickname with wrapped colors
        // attachmentURL: the URL of the attachment (only applicable in formatURLAttachment)
        this.formatIRCText = this.format.ircText || '<{$displayUsername}> {$text}';
        this.formatURLAttachment = this.format.urlAttachment || '<{$displayUsername}> {$attachmentURL}';

        // "{$keyName}" => "variableValue"
        // withMentions: text with appropriate mentions reformatted
        this.formatDiscord = this.format.discord || '**<{$author}>** {$withMentions}';

        this.channelIrcUsers = new IrcUsers(this);
        this.channelDisUsers = new DiscordUsers(this);

        this.channelMapping = {};
        this.channelMapping[this.channelDiscord] = this.channelIrc.split(' ')[0].toLowerCase();
        this.invertedMapping = _.invert(this.channelMapping);

        this.autoSendCommands = options.autoSendCommands || [];
    }

    connect() {
        logger.debug('Connecting to IRC and Discord');
        
        this.discord.login(this.discordToken);

        const ircOptions = {
            userName: this.nickname,
            realName: this.nickname,
            channels: [],
            floodProtection: true,
            floodProtectionDelay: 500,
            retryCount: 10,
            autoRenick: true,

            // options specified in the configuration file override the above defaults
            ...this.ircOptions
        };

        ircOptions["channels"].push(this.channelIrc);

        // default encoding to UTF-8 so messages to Discord aren't corrupted
        if (!Object.prototype.hasOwnProperty.call(ircOptions, 'encoding')) {
            if (irc.canConvertEncoding()) {
                ircOptions.encoding = 'utf-8';

            } else {
                logger.warn(
                    'Cannot convert message encoding; you may encounter corrupted characters with non-English text.\n' +
                    'For information on how to fix this, please see: https://github.com/Throne3d/node-irc#character-set-detection'
                );
            }
        }

        this.ircReady = false;
        this.ircClient = new irc.Client(this.server, this.nickname, ircOptions);

        /*
        this.ircClient.opt.messageSplit = 512;
        this.ircClient._updateMaxLineLength = function() {
            this.maxLineLength = 512;
        }
        */

        this.attachListeners();
    }

    attachListeners() {
        this.discord.on('ready', () => {
            logger.info('Connected to Discord');

            this.discordReady = true;
        });

        this.discord.on('disconnect', () => {
            if (this.discord.ws.connection.ratelimit.resetTimer) {
                clearTimeout(this.discord.ws.connection.ratelimit.resetTimer);
            }
        });

        this.ircClient.on('registered', (message) => {
            logger.info('Connected to IRC');
            logger.debug('Registered event: ', message);

            if (this.ircAuthName && this.ircAuthPassword) {
                var authCmd;

                authCmd = [];
                authCmd.push("AUTH");
                authCmd.push(this.ircAuthName);
                authCmd.push(this.ircAuthPassword);

                this.ircClient.send(...authCmd);

                authCmd = [];
                authCmd.push("PRIVMSG");
                authCmd.push("Q@CServe.quakenet.org");
                authCmd.push("AUTH " + this.ircAuthName + " " + this.ircAuthPassword);

                this.ircClient.send(...authCmd);
            }

            if (this.ircMode) {
                var modeCmd = [];

                modeCmd.push("MODE");
                modeCmd.push(this.nickname);
                modeCmd.push(this.ircMode);

                this.ircClient.send(...modeCmd);
            }

            this.autoSendCommands.forEach((element) => {
                this.ircClient.send(...element);
            });

            this.ircReady = true;
        });

        this.ircClient.on('error', (error) => {
            logger.error('Received error event from IRC', error);
        });

        this.discord.on('error', (error) => {
            logger.error('Received error event from Discord', error);
        });

        this.discord.on('warn', (warning) => {
            logger.warn('Received warn event from Discord', warning);
        });

        this.discord.on('message', (message) => {
            this.sendToIRC(message);
        });

        this.ircClient.on('message', (nick, to, text, message) => {
            if (to == this.nickname) {
                // pm message

                let partRef = new Participant(message);

                partRef.channel = this.channelIrc;

                this.operRef.supplyCommand(partRef, text, true);

            } else if (to.substr(0, 1) == '#') {
                // message to channel

                this.sendToDiscord(nick, to, text)

            }
        });

        this.ircClient.on('notice', (author, to, text) => {
            this.sendToDiscord(author, to, `*${text}*`);
        });

        this.ircClient.on('nick', (oldNick, newNick, channels) => {
            channels.forEach((channelName) => {
                const channel = channelName.toLowerCase();

                this.channelIrcUsers.changeUserNick(channel, oldNick, newNick);
                this.sendExactToDiscord(channel, `*${oldNick}* is now known as ${newNick}`);

            });

            this.operRef.ircNickChange(oldNick, newNick);

        });

        this.ircClient.on('join', (channelName, nick) => {
            logger.debug('Received join:', channelName, nick);

            const channel = channelName.toLowerCase();

            this.channelIrcUsers.joinUser(channel, nick);
            this.sendExactToDiscord(channel, `*${nick}* has joined the channel`);

        });

        this.ircClient.on('part', (channelName, nick, reason) => {
            logger.debug('Received part:', channelName, nick, reason);

            const channel = channelName.toLowerCase();

            this.channelIrcUsers.leaveUser(channel, nick);

            let partRef = new Participant({"author" : nick, "channel" : channel});
            this.operRef.leaveEvent(partRef);

            this.sendExactToDiscord(channel, `*${nick}* has left the channel (${reason})`);
        });

        this.ircClient.on('quit', (nick, reason, channels) => {
            logger.debug('Received quit:', nick, channels);

            channels.forEach((channelName) => {
                const channel = channelName.toLowerCase();
                
                this.channelIrcUsers.leaveUser(channel, nick);
                this.sendExactToDiscord(channel, `*${nick}* has quit (${reason})`);

                let partRef = new Participant({"author" : nick, "channel" : channel});
                this.operRef.leaveEvent(partRef);

            });
        });

        this.ircClient.on('names', (channelName, nicks) => {
            logger.debug('Received names:', channelName, nicks);
            
            const channel = channelName.toLowerCase();

            this.channelIrcUsers.joinUserList(channel, Object.keys(nicks));

        });

        this.ircClient.on('action', (author, to, text) => {
            this.sendToDiscord(author, to, `_${text}_`);
        });

        if (logger.level === 'debug') {
            this.discord.on('debug', (message) => {
                logger.debug('Received debug event from Discord', message);
            });
        }
    }

    doQuit(restart) {
        this.operRef.doQuit();

        this.discordReady = false;
        this.ircReady = false;

        this.ircClient.disconnect();
        this.discord.destroy();

        if (restart) {
            run_again();
        } else {
            exit();
        }
    }

    static getDiscordNicknameOnServer(user, guild) {
        if (guild) {
            const userDetails = guild.members.get(user.id);

            if (userDetails) {
                return userDetails.nickname || user.username;
            }
        }

        return user.username;
    }

    parseText(message) {
        const text = message.mentions.users.reduce((content, mention) => {
            const displayName = Bot.getDiscordNicknameOnServer(mention, message.guild);

            return content.replace(`<@${mention.id}>`, `@${displayName}`)
                .replace(`<@!${mention.id}>`, `@${displayName}`)
                .replace(`<@&${mention.id}>`, `@${displayName}`);
        }, message.content);

        return text
            .replace(/\n|\r\n|\r/g, ' ')
            .replace(/<#(\d+)>/g, (match, channelId) => {
                const channel = this.discord.channels.get(channelId);
                if (channel) return `#${channel.name}`;
                return '#deleted-channel';
            })
            .replace(/<@&(\d+)>/g, (match, roleId) => {
                const role = message.guild.roles.get(roleId);
                if (role) return `@${role.name}`;
                return '@deleted-role';
            })
            .replace(/<(:\w+:)\d+>/g, (match, emoteName) => emoteName);
    }

    ignoredIrcUser(user) {
        return this.ignoreUsers.irc.some(i => i.toLowerCase() === user.toLowerCase());
    }

    ignoredDiscordUser(user) {
        return this.ignoreUsers.discord.some(i => i.toLowerCase() === user.toLowerCase());
    }
    
    static substitutePattern(message, patternMapping) {
        return message.replace(patternMatch, (match, varName) => patternMapping[varName] || match);
    }

    sendToIRC(message) {
        const {author} = message;

        // Ignore messages sent by the bot itself:
        if (author.id === this.discord.user.id) return;

        // Do not send to IRC if this user is on the ignore list.
        if (this.ignoredDiscordUser(author.username)) {
            return;
        }

        const channelName = `#${message.channel.name}`;
        const ircChannel = this.channelMapping[message.channel.id] || this.channelMapping[channelName];

        logger.debug('Channel Mapping', channelName, this.channelMapping[channelName]);

        if (ircChannel) {
            const fromGuild = message.guild;
            const nickname = Bot.getDiscordNicknameOnServer(author, fromGuild);

            let baseText = this.parseText(message);
            let text = baseText;
            let displayUsername = nickname;

            if (this.ircNickColor) {
                const colorIndex = (nickname.charCodeAt(0) + nickname.length) % NICK_COLORS.length;
                displayUsername = irc.colors.wrap(NICK_COLORS[colorIndex], nickname);
            }

            const patternMap = {
                author: nickname,
                nickname,
                displayUsername,
                text,
                discordChannel: channelName,
                ircChannel
            };

            if (text !== '') {
                // Convert formatting
                text = formatFromDiscordToIRC(text);
                patternMap.text = text;

                text = Bot.substitutePattern(this.formatIRCText, patternMap);

                logger.debug('Sending message to IRC', ircChannel, text);

                this.ircClient._updateMaxLineLength();
                this.ircClient.say(ircChannel, text);
            }

            if (message.attachments && message.attachments.size) {
                message.attachments.forEach((a) => {
                    patternMap.attachmentURL = a.url;

                    const urlMessage = Bot.substitutePattern(this.formatURLAttachment, patternMap);

                    logger.debug('Sending attachment URL to IRC', ircChannel, urlMessage);

                    this.ircClient._updateMaxLineLength();
                    this.ircClient.say(ircChannel, urlMessage);
                });
            }

            let partRef = new Participant(message);
            this.operRef.supplyCommand(partRef, baseText, false);

        }
    }

    findDiscordChannel(ircChannel) {
        const discordChannelName = this.invertedMapping[ircChannel.toLowerCase()];

        if (discordChannelName) {
            // #channel -> channel before retrieving and select only text channels:
            const discordChannel = discordChannelName.startsWith('#') ? this.discord.channels
                .filter(c => c.type === 'text')
                .find('name', discordChannelName.slice(1)) : this.discord.channels.get(discordChannelName);

            if (!discordChannel) {
                logger.info(
                    'Tried to send a message to a channel the bot isn\'t in: ',
                    discordChannelName
                );

                return null;
            }

            return discordChannel;
        }

        return null;
    }

    // compare two strings case-insensitively
    // for discord mention matching
    static caseComp(str1, str2) {
        return str1.toUpperCase() === str2.toUpperCase();
    }

    // check if the first string starts with the second case-insensitively
    // for discord mention matching
    static caseStartsWith(str1, str2) {
        return str1.toUpperCase().startsWith(str2.toUpperCase());
    }

    sendToDiscord(author, channel, text) {
        const discordChannel = this.findDiscordChannel(channel);

        if (!discordChannel) return;

        // Do not send to Discord if this user is on the ignore list.
        if (this.ignoredIrcUser(author)) {
            return;
        }

        // Convert text formatting (bold, italics, underscore)
        const withFormat = formatFromIRCToDiscord(text);

        const patternMap = {
            author,
            nickname: author,
            displayUsername: author,
            text: withFormat,
            discordChannel: `#${discordChannel.name}`,
            ircChannel: channel
        };

        const {guild} = discordChannel;

        const withMentions = withFormat.replace(/@([^\s#]+)#(\d+)/g, (match, username, discriminator) => {
            // @username#1234 => mention
            // skips usernames including spaces for ease (they cannot include hashes)
            // checks case insensitively as Discord does

            const user = guild.members.find(x =>
            Bot.caseComp(x.user.username, username.toUpperCase())
            && x.user.discriminator === discriminator);

            if (user) return user;

            return match;

        }).replace(/@([^\s]+)/g, (match, reference) => {
            // this preliminary stuff is ultimately unnecessary
            // but might save time over later more complicated calculations
            // @nickname => mention, case insensitively
            const nickUser = guild.members.find(x =>
            x.nickname !== null && Bot.caseComp(x.nickname, reference));
            if (nickUser) return nickUser;

            // @username => mention, case insensitively
            const user = guild.members.find(x => Bot.caseComp(x.user.username, reference));
            if (user) return user;

            // @role => mention, case insensitively
            const role = guild.roles.find(x => x.mentionable && Bot.caseComp(x.name, reference));
            if (role) return role;

            // No match found checking the whole word. Check for partial matches now instead.
            // @nameextra => [mention]extra, case insensitively, as Discord does
            // uses the longest match, and if there are two, whichever is a match by case
            let matchLength = 0;
            let bestMatch = null;
            let caseMatched = false;

            // check if a partial match is found in reference and if so update the match values
            const checkMatch = function (matchString, matchValue) {
                // if the matchString is longer than the current best and is a match
                // or if it's the same length but it matches by case unlike the current match
                // set the best match to this matchString and matchValue
                if ((matchString.length > matchLength && Bot.caseStartsWith(reference, matchString))
                    || (matchString.length === matchLength && !caseMatched
                    && reference.startsWith(matchString))) {
                    matchLength = matchString.length;
                    bestMatch = matchValue;
                    caseMatched = reference.startsWith(matchString);
                }
            };

            // check users by username and nickname
            guild.members.forEach((member) => {
                checkMatch(member.user.username, member);
                if (bestMatch === member || member.nickname === null) return;
                checkMatch(member.nickname, member);
            });
            // check mentionable roles by visible name
            guild.roles.forEach((member) => {
                if (!member.mentionable) return;
                checkMatch(member.name, member);
            });

            // if a partial match was found, return the match and the unmatched trailing characters
            if (bestMatch) return bestMatch.toString() + reference.substring(matchLength);

            return match;

        }).replace(/:(\w+):/g, (match, ident) => {
            // :emoji: => mention, case sensitively
            const emoji = guild.emojis.find(x => x.name === ident && x.requiresColons);

            if (emoji) return emoji;

            return match;
        });

        patternMap.withMentions = withMentions;

        // Add bold formatting:
        // Use custom formatting from config / default formatting with bold author
        const withAuthor = Bot.substitutePattern(this.formatDiscord, patternMap);

        logger.debug('Sending message to Discord', withAuthor, channel, '->', `#${discordChannel.name}`);

        discordChannel.send(withAuthor);

        let partRef = new Participant({"author" : author, "channel" : channel});
        this.operRef.supplyCommand(partRef, text, false);
    }

    /* Sends a message to Discord exactly as it appears */
    sendExactToDiscord(channel, text) {
        let channels = [];

        channels.push(channel ? channel : this.channelIrc);

        channels.forEach((ircChannel) => {
            const discordChannel = this.findDiscordChannel(ircChannel);

            if (!discordChannel) return;

            logger.debug('Sending special message to Discord', text, ircChannel, '->', `#${discordChannel.name}`);

            discordChannel.send(text);
        });
    }

    /* Sends a message to IRC exactly as it appears */
    sendExactToIRC(channel, text) {
        let channels = [];

        channels.push(channel ? channel : this.channelIrc);

        channels.forEach((ircChannel) => {

            logger.debug('Sending special message to IRC', text, '->', ircChannel);

            this.ircClient._updateMaxLineLength();
            this.ircClient.say(ircChannel, text);
        });
    }
}

export default Bot;
