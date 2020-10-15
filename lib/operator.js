import irc from 'irc-upd';
import logger from 'winston';
import discord from 'discord.js';
import Bot from './bot';
import TextCommand from './text_command';
import Participant from './participant';
import Catalog from './catalog';
import Team from './team';
import Game from './game';
import WordCo from './word_co';
import CmdStack from './cmd_stack';
import Nouns from './nouns';
import Stats from './stats';
import Welcome from './welcome';
import ChannelAction from './channel_action';
import VoteOperator from './vote';
import PageView from './page_view';
import TimeUtils from './utils/time';

import OpAbout from './op_about.js';
import OpCommand from './op_command.js';
import OpJoin from './op_join.js';
import OpLeave from './op_leave.js';
import OpAddPlayer from './op_addplayer.js';
import OpDelPlayer from './op_delplayer.js';
import OpRename from './op_rename.js';
import OpAddRandom from './op_addrandom.js';
import OpLva from './op_lva.js';
import OpList from './op_list.js';
import OpAvgPick from './op_avgpick.js';
import OpDeltag from './op_deltag.js';
import OpTag from './op_tag.js';
import OpHere from './op_here.js';
import OpWelcome from './op_welcome.js';
import OpCaptain from './op_captain.js';
import OpSetCaptain from './op_setcaptain.js';
import OpUnsetCaptain from './op_unsetcaptain.js';
import OpTeams from './op_teams.js';
import OpUnvote from './op_unvote.js';
import OpVote from './op_vote.js';
import OpCaptainForce from './op_captainforce.js';
import OpTurn from './op_turn.js';
import OpPick from './op_pick.js';
import OpLast from './op_last.js';
import OpReset from './op_reset.js';
import OpFullReset from './op_fullreset.js';
import OpAddHistory from './op_addhistory.js';
import OpDelHistory from './op_delhistory.js';
import OpCreatePug from './op_createpug.js';
import OpDeletePug from './op_deletepug.js';
import OpAddCmd from './op_addcmd.js';
import OpDelCmd from './op_delcmd.js';
import OpSay from './op_say.js';
import OpUserInfo from './op_userinfo.js';
import OpPm from './op_pm.js';
import OpNotice from './op_notice.js';
import OpNoun from './op_noun.js';
import OpAuthLevel from './op_authlevel.js';
import OpGrant from './op_grant.js';
import OpDelGrant from './op_delgrant.js';
import OpGrantList from './op_grantlist.js';
import OpChannelList from './op_channellist.js';
import OpBan from './op_ban.js';
import OpBanDef from './op_bandef.js';
import OpDelBan from './op_delban.js';
import OpBanList from './op_banlist.js';
import OpDiscord from './op_discord.js';
import OpMention from './op_mention.js';
import OpRules from './op_rules.js';
import OpRule from './op_rule.js';
import OpStats from './op_stats.js';
import OpTrend from './op_trend.js';
import OpMyStats from './op_mystats.js';
import OpGetStat from './op_getstat.js';
import OpQuit from './op_quit.js';
import OpRestart from './op_restart.js';
import OpPid from './op_pid.js';
import OpEatStats from './op_eatstats.js';
import OpFlushStats from './op_flushstats.js';
import OpLimitNoCapt from './op_limitnocapt.js';
import OpConfigPugSet from './op_pugconfigset.js';
import OpConfigPugGet from './op_pugconfigget.js';
import OpDelTimeout from './op_deltimeout';

class Operator {
    constructor(botRef, options) {

        this.botRef = botRef;
        this.msgRef = botRef.msgRef;
        this.txtRef = new TextCommand(this);

        this.cats = [];
        // !! this.cats.push(new Catalog("ctf", 4, 2));
        // !! this.cats.push(new Catalog("ctf", 6, 2));
        // !! this.cats.push(new Catalog("tdm", 4, 2));

        this.actions = [];
        this.actionsList = [];

        this.nounRef = new Nouns();
        this.welcomeRef = new Welcome(this);
        
        this.statsRef = new Stats(this);
        this.statsRef.createStructure();

        this.playerInactivitySeconds = 60 * 60 * 4;
        this.quickpugInactivitySeconds = 60 * 60;

        this.currentCmd = null;
        this.cStk = null;
        this.partRef = null;
        this.privPartRef = null;

        this.ident = options.ident ? options.ident : "bot";
        this.options = options;

        this.htmlPagePath = options.htmlPagePath;
        this.htmlPageUrl = options.htmlPageUrl;

        this.authUsers = {};
        this.banUsers = {};
        this.textCommands = {};

        this.defaultPugSettings = options.defaultPugSettings = { };
        
        this.cmds = {
            'about' : {
                'alt' : ['git'], 'auth' : 0, 'inst' : new OpAbout(this), 'banable' : false,
                'info' : 'Show bot information. Usage: !about'
            },
            'command' : {
                'alt' : ['commands'], 'auth' : 0, 'inst' : new OpCommand(this), 'banable' : false,
                'info' : 'Shows commands or command details. Usage: !command [command]'
            },
            'join' : {
                'alt' : ['a', 'j', 'add', 'join'], 'auth' : 0, 'inst' : new OpJoin(this), 'banable' : true,
                'info' : 'Join to pug. Usage: !join [pug]'
            },
            'addplayer' : {
                'auth' : 10, 'inst' : new OpAddPlayer(this), 'banable' : false,
                'info' : 'Add player to pug. Usage: !addplayer [pug] playername'
            },
            'delplayer' : {
                'auth' : 10, 'inst' : new OpDelPlayer(this), 'banable' : false,
                'info' : 'Remove player from pug. Usage: !delplayer [pug] playername'
            },
            'rename' : {
                'alt' : [ 'replaceplayer', 'playerreplace' ], 'auth' : 10, 'inst' : new OpRename(this), 'banable' : false,
                'info' : 'Replace player in pug by someone else. Usage: !rename [pug] player newPlayer'
            },
            'addrandom' : {
                'auth' : 10, 'inst' : new OpAddRandom(this), 'banable' : false,
                'info' : 'Adds random players to pug. Usage: !addrandom [pug] [playersCount] [tag]'
            },
            'addcustom' : {
                'auth' : 10, 'inst' : new OpAddRandom(this), 'banable' : false,
                'info' : 'Adds custom imaginary player to pug. Usage: !addrandom [pug] playername [tag]'
            },
            'leave' : {
                'alt' : ['l'], 'auth' : 0, 'inst' : new OpLeave(this), 'banable' : false,
                'info' : 'Leave pug. Usage: !leave [pug]'
            },
            'lva' : {
                'auth' : 0, 'inst' : new OpLva(this), 'banable' : false,
                'info' : 'Leave all pugs you joined. Usage: !lva'
            },
            'list' : {
                'alt' : ['ls', 'lsall', 'liast', 'listall', 'liastall'], 'auth' : 0, 'inst' : new OpList(this), 'banable' : false,
                'info' : 'List all players which are joined to the pug. Usage: !list [pug]'
            },
            'avgpick' : {
                'alt' : ['avgpickspec'], 'auth' : 0, 'inst' : new OpAvgPick(this), 'banable' : false,
                'info' : 'Display avg picks of players which are joined to the pug. Usage: !avgpick [pug]'
            },
            'tag' : {
                'auth' : 0, 'inst' : new OpTag(this), 'banable' : false,
                'info' : 'Add specific tag to your nick in pug. May use only alphanumeric characters. Usage: !tag [pug] value'
            },
            'deltag' : {
                'auth' : 0, 'inst' : new OpDeltag(this), 'banable' : false,
                'info' : 'Remove tag from nick. Usage: !deltag [pug]'
            },
            'here' : {
                'auth' : 0, 'inst' : new OpHere(this), 'banable' : false,
                'info' : 'Refresh your time information to prevent being kicked from inactivity. Usage: !here'
            },
            'welcome' : {
                'auth' : 10, 'inst' : new OpWelcome(this), 'banable' : false,
                'info' : 'Send welcome message to user. Usage: !welcome playername'
            },
            'captain' : {
                'auth' : 0, 'inst' : new OpCaptain(this), 'banable' : false,
                'info' : 'Force yourself to become captain (May use only when pug is filled). Usage: !captain'
            },
            'setcaptain' : {
                'auth' : 10, 'inst' : new OpSetCaptain(this), 'banable' : false,
                'info' : 'Force someone else to become captain (May use only when pug is filled). Usage: !setcaptain playername [color]'
            },
            'unsetcaptain' : {
                'auth' : 10, 'inst' : new OpUnsetCaptain(this), 'banable' : false,
                'info' : 'Unset captain on some team and roll another one. Usage: !unsetcaptain color'
            },
            'teams' : {
                'auth' : 0, 'inst' : new OpTeams(this), 'banable' : false,
                'info' : 'Show teams during player picks. Usage: !teams'
            },
            'vote' : {
                'auth' : 0, 'inst' : new OpVote(this), 'banable' : false,
                'info' : 'Vote for somebody to become a captain (May use only when pug is filled). Usage: !vote playername'
            },
            'unvote' : {
                'auth' : 0, 'inst' : new OpUnvote(this), 'banable' : false,
                'info' : 'Remove your votes. Usage: !unvote'
            },
            'captainforce' : {
                'auth' : 10, 'inst' : new OpCaptainForce(this), 'banable' : false,
                'info' : 'Skip waiting and force random captain choose. Usage: !captainforce'
            },
            'turn' : {
                'auth' : 0, 'inst' : new OpTurn(this), 'banable' : false,
                'info' : 'Display which captain is currently picking players. Usage: !turn'
            },
            'pick' : {
                'alt' : ['p', 'promote', 'pall', 'promoteall'], 'auth' : 0, 'inst' : new OpPick(this), 'banable' : false,
                'info' : 'Pick player to your team (May use only captain). Usage: !pick playername|playernumber'
            },
            'last' : {
                'alt' : [
                    'lastall', 'lastt', 'lasttt', 'lastttt',
                    'plast', 'plastall', 'plastt', 'plasttt', 'plastttt',
                    'mylast', 'mylastall', 'mylastt', 'mylasttt', 'mylastttt'
                ],
                'auth' : 0, 'inst' : new OpLast(this), 'banable' : false,
                'info' : 'Display last filled pug. Usage: !last [historycount]'
            },
            'reset' : {
                'auth' : 10, 'inst' : new OpReset(this), 'banable' : false,
                'info' : 'Reset pug to player picking and captain picking. Usage: !reset [pug]'
            },
            'fullreset' : {
                'auth' : 10, 'inst' : new OpFullReset(this), 'banable' : false,
                'info' : 'Reset pug to zero players. Usage: !fullreset [pug]'
            },
            'addhistory' : {
                'auth' : 10, 'inst' : new OpAddHistory(this), 'banable' : false,
                'info' : 'Add pug history entry. Usage: !addhistory [pug] [time] [player1] [player2] [player3] ...'
            },
            'delhistory' : {
                'auth' : 10, 'inst' : new OpDelHistory(this), 'banable' : false,
                'info' : 'Delete specified history entry. Usage: !delhistory number'
            },
            'createpug' : {
                'auth' : 10, 'inst' : new OpCreatePug(this), 'banable' : false,
                'info' : 'Create pug. Usage: !createpug pugName playersCount [teamsCount]'
            },
            'quickpug' : {
                'auth' : 0, 'inst' : new OpCreatePug(this), 'banable' : false,
                'info' : 'Create quickpug (Non-admin players are allowed to create one quickpug). Usage: !quickpug pugName playersCount [teamsCount]'
            },
            'deletepug' : {
                'alt' : ['delpug'], 'auth' : 0, 'inst' : new OpDeletePug(this), 'banable' : false,
                'info' : 'Delete pug (Non-admin players are allowed to delete only quickpug which they created). Usage: !deletepug pugName'
            },
            'ban' : {
                'auth' : 10, 'inst' : new OpBan(this), 'banable' : false,
                'info' : 'Ban user. For irc users when using MASK the "playername" represents ban key. Usage: !ban [playername|key] [reason:specified reason] [dur:ban duration in hours] [mask:irc host mask as regex]'
            },
            'bandef' : {
                'auth' : 10, 'inst' : new OpBanDef(this), 'banable' : false,
                'info' : 'Show ban definition - return ban command for possible update. Usage: !bandef [playername|key]'
            },
            'delban' : {
                'auth' : 10, 'inst' : new OpDelBan(this), 'banable' : false,
                'info' : 'Delete ban. Usage: !delban [playername|key]'
            },
            'banlist' : {
                'auth' : 0, 'inst' : new OpBanList(this), 'banable' : false,
                'info' : 'Show banned users.'
            },
            'discord' : {
                'alt' : ['discord_auth'], 'auth' : 0, 'inst' : new OpDiscord(this), 'banable' : false,
                'info' : 'List available discord players. Usage: !discord'
            },
            'mention' : {
                'auth' : 0, 'inst' : new OpMention(this), 'banable' : false,
                'info' : 'Mention and highlight user. Usage: !mention playername'
            },
            'rules' : {
                'auth' : 0, 'inst' : new OpRules(this), 'banable' : false,
                'info' : 'Show rules. Usage: !rules'
            },
            'rule' : {
                'auth' : 0, 'inst' : new OpRule(this), 'banable' : false,
                'info' : 'Show specific rule. Usage !rule number'
            },
            'stats' : {
                'auth' : 0, 'inst' : new OpStats(this), 'banable' : false,
                'info' : 'Display pug statistics of specific player. Usage: !stats [pug] playername'
            },
            'mystats' : {
                'auth' : 0, 'inst' : new OpMyStats(this), 'banable' : false,
                'info' : 'Display your own statistics. Usage: !mystats'
            },
            'trend' : {
                'auth' : 0, 'inst' : new OpTrend(this), 'banable' : false,
                'info' : 'Display daily pug filling trend. Usage: !trend [pug]'
            },
            'getstat' : {
                'auth' : 0, 'inst' : new OpGetStat(this), 'banable' : false,
                'info' : ''
            },
            'userinfo' : {
                'alt' : ['userinfo2'], 'auth' : 0, 'inst' : new OpUserInfo(this), 'banable' : false,
                'info' : 'Display user info. Usage: !userinfo playername'
            },
            'authlevel' : {
                'auth' : 0, 'inst' : new OpAuthLevel(this), 'banable' : false,
                'info' : 'Display your auth-level. Usage: !authlevel'
            },
            'grant' : {
                'auth' : 10, 'inst' : new OpGrant(this), 'banable' : false,
                'info' : 'Set auth-level to some user. Use negative values to ban. Usage: !grant playername authLevel'
            },
            'delgrant' : {
                'auth' : 10, 'inst' : new OpDelGrant(this), 'banable' : false,
                'info' : 'Remove user from grant table. Usage: !delgrant playername'
            },
            'grantlist' : {
                'auth' : 10, 'inst' : new OpGrantList(this), 'banable' : false,
                'info' : 'List granted users. Usage: !grantlist'
            },
            'channellist' : {
                'auth' : 10, 'inst' : new OpChannelList(this), 'banable' : false,
                'info' : 'List configured channels and display channelKey of current channel. Usage: !channellist'
            },
            'addcmd' : {
                'auth' : 10, 'inst' : new OpAddCmd(this), 'banable' : false,
                'info' : 'Add text command. Usage: !addcmd [command] [text]'
            },
            'delcmd' : {
                'auth' : 10, 'inst' : new OpDelCmd(this), 'banable' : false,
                'info' : 'Remove text command. Usage: !delcmd [command]'
            },
            'say' : {
                'auth' : 10, 'inst' : new OpSay(this), 'banable' : false,
                'info' : 'Say message. Usage: !say [message]'
            },
            'quit' : {
                'auth' : 10, 'inst' : new OpQuit(this), 'banable' : false,
                'info' : 'Quit bot.'
            },
            'restart' : {
                'auth' : 10, 'inst' : new OpRestart(this), 'banable' : false,
                'info' : 'Restart bot.'
            },
            'limitnocapt' : {
                'auth' : 10, 'inst' : new OpLimitNoCapt(this), 'banable' : false,
                'info' : 'NoCapt tag limitation.'
            },
            'setpugconfig' : {
                'auth' : 10, 'inst' : new OpConfigPugSet(this), 'banable' : false,
                'info' : 'Sets PickupGame Configuration.'
            },
            'getpugconfig' : {
                'auth' : 10, 'inst' : new OpConfigPugGet(this), 'banable' : false,
                'info' : 'Get PickupGame Configuration.'
            },
            'deltimeout' : {
                'auth' : 10, 'inst' : new OpDelTimeout(this), 'banable' : false,
                'info' : 'Expiring Timeout.'
            },
        };

        this.loadState();
        this.welcomeRef.loadState();
        this.logicLoopTick();

        this.htmlLoopInt = setInterval(() => {

            if (this.botRef.isReady() && this.htmlPagePath) {

                var pRef = new PageView(this);
                pRef.doCompose();

            }

        }, 60 * 1000);
    }

    doQuit() {
        if (this.logicLoopInt) {
            clearTimeout(this.logicLoopInt);
        }

        if (this.htmlLoopInt) {
            clearInterval(this.htmlLoopInt);
        }

        // !! this.saveState();
    }

    toJSON_conf() {
        var result = {
            "cats" : [],
            "authUsers" : this.authUsers,
            "banUsers" : this.banUsers,
            "textCommands" : this.textCommands,
            "extraSettings": this.extraSettings
        };

        this.cats.forEach((catRef) => {
            result["cats"].push(catRef.toJSON());
        });

        return result;
    }

    fromJSON_conf(input) {
        var key, cPartRef;

        this.authUsers = {};

        if (input["authUsers"]) {
            for (key in input["authUsers"]) {
                this.authUsers[key] = input["authUsers"][key];
            }

        } else if (this.options.authUsers) {
            for (key in this.options.authUsers) {
                this.authUsers[key] = this.options.authUsers[key];
            }
        }

        this.banUsers = {};

        if (input["banUsers"]) {
            for (key in input["banUsers"]) {
                this.banUsers[key] = input["banUsers"][key];

                if (this.banUsers[key]['partRef']) {
                    this.banUsers[key]['partRef'] = Participant.fromJSON(this.banUsers[key]['partRef']);
                }
            }

        } else if (this.options.banUsers) {
            for (key in this.options.banUsers) {
                this.banUsers[key] = this.options.banUsers[key];

                if (this.banUsers[key]['partRef']) {
                    this.banUsers[key]['partRef'] = Participant.fromJSON(this.banUsers[key]['partRef']);
                }
            }
        }

        this.cats = [];

        if (input["cats"] && Array.isArray(input["cats"])) {
            input["cats"].forEach((c) => {
                this.cats.push(Catalog.fromJSON(c));
            });

        } else if (this.options.cats && Array.isArray(this.options.cats)) {
            this.options.cats.forEach((c) => {
                this.cats.push(Catalog.fromJSON(c));
            });
        }

        this.textCommands = {};

        if (input["textCommands"]) {
            for (key in input["textCommands"]) {
                this.textCommands[key] = input["textCommands"][key];
            }

        } else if (this.options.textCommands) {
            for (key in this.options.textCommands) {
                this.textCommands[key] = this.options.textCommands[key];
            }
        }
    }

    toJSON() {
        var result = {
            "actionsList" : []
        };

        this.actionsList.forEach((acRef) => {

            result["actionsList"].push(acRef.toJSON());

        });
        
        return result;
    }

    fromJSON(input) {

        [].forEach((c) => {
            if (typeof input[c] != 'undefined') {
                this[c] = input[c];
            }
        });

        if (typeof input["actionsList"] != 'undefined' && Array.isArray(input["actionsList"])) {
            input["actionsList"].forEach((c) => {

                var acRef = ChannelAction.fromJSON(this, c);

                if (typeof this.botRef.channels[acRef.channelKey] != 'undefined') {

                    this.actionsList.push(acRef);
                    this.actions[acRef.channelKey] = acRef;

                }
            });
        }
    }

    saveState() {
        var fs = require('fs');
        var jsonStr = JSON.stringify(this.toJSON(), null, 2);

        fs.writeFileSync("persistent.json", jsonStr);
        
        jsonStr = JSON.stringify(this.toJSON_conf(), null, 2);

        fs.writeFileSync("config_live.json", jsonStr);
        
        if (this.htmlPagePath) {

            var pRef = new PageView(this);
            pRef.doCompose();

        }
    }

    loadState() {
        var fs = require('fs'), data, dt;

        if (fs.existsSync("persistent.json") && (data = fs.readFileSync('persistent.json', 'utf8')) != false && (dt = JSON.parse(data))) {

            this.fromJSON(dt);

        }

        if (fs.existsSync("config_live.json") && (data = fs.readFileSync('config_live.json', 'utf8')) != false && (dt = JSON.parse(data))) {

            this.fromJSON_conf(dt);

        } else {

            this.fromJSON_conf({});

        }

        this.loadActions();
    }

    getAction(channelKey) {
        if (this.actions[channelKey]) {
            return this.actions[channelKey];
            
        } else {
            return this.actionsList[0];
        }
    }

    loadActions() {
        for (var chk in this.botRef.channels) {
            if (!this.actions[chk]) {

                var acRef = new ChannelAction(this, chk);

                this.actions[chk] = acRef;
                this.actionsList.push(acRef);

            }
        }
    }

    nickChange(type, oldNick, newNick) {
        this.cats.forEach((catRef) => {

            catRef.nickChange(type, oldNick, newNick);

        });
    }

    userActivityEvent(partRef) {
        this.cats.forEach((catRef) => {

            let fndPartRef = catRef.getParticipantNickOrForceIndex(partRef.nick);

            if (fndPartRef) {
                fndPartRef.refreshTime();
            }

        });
    }

    joinEvent(cPartRef) {
        if (this.welcomeRef != null) {
            
            this.welcomeRef.sendWelcomeMessage(cPartRef);

        }
    }

    leaveEvent(channelKey, partRef, reason) {
        if (!channelKey) {
            this.botRef.getChannelKeys().forEach((cChannelKey) => {

                this.supplyCommandAny(cChannelKey, partRef, "lva" + (reason ? (" " + reason) : ""), false);

            });

        } else {
            this.supplyCommandAny(channelKey, partRef, "lva" + (reason ? (" " + reason) : ""), false);
        }
    }

    testBanned(cPartRef) {
        var dt = false;

        if (cPartRef.getAuthKey() && this.banUsers[cPartRef.getAuthKey()]) {
            dt = {
                'reason' : this.banUsers[cPartRef.getAuthKey()]['reason'],
                'time' : this.banUsers[cPartRef.getAuthKey()]['time'],
                'duration' : this.banUsers[cPartRef.getAuthKey()]['duration'],
                'by' : this.banUsers[cPartRef.getAuthKey()]['by'],
                'mask' : ''
            }

        } else if (cPartRef.type == 1) {
            var key, host = cPartRef.whois ? cPartRef.whois['host'] : '';

            if (!host) {
                host = '';
            }

            for (key in this.banUsers) {
                if (this.banUsers[key]['mask'] && Array.isArray(this.banUsers[key]['mask']) && this.banUsers[key]['mask'].length > 0) {
                    this.banUsers[key]['mask'].forEach((c) => {

                        var matches, regEx = new RegExp(c, 'i');

                        matches = regEx.exec(host);

                        if (matches) {
                            dt = {
                                'reason' : this.banUsers[key]['reason'],
                                'time' : this.banUsers[key]['time'],
                                'duration' : this.banUsers[key]['duration'],
                                'by' : this.banUsers[key]['by'],
                                'mask' : c
                            };
                        }

                    });
                }
            }
        }

        return dt;
    }

    anyCats(channelKey) {
        return this.getCatsInChannel(channelKey).length > 0;
    }

    getCatsInChannel(channelKey) {
        var chCats = [];

        this.cats.forEach((catRef) => {
            if (!channelKey || catRef.channelKey == channelKey) {
                chCats.push(catRef);
            }
        });

        return chCats;
    }

    getCatRef(channelKey, flag, fallbackChannelKey) {
        var chCats = this.getCatsInChannel(channelKey);

        if (flag) {
            var idx = 0;

            const flagToLower = flag.toLowerCase();

            while (idx < chCats.length) {
                if ((!channelKey || chCats[idx].channelKey == channelKey) && chCats[idx].flag.toLowerCase() == flagToLower) {
                    return chCats[idx];

                } else {
                    idx++;
                }
            }

        } else if (fallbackChannelKey) {

            chCats = this.getCatsInChannel(fallbackChannelKey);

            if (chCats.length == 1) {
                return chCats[0];
            }

        } else if (chCats.length == 1) {
            return chCats[0];
        }

        return null;
    }

    getCatRefByFlag(channelKey, flag) {
        var idx = 0;

        const flagToLower = flag.toLowerCase();

        while (idx < this.cats.length) {
            if ((!channelKey || this.cats[idx].channelKey == channelKey) && this.cats[idx].flag.toLowerCase() == flagToLower) {
                return this.cats[idx];

            } else {
                idx++;
            }
        }

        return null;
    }

    deleteCatRef(channelKey, flag) {
        var idx = 0;

        const flagToLower = flag.toLowerCase();

        while (idx < this.cats.length) {
            if ((!channelKey || this.cats[idx].channelKey == channelKey) && this.cats[idx].flag.toLowerCase() == flagToLower) {
                while (idx < this.cats.length - 1) {
                    this.cats[idx] = this.cats[idx + 1];
                    idx++;
                }

                this.cats.pop();
                idx = this.cats.length;
            }

            idx++;
        }
    }

    getCatRefByCreator(partRef) {
        var idx = 0;
        
        while (idx < this.cats.length) {
            if (this.cats[idx].creatorPartRef != null && this.cats[idx].creatorPartRef.compareEqual(partRef)) return this.cats[idx];
            else idx++;
        }

        return null;
    }

    // setLimitNoCaptTag(maxNoCapt) {
    //     this.limitNoCaptTag = maxNoCapt;
    // }

    getCmdAuth(channelKey, cmd, flag = 'auth') {
        for (var key in this.cmds) {
            if (typeof this.cmds[key][flag] == 'undefined') {
                // none ...

            } else if (key == cmd) {
                return {
                    'result' : this.cmds[key][flag],
                    'banable' : this.cmds[key]['banable'],
                    'exist' : true
                };

            } else if (this.cmds[key]['alt']) {
                var cRes = this.cmds[key]['alt'].some((cAlt) => {
                    return cAlt == cmd;
                });

                if (cRes) {
                    return {
                        'result' : this.cmds[key][flag],
                        'banable' : this.cmds[key]['banable'],
                        'exist' : true
                    };
                }
            }
        }

        if (flag == 'auth') {
            if (this.textCommands[cmd] || this.textCommands[channelKey + '::' + cmd]) {
                return {
                    'result' : 0,
                    'banable' : false,
                    'exist' : true
                };

            } else {
                return {
                    'result' : 10,
                    'banable' : false,
                    'exist' : false
                };
            }

        } else {
            return {
                'result' : false,
                'banable' : false,
                'exist' : false
            };
        }
    }

    supplyCommand(channelKey, partRef, text, privMsg) {

        text = text.trim();

        if (text.startsWith("!") || text.startsWith(".")) {

            text = text.substr(1);

            if (this.getAction(channelKey).logicState == 0) {
                // filling the pug

                this.supplyCommandAny(channelKey, partRef, text, privMsg);

            } else if (this.getAction(channelKey).logicState == 1) {
                // picking captains

                this.supplyCommandAny(channelKey, partRef, text, privMsg);

            } else if (this.getAction(channelKey).logicState == 2) {
                // picking players

                this.supplyCommandAny(channelKey, partRef, text, privMsg);

            }

        } // if
    }

    supplyCommandAny(channelKey, partRef, text, privMsg) {

        let cStk = new CmdStack(this, text);

        partRef.getCompleted(this, (finPartRef) => {

            this.supplyCommandFn(channelKey, finPartRef, cStk, privMsg);

        });
    }

    supplyCommandFn(channelKey, partRef, cStk, privMsg) {

        let tt, cmdRef, wRef, bb, privPartRef = privMsg ? partRef : null;

        this.currentCmd = cStk.pop().toLowerCase();
        this.cStk = cStk;

        if (partRef.authLevel < 10 && (bb = this.testBanned(partRef))) {
            partRef.authLevel = 0;
        }

        if ((tt = this.getCmdAuth(channelKey, this.currentCmd)) && partRef.authLevel < tt['result']) {

            if (tt['exist']) {
                partRef.noticeMessage(this, WordCo.cre().text('Command ').texth(this.currentCmd).text(' is not allowed!'));
            }

            return false;

        } else if (tt['banable'] && bb) {

            wRef = WordCo.cre();

            if (bb['duration'] == 0) {
                wRef.text('You are premanently banned by ').texth(bb['by'].nick).text(' for: ').texth(bb['reason']);

            } else {
                wRef.text('You are banned by ').texth(bb['by'].nick).text(' for: ').texth(bb['reason']);

                if (bb['mask']) {
                    wRef.text(' (mask: ').texth(bb['mask']).text(')');
                }

                if (bb['duration'] == 0) {
                    const timeAgo = TimeUtils.timeSinceAsString(bb.time * 1000);
                    wRef.text(` (${timeAgo} ago)`);

                } else {
                    const timeRemaining = TimeUtils.timeRemainingAsString(TimeUtils.addHours((bb.time * 1000), bb.duration));
                    wRef.text(` (${timeRemaining} remaining)`);
                }
            }

            partRef.noticeMessage(this, wRef);
            return false;

        } else if (privMsg && partRef.authLevel < 10 && (tt = this.getCmdAuth(channelKey, this.currentCmd, 'allow_priv')) && !tt['result']) {

            if (tt['exist']) {
                partRef.noticeMessage(this, WordCo.cre().text('You are not allowed to send bot commands trought priv message!'));
            }

            return false;
        }

        this.partRef = partRef;
        this.privPartRef = privPartRef;

        var toFnd = this.currentCmd.toLowerCase();

        for (var cKey in this.cmds) {
            if (cKey == toFnd || (typeof this.cmds[cKey]['alt'] != 'undefined' && this.cmds[cKey]['alt'].indexOf(toFnd) >= 0)) {
                
                cmdRef = this.cmds[cKey]['inst'];
                cmdRef.exec(channelKey);

                toFnd = false;

                break;
            }
        }
        
        if (toFnd) {

            let mList = this.txtRef.getTextCommand(channelKey, toFnd);

            if (mList) {
                this.msgRef.sendMsgArrayPrep(channelKey, mList, privPartRef);
                toFnd = false;
            }

        } // if
        
        this.saveState();
    }

    logicLoopTick() {
        if (this.logicLoopInt) {
            clearTimeout(this.logicLoopInt);
            this.logicLoopInt = null;
        }

        this.logicLoopInt = setTimeout(() => {

            this.logicLoop();

        }, 1000);
    }

    logicLoop() {
        if (this.botRef.isReady()) {

            let wRef, cTime = (new Date()).getTime() / 1000;

            this.welcomeRef.doEnable();

            this.botRef.channelDisUsers.refreshKnownUsers();

            // remove inactive players

            this.cats.forEach((catRef) => {

                let toKick = catRef.getParticipantsByStamp(this.playerInactivitySeconds);

                if (toKick.length > 0) {
                    this.actionsList.forEach((acRef) => {

                        toKick.forEach((partRef) => {
                            if (acRef.gameRef != null) {

                                const isCaptainIdle = acRef.gameRef.getTeamByCaptain(toKick) != null; // todo: need to check it.
                                var sendMsg = false;

                                if (isCaptainIdle) {
                                    sendMsg = catRef.leaveParticipantCooldown(acRef.gameRef, partRef, isCaptainIdle) == 0;

                                } else {
                                    sendMsg = catRef.leaveParticipant(partRef) == 0;
                                }

                                if (sendMsg) {

                                    // msg to all
                                    this.msgRef.sendMsg(catRef.channelKey, WordCo.cre().text('Player ').texth(partRef.nick).text(' removed from ').texth(catRef.flag).text(' pug for inactivity.'));

                                }

                            }
                        });
                    });
                }

                catRef.logicLoop();

            });

            // remove bans

            let authKey, toUnset = [];

            for (authKey in this.banUsers) {
                var c = this.banUsers[authKey];

                if (c["duration"] > 0 && (cTime - c["time"]) > c["duration"] * 3600) {
                    toUnset.push(authKey);
                }
            }

            if (toUnset.length > 0) {
                toUnset.forEach((authKey) => {
                    var c = this.banUsers[authKey];

                    wRef = WordCo.cre();
                    wRef.text('Player ').texth(c['partRef'] == null ? authKey : c['partRef'].nick).text(' was unbanned.');

                    if (c['reason']) {
                        wRef.text(' Ban reason: ').texth(c['reason']);
                    }

                    this.msgRef.sendMsg(false, wRef);

                    delete this.banUsers[authKey];
                });

                this.saveState();
            }

            // remove inactive quickpugs

            var flagsRem = [];

            this.cats.forEach((catRef) => {
                if (catRef.isQuick && catRef.isEmpty() && (cTime - catRef.touchTime) > this.quickpugInactivitySeconds) {
                    flagsRem.push({
                        "flag" : catRef.flag,
                        "channelKey" : catRef.channelKey
                    });
                }
            });

            if (flagsRem.length > 0) {
                flagsRem.forEach((c) => {

                    this.deleteCatRef(c["channelKey"], c["flag"]);

                    // msg to all
                    this.msgRef.sendMsg(c["channelKey"], WordCo.cre().text('The ').texth(c["flag"]).text(' pug was removed for inactivity.'));

                });

                this.saveState();
            }

            // channel actions logic

            this.actionsList.forEach((acRef) => {

                acRef.logicLoop();

            });
        }

        this.logicLoopTick();
    }

    removePlayerFromAllOtherCatalogs(restCat, cPartRef) {
        const signedPugs = this.getCatsInChannel(false).filter(cat => cat.flag != restCat.flag && cat.isPlayer(cPartRef));

        signedPugs.forEach(catRef => {

            catRef.leaveParticipant(cPartRef);

            var acRef = this.getAction(catRef.channelKey);

            if (acRef.logicState != 0) {
                this.msgRef.sendMsg(catRef.channelKey, WordCo.cre().text('The ').texth(catRef.flag).text(' pug stopped because player ').texth(cPartRef.nick).text(' left.'));

                acRef.clearSelectCaptains();
            }

        });

        return signedPugs;
    }

    getUser(nick, callback, preferType, force, allowFromStats) {
        if (!nick) {
            callback(null);
            return false;
        }

        var subPartRef = null, idx, pref = false;

        if ((idx = nick.indexOf(":")) != -1) {
            pref = nick.substr(0, idx);

            nick = nick.substr(idx + 1);

            if (pref == 'irc') {
                subPartRef = this.botRef.channelIrcUsers.getUser(nick);

            } else if (pref == 'discord') {
                subPartRef = this.botRef.channelDisUsers.getUser(nick);
				
            } else if (pref == 'discord_id') {
				subPartRef = this.botRef.channelDisUsers.getUserId(nick);
			}

        } else if (typeof preferType != 'undefined' && preferType == 0) {
            // prefer discord

            subPartRef = this.botRef.channelDisUsers.getUser(nick);

            if (subPartRef != null && !subPartRef.isOnline()) {
                subPartRef = null;
            }

        } else if (typeof preferType != 'undefined' && preferType == 1) {
            // prefer irc

            subPartRef = this.botRef.channelIrcUsers.getUser(nick);

        }

        if (!pref && subPartRef == null) {
            if ((subPartRef = this.botRef.channelDisUsers.getUser(nick)) == null || !subPartRef.isOnline()) {

                subPartRef = this.botRef.channelIrcUsers.getUser(nick);

            }
        }

        if (subPartRef == null && allowFromStats) {
            this.statsRef.getPlayer(nick, function(row) {
                
                if (row) {
                    callback(Participant.fromStatData(row));
                }

            })

        } else if (subPartRef != null && (subPartRef.isOnline() || force)) {
            subPartRef.getCompleted(this, (cPartRef) => {

                callback(cPartRef);

            });

        } else {
            callback(null);
        }
    }

    getUserList(nickList, callback, allowFromStats) {
        this.getUserListCall(nickList, 0, [], callback, allowFromStats);
    }

    getUserListCall(nickList, idx, result, callback, allowFromStats) {
        if (idx < nickList.length) {
            this.getUser(nickList[idx], (cPartRef) => {

                if (cPartRef) {
                    result.push(cPartRef);
                }

                this.getUserListCall(nickList, idx + 1, result, callback, allowFromStats);

            }, false, false, allowFromStats);

        } else {
            callback(result);
        }
    }
}

export default Operator;