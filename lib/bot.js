import _ from 'lodash';
import irc from 'irc-upd';
import logger from 'winston';
import discord from 'discord.js';
import Operator from './operator';
import Message from './message';
import Participant from './participant';
import Catalog from './catalog';
import IrcUsers from './irc_users';
import DiscordUsers from './discord_users';
import {ConfigurationError} from './errors';
import {formatFromDiscordToIRC, formatFromIRCToDiscord} from './formatting';
import {exit, run_again} from './cli';

const REQUIRED_FIELDS = ['server', 'nickname', 'discordToken', 'channels'];
const NICK_COLORS = ['light_blue', 'dark_blue', 'light_red', 'dark_red', 'light_green', 'dark_green', 'magenta', 'light_magenta', 'orange', 'yellow', 'cyan', 'light_cyan'];
const patternMatch = /{\$(.+?)}/g;

class Bot {
    constructor(options) {
        REQUIRED_FIELDS.forEach((field) => {
            if (!options[field]) {
                throw new ConfigurationError(`Missing configuration field ${field}`);
            }
        });

        this.discordReady = false;
        this.discord = null;

        this.ircReady = false;
        this.ircClient = null;

        this.server = options.server;
        this.nickname = options.nickname;
        this.ircOptions = options.ircOptions;
        this.discordToken = options.discordToken;
        this.discordClientId = options.discordClientId;
        this.ircNickColor = options.ircNickColor !== false; // default to true
        this.ircAuthName = options.ircAuthName;
        this.ircAuthPassword = options.ircAuthPassword;
        this.ircMode = options.ircMode;
        this.ircFloodDelay = options.ircFloodDelay && !isNaN(parseInt(options.ircFloodDelay)) ? parseInt(options.ircFloodDelay) : 1000;
        this.ircAuthUserOnly = options.ircAuthUserOnly ? true : false;
        this.captainPicking = options.captainPicking ? options.captainPicking : "random";
        this.rejoinTimeout = options.rejoinTimeout ? options.rejoinTimeout : 30;
        this.playMultiPugs = options.playMultiPugs ? options.playMultiPugs : false;
        //this.playMultiPugs = false;
        this.channels = options.channels;

        if (!this.channels && (options.channelDiscord || options.channelIrc)) {

            let append = {};

            if (options.channelDiscord) {
                append['channelDiscord'] = options.channelDiscord;
            }

            if (options.channelIrc) {
                append['channelIrc'] = options.channelIrc;
            }

            this.channels['default'] = append;
        }

        for (var chKey in this.channels) {
            this.channels[chKey]['channelKey'] = chKey;
        }

        this.discordDisable = typeof options.discordDisable == 'undefined' ? false : options.discordDisable;
        this.ircDisable = typeof options.ircDisable == 'undefined' ? false : options.ircDisable;

        this.logicLoopInt = null;

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

        this.autoSendCommands = options.autoSendCommands || [];

        this.msgRef = new Message(this);
        this.operRef = new Operator(this, options);
        
    }

    connect() {
        logger.debug('Connecting to IRC and Discord');

        if (!this.discordDisable) {

            this.discord = new discord.Client({
                autoReconnect : true,
                retryLimit : 3
            });
            
            this.discord.login(this.discordToken);
        }

        if (!this.ircDisable) {

            const ircOptions = {
                userName: this.nickname,
                realName: this.nickname,
                channels: [],
                floodProtection: true,
                floodProtectionDelay: this.ircFloodDelay,
                retryCount: 10,
                autoRenick: true,
                autoRejoin: true,

                // options specified in the configuration file override the above defaults
                ...this.ircOptions
            };

            this.getIrcChannels().forEach((channel) => {
                ircOptions['channels'].push(channel);
            });

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

            if (ircOptions['channels'].length > 0) {
                logger.info('Connecting to IRC: ' + this.server + ' as ' + this.nickname);

                this.ircClient = new irc.Client(this.server, this.nickname, ircOptions);

                /*
                this.ircClient.opt.messageSplit = 512;
                this.ircClient._updateMaxLineLength = function() {
                this.maxLineLength = 512;
                }
                */
            }
        }

        this.logicLoopInt = setInterval(() => {

            this.logicLoop();

        }, 1000);

        this.attachListeners();
    }

    attachListeners() {
        if (this.discord != null) {

            this.discord.on('ready', () => {
                logger.info('Connected to Discord');

                this.discordReady = true;
            });

            this.discord.on('disconnect', () => {
                if (this.discord.ws.connection.ratelimit.resetTimer) {
                    clearTimeout(this.discord.ws.connection.ratelimit.resetTimer);
                }
            });

            this.discord.on('error', (error) => {
                logger.error('Received error event from Discord', error);
            });

            this.discord.on('warn', (warning) => {
                logger.warn('Received warn event from Discord', warning);
            });

            this.discord.on('message', (message) => {

                let partRef = this.channelDisUsers.getUserId(message.author.id), baseText;

                if (partRef && message.channel && message.channel.type == 'dm') {
                    // pm message

                    baseText = this.parseText(message);

                    this.operRef.supplyCommand(false, partRef, baseText, true);
                    this.operRef.userActivityEvent(partRef);

                } else if (partRef && message.channel) {
                    // channel  message

                    var channelKey = this.getChannelKeyByDiscord(message.channel.id);

                    if (channelKey) {
                        this.sendToIRC(channelKey, message);

                        baseText = this.parseText(message);

                        this.operRef.supplyCommand(channelKey, partRef.getClone(), baseText, false);
                        this.operRef.userActivityEvent(partRef);

                    } else {
                        logger.warn("Cannot find channelKey from Discord: `" + message.channel.id + "` (Discord message)");
                    }

                }
            });

            if (logger.level === 'debug') {
                this.discord.on('debug', (message) => {
                    logger.debug('Received debug event from Discord', message);
                });
            }

        } // if

        if (this.ircClient != null) {

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

            this.ircClient.on('message', (nick, to, text, message) => {

                logger.debug('Irc message:', nick, to, text, message);

                if (to == this.nickname) {
                    // pm message

                    let partRef = new Participant(message);

                    // !! partRef.channel = this.channelIrc;

                    this.operRef.supplyCommand(false, partRef, text, true);
                    this.operRef.userActivityEvent(partRef);

                } else if (to.substr(0, 1) == '#') {
                    // message to channel

                    var ircChannel = to.toLowerCase();
                    var channelKey = this.getChannelKeyByIrc(ircChannel);

                    if (channelKey) {
                        this.sendToDiscord(channelKey, nick, text);

                        let partRef = new Participant({"author" : nick, "channel" : ircChannel});

                        this.operRef.supplyCommand(channelKey, partRef, text, false);
                        this.operRef.userActivityEvent(partRef);

                    } else {
                        logger.warn("Cannot find channelKey from IRC: `" + ircChannel + "` (Irc message)");
                    }

                }
            });

            this.ircClient.on('notice', (author, to, text) => {
                if (author && author.toUpperCase() != 'Q') {

                    var channelKey = this.getChannelKeyByIrc(to);

                    this.sendToDiscord(channelKey, author, `*${text}*`);
                }
            });

            this.ircClient.on('nick', (oldNick, newNick, channels) => {
                channels.forEach((channelName) => {
                    var ircChannel = channelName.toLowerCase();
                    var channelKey = this.getChannelKeyByIrc(ircChannel);

                    this.channelIrcUsers.changeUserNick(ircChannel, oldNick, newNick);

                    if (channelKey) {
                        this.sendExactToDiscord(channelKey, `*${oldNick}* is now known as ${newNick}`);

                    } else {
                        logger.warn("Cannot find channelKey from IRC: `" + ircChannel + "` (Irc nick)");
                    }

                });
            });

            this.ircClient.on('join', (channelName, nick) => {
                logger.debug('Received join:', channelName, nick);

                var ircChannel = channelName.toLowerCase();
                var channelKey = this.getChannelKeyByIrc(ircChannel);

                let partRef = this.channelIrcUsers.joinUser(ircChannel, nick);

                if (channelKey) {
                    this.operRef.joinEvent(partRef);

                    this.sendExactToDiscord(channelKey, `*${nick}* has joined the channel`);

                } else {
                    logger.warn("Cannot find channelKey from IRC: `" + ircChannel + "` (Irc join)");
                }

            });

            this.ircClient.on('part', (channelName, nick, reason) => {
                logger.debug('Received part:', channelName, nick, reason);

                var ircChannel = channelName.toLowerCase();
                var channelKey = this.getChannelKeyByIrc(ircChannel);

                this.channelIrcUsers.leaveUser(ircChannel, nick);

                let partRef = new Participant({"author" : nick, "channel" : ircChannel});

                if (channelKey) {
                    this.operRef.leaveEvent(channelKey, partRef, "part");

                    this.sendExactToDiscord(channelKey, `*${nick}* has left the channel (${reason})`);

                } else {
                    logger.warn("Cannot find channelKey from IRC: `" + ircChannel + "` (Irc part)");
                }

            });

            this.ircClient.on('kick', (channelName, nick, by, reason, message) => {
                logger.debug('Received kick:', channelName, nick, by, reason);

                var ircChannel = channelName.toLowerCase();
                var channelKey = this.getChannelKeyByIrc(ircChannel);

                this.channelIrcUsers.leaveUser(ircChannel, nick);

                let partRef = new Participant({"author" : nick, "channel" : ircChannel});

                if (channelKey) {
                    this.operRef.leaveEvent(channelKey, partRef, "kick");

                    this.sendExactToDiscord(channelKey, `*${nick}* was kicked from channel (${reason}) by *${by}*`);

                } else {
                    logger.warn("Cannot find channelKey from IRC: `" + ircChannel + "` (Irc part)");
                }

            });

            this.ircClient.on('quit', (nick, reason, channels) => {
                logger.debug('Received quit:', nick, channels);

                channels.forEach((channelName) => {

                    var ircChannel = channelName.toLowerCase();
                    var channelKey = this.getChannelKeyByIrc(ircChannel);

                    this.channelIrcUsers.leaveUser(ircChannel, nick);

                    let partRef = new Participant({"author" : nick, "channel" : ircChannel});
                    this.operRef.leaveEvent(channelKey, partRef, "quit");

                    this.sendExactToDiscord(channelKey, `*${nick}* has quit (${reason})`);

                });
            });

            this.ircClient.on('names', (channelName, nicks) => {
                logger.debug('Received names:', channelName, nicks);

                var channel = channelName.toLowerCase();

                this.channelIrcUsers.joinUserList(channel, Object.keys(nicks));

            });

            this.ircClient.on('action', (author, to, text) => {

                var ircChannel = to.toLowerCase();
                var channelKey = this.getChannelKeyByIrc(ircChannel);

                if (channelKey) {
                    this.sendToDiscord(channelKey, author, `_${text}_`);

                } else {
                    logger.warn("Cannot find channelKey from IRC: `" + ircChannel + "` (Irc action)");
                }

            });

        } // if
    }

    doQuit(restart) {
        if (this.logicLoopInt) {
            clearInterval(this.logicLoopInt);
        }

        this.operRef.doQuit();

        this.discordReady = false;
        this.ircReady = false;

        if (this.ircClient != null) {
            this.ircClient.disconnect();
        }

        if (this.discord != null) {
            this.discord.destroy();
        }

        if (restart) {
            run_again();
        } else {
            exit();
        }
    }

    logicLoop() {
        let partRef = this.channelIrcUsers.getUser(this.nickname);

        if (partRef) {
            // bot is in ...
        }
    }

    static getDiscordNicknameOnServer(user, guild) {
        if (guild) {
            var userDetails = guild.members.get(user.id);

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

    isReady() {
        return this.discordReady || this.ircReady;

        // !! return (this.discordReady || this.discordDisable) && (this.ircReady || this.ircDisable);
    }

    static substitutePattern(message, patternMapping) {
        return message.replace(patternMatch, (match, varName) => patternMapping[varName] || match);
    }

    sendToIRC(channelKey, message) {
        if (!this.ircClient || !this.ircReady || !channelKey) {
            return false;
        }

        if (typeof this.channels[channelKey] != 'undefined' && typeof this.channels[channelKey]['channelIrc'] != 'undefined') {

            let ircChannel = this.channels[channelKey]['channelIrc'];

            const {author} = message;

            // Ignore messages sent by the bot itself:
            if (author.id == this.discord.user.id) {
                return false;
            }

            // Do not send to IRC if this user is on the ignore list.
            if (this.ignoredDiscordUser(author.username)) {
                return false;
            }

            const channelName = `#${message.channel.name}`;
            const fromGuild = message.guild;
            const nickname = Bot.getDiscordNicknameOnServer(author, fromGuild);

            let text = this.parseText(message);
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

        } // if
    }

    getDiscordChannelByIrc(ircChannel) {
        for (var channelKey in this.channels) {
            if (typeof this.channels[channelKey]['channelIrc'] != 'undefined' && this.channels[channelKey]['channelIrc'] == ircChannel) {
                return this.channels[channelKey]['channelDiscord'];
            }
        }

        return false;
    }

    getIrcChannelByDiscord(channelDiscord) {
        for (var channelKey in this.channels) {
            if (typeof this.channels[channelKey]['channelDiscord'] != 'undefined' && this.channels[channelKey]['channelDiscord'] == channelDiscord) {
                return this.channels[channelKey]['channelIrc'];
            }
        }

        return false;
    }

    getChannelKeyByIrc(ircChannel) {
        for (var channelKey in this.channels) {
            if (typeof this.channels[channelKey]['channelIrc'] != 'undefined' && this.channels[channelKey]['channelIrc'].toLowerCase() == ircChannel.toLowerCase()) {
                return channelKey;
            }
        }

        return false;
    }

    getChannelKeyByDiscord(channelDiscord) {
        for (var channelKey in this.channels) {
            if (typeof this.channels[channelKey]['channelDiscord'] != 'undefined' && this.channels[channelKey]['channelDiscord'] == channelDiscord) {
                return channelKey;
            }
        }

        return false;
    }

    getChannelKeys() {
        let channelKeys = [];

        for (var channelKey in this.channels) {
            channelKeys.push(channelKey);
        }

        return channelKeys;
    }

    getChannelKeysFilter(channelKey) {
        let channelKeys = [];
        
        for (var cChannelKey in this.channels) {
            if (!channelKey || cChannelKey == channelKey) {
                channelKeys.push(cChannelKey);
            }
        }

        return channelKeys;
    }

    getChannelKeysWithout(channelKey) {
        let channelKeys = [];

        for (var cChannelKey in this.channels) {
            if (!channelKey || cChannelKey != channelKey) {
                channelKeys.push(cChannelKey);
            }
        }

        return channelKeys;
    }

    getChannelKeysReadable(keys) {
        var result = false;

        for (var channelKey of keys) {
            if (this.channels[channelKey]) {
                if (result === false) {
                    result = '';
                } else {
                    result += ', ';
                }

                result += this.channels[channelKey]['readableKey'] ? this.channels[channelKey]['readableKey'] : channelKey;
            }
        }
        
        return result;
    }

    getIrcChannels() {
        let channels = [];

        for (var channelKey in this.channels) {
            if (typeof this.channels[channelKey]['channelIrc'] != 'undefined') {
                channels.push(this.channels[channelKey]['channelIrc']);
            }
        }

        return channels;
    }

    getDiscordChannel(channelKey) {

        if (!channelKey) {
            channelKey = 'default';
        }

        if (typeof this.channels[channelKey] != 'undefined' && typeof this.channels[channelKey]['channelDiscord'] != 'undefined') {

            return this.getDiscordChannelById(this.discord.channels.get(this.channels[channelKey]['channelDiscord']));
        }

        return null;
    }

    getDiscordChannelById(channelId) {
        var discordChannel = this.discord.channels.get(channelId);

        if (!discordChannel) {
            logger.info('Cannot get channel the bot isn\'t in: ', channelId);

            return null;

        } else {
            return discordChannel;
        }
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

    sendToDiscord(channelKey, author, text) {
        if (!this.discord || !this.discordReady || !channelKey) {
            return false;
        }

        if (typeof this.channels[channelKey] != 'undefined' && typeof this.channels[channelKey]['channelDiscord'] != 'undefined') {

            logger.debug('Sending to discord: ', channelKey, author, text);

            var discordChannel = this.getDiscordChannelById(this.channels[channelKey]['channelDiscord']);

            if (!discordChannel) {
                logger.info('Discord channel not found for irc channel: ', channelKey);
                return false;
            }

            // Do not send to Discord if this user is on the ignore list.
            if (this.ignoredIrcUser(author)) {
                return false;
            }

            // Convert text formatting (bold, italics, underscore)
            const withFormat = formatFromIRCToDiscord(text);

            const patternMap = {
                author,
                nickname: author,
                displayUsername: author,
                text: withFormat,
                discordChannel: `#${discordChannel.name}`,
                ircChannel: channelKey
            };

            const {guild} = discordChannel;

            const withMentions = withFormat.replace(/@([^\s#]+)#(\d+)/g, (match, username, discriminator) => {
                // @username#1234 => mention
                // skips usernames including spaces for ease (they cannot include hashes)
                // checks case insensitively as Discord does

                const user = guild.members.find(x => Bot.caseComp(x.user.username, username.toUpperCase()) && x.user.discriminator === discriminator);

                if (user) {
                    return user;
                }

                return match;

            }).replace(/@([^\s]+)/g, (match, reference) => {
                // this preliminary stuff is ultimately unnecessary
                // but might save time over later more complicated calculations
                // @nickname => mention, case insensitively
                const nickUser = guild.members.find(x => x.nickname !== null && Bot.caseComp(x.nickname, reference));

                if (nickUser) {
                    return nickUser;
                }

                // @username => mention, case insensitively
                const user = guild.members.find(x => Bot.caseComp(x.user.username, reference));

                if (user) {
                    return user;
                }

                // @role => mention, case insensitively
                const role = guild.roles.find(x => x.mentionable && Bot.caseComp(x.name, reference));

                if (role) {
                    return role;
                }

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
                    if (
                        (matchString.length > matchLength && Bot.caseStartsWith(reference, matchString)) ||
                        (matchString.length === matchLength && !caseMatched && reference.startsWith(matchString))
                    ) {
                        matchLength = matchString.length;
                        bestMatch = matchValue;
                        caseMatched = reference.startsWith(matchString);
                    }
                };

                // check users by username and nickname
                guild.members.forEach((member) => {
                    checkMatch(member.user.username, member);

                    if (bestMatch === member || member.nickname === null) {
                        return;
                    }

                    checkMatch(member.nickname, member);
                });
                // check mentionable roles by visible name
                guild.roles.forEach((member) => {
                    if (!member.mentionable) {
                        return;
                    }

                    checkMatch(member.name, member);
                });

                // if a partial match was found, return the match and the unmatched trailing characters
                if (bestMatch) {
                    return bestMatch.toString() + reference.substring(matchLength);
                }

                return match;

            }).replace(/:(\w+):/g, (match, ident) => {
                // :emoji: => mention, case sensitively
                const emoji = guild.emojis.find(x => x.name === ident && x.requiresColons);

                if (emoji) {
                    return emoji;
                }

                return match;
            });

            patternMap.withMentions = withMentions;

            // Add bold formatting:
            // Use custom formatting from config / default formatting with bold author
            const withAuthor = Bot.substitutePattern(this.formatDiscord, patternMap);

            logger.debug('Sending message to Discord', withAuthor, channelKey, '->', `#${discordChannel.name}`);

            discordChannel.send(withAuthor);

        } // if
    }

    /* Sends a message to Discord exactly as it appears */
    sendExactToDiscord(channelKey, text) {
        if (!this.discord || !this.discordReady || !channelKey) {
            return false;
        }

        if (typeof this.channels[channelKey] != 'undefined' && typeof this.channels[channelKey]['channelDiscord'] != 'undefined') {

            var discordChannel = this.getDiscordChannelById(this.channels[channelKey]['channelDiscord']);

            if (!discordChannel) {
                return false;
            }

            logger.debug('Sending special message to Discord', text, channelKey, '->', `#${discordChannel.name}`);

            discordChannel.send(text);
        }
    }

    /* Sends a message to IRC exactly as it appears */
    sendExactToIRC(channelKey, text) {
        if (!this.ircClient || !this.ircReady || !channelKey) {
            return false;
        }

        if (typeof this.channels[channelKey] != 'undefined' && typeof this.channels[channelKey]['channelIrc'] != 'undefined') {

            var ircChannel = this.channels[channelKey]['channelIrc'];

            logger.debug('Sending special message to IRC', text, '->', ircChannel);

            this.ircClient._updateMaxLineLength();
            this.ircClient.say(ircChannel, text);
        }
    }
}

export default Bot;
