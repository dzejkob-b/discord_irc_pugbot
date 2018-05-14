import irc from 'irc-upd';
import logger from 'winston';
import discord from 'discord.js';
import Bot from './bot';
import Participant from './participant';
import Catalog from './catalog';
import Team from './team';
import Game from './game';
import WordCo from './word_co';
import CmdStack from './cmd_stack';
import Nouns from './nouns';
import Stats from './stats';
import {formatFromDiscordToIRC, formatFromIRCToDiscord} from './formatting';
import {secsAgoFormat} from './helpers';


class Operator {
    constructor(botRef, options) {

        this.botRef = botRef;

        this.cats = [];
        // !! this.cats.push(new Catalog("ctf", 4, 2));
        // !! this.cats.push(new Catalog("ctf", 6, 2));
        // !! this.cats.push(new Catalog("tdm", 4, 2));

        this.logicState = 0;

        this.captainTick = 0;
        this.captainForce = false;
        this.captainForcePicked = false;

        this.gameRef = null;
        this.gameHistory = [];

        this.nounRef = new Nouns();
        this.statsRef = new Stats(this);
        this.statsRef.createStructure();

        this.playerInactivitySeconds = 60 * 60 * 4;
        this.quickpugInactivitySeconds = 60 * 60;
        this.captainPickSeconds = 15;

        this.ident = options.ident ? options.ident : "bot";
        this.options = options;

        this.authUsers = {};
        this.banUsers = {};
        this.textCommands = {};

        this.cmds = {
            'help' : { 'auth' : 0, 'info' : 'Shows help information. Usage: !help [command]' },
            'join' : { 'alt' : ['a', 'j', 'add', 'join'], 'auth' : 0, 'info' : 'Join to pug. Usage: !join [pug]' },
            'addplayer' : { 'auth' : 10, 'info' : 'Add player to pug. Usage: !addplayer [pug] playername' },
            'delplayer' : { 'auth' : 10, 'info' : 'Remove player from pug. Usage: !delplayer [pug] playername' },
            'addrandom' : { 'auth' : 10, 'info' : 'Adds random players to pug. Usage: !addrandom [pug] [playersCount] [tag]' },
            'addcustom' : { 'auth' : 10, 'info' : 'Adds custom imaginary player to pug. Usage: !addrandom [pug] playername [tag]' },
            'leave' : { 'alt' : ['l'], 'auth' : 0, 'info' : 'Leave pug. Usage: !leave [pug]' },
            'lva' : { 'auth' : 0, 'info' : 'Leave all pugs you joined. Usage: !lva' },
            'list' : { 'alt' : ['ls', 'liast'], 'auth' : 0, 'info' : 'List all players which are joined to the pug. Usage: !list [pug]' },
            'tag' : { 'auth' : 0, 'info' : 'Add specific tag to your nick in pug. May use only alphanumeric characters. Usage: !tag [pug] value' },
            'deltag' : { 'auth' : 0, 'info' : 'Remove tag from nick. Usage: !deltag [pug]' },
            'here' : { 'auth' : 0, 'info' : 'Refresh your time information to prevent being kicked from inactivity. Usage: !here' },
            'captain' : { 'auth' : 0, 'info' : 'Force yourself to become captain (May use only when pug is filled). Usage: !captain' },
            'setcaptain' : { 'auth' : 10, 'info' : 'Force someone else to become captain (May use only when pug is filled). Usage: !setcaptain playername' },
            'teams' : { 'auth' : 0, 'info' : 'Show teams during player picks. Usage: !teams' },
            'vote' : { 'auth' : 0, 'info' : 'Vote for somebody to become a captain (May use only when pug is filled). Usage: !vote playername' },
            'captainforce' : { 'auth' : 10, 'info' : 'Skip waiting and force random captain choose. Usage: !captainforce' },
            'turn' : { 'auth' : 0, 'info' : 'Display which captain is currently picking players. Usage: !turn' },
            'pick' : { 'alt' : ['p', 'promote'], 'auth' : 0, 'info' : 'Pick player to your team (May use only captain). Usage: !pick playername|playernumber' },
            'last' : { 'alt' : ['lastt', 'lasttt', 'lastttt'], 'auth' : 0, 'info' : 'Display last filled pug. Usage: !last [historycount]' },
            'reset' : { 'auth' : 10, 'info' : 'Reset pug to player picking and captain picking. Usage: !reset [pug]' },
            'fullreset' : { 'auth' : 10, 'info' : 'Reset pug to zero players. Usage: !reset [pug]' },
            'addhistory' : { 'auth' : 10, 'info' : 'Add pug history entry. Usage: !addhistory [pug] [time] [player1] [player2] [player3] ...' },
            'createpug' : { 'auth' : 10, 'info' : 'Create pug. Usage: !createpug pugName playersCount [teamsCount]' },
            'quickpug' : { 'auth' : 0, 'info' : 'Create quickpug (Non-admin players are allowed to create one quickpug). Usage: !quickpug pugName playersCount [teamsCount]' },
            'deletepug' : { 'auth' : 0, 'info' : 'Delete pug (Non-admin players are allowed to delete only quickpug which they created). Usage: !deletepug pugName' },
            'ban' : { 'auth' : 10, 'info' : 'Ban user. Usage: !ban playername [hours]' },
            'delban' : { 'auth' : 10, 'info' : 'Delete ban. Usage: !ban playername' },
            'banlist' : { 'auth' : 0, 'info' : 'Show banned users.' },
            'rules' : { 'auth' : 0, 'info' : 'Show rules' },
            'stats' : { 'auth' : 0, 'info' : 'Display pug statistics of specific player. Usage: !stats [pug] playername' },
            'mystats' : { 'auth' : 0, 'info' : 'Display your own statistics. Usage: !mystats' },
            'getstat' : { 'auth' : 0, 'info' : '' },
            'userinfo' : { 'auth' : 0, 'info' : 'Display user info. Usage: !userinfo playername' },
            'authlevel' : { 'auth' : 0, 'info' : 'Display your auth-level. Usage: !authlevel' },
            'grant' : { 'auth' : 10, 'info' : 'Set auth-level to some user. Use negative values to ban. Usage: !grant playername authLevel' },
            'delgrant' : { 'auth' : 10, 'info' : 'Remove user from grant table. Usage: !delgrant playername' },
            'addcmd' : { 'auth' : 10, 'info' : 'Add text command. Usage: !addcmd [command] [text]' },
            'delcmd' : { 'auth' : 10, 'info' : 'Remove text command. Usage: !delcmd [command]' },
            'say' : { 'auth' : 10, 'info' : 'Say message. Usage: !say [message]' },
            'quit' : { 'auth' : 10, 'info' : 'Quit bot.' },
            'restart' : { 'auth' : 10, 'info' : 'Restart bot.' }
        };

        this.loadState();

        this.logicLoopInt = setInterval(() => {

            this.logicLoop();

        }, 1000);
    }

    doQuit() {
        if (this.logicLoopInt) {
            clearInterval(this.logicLoopInt);
        }

        //this.saveState();
    }

    toJSON_conf() {
        var result = {
            "cats" : [],
            "authUsers" : this.authUsers,
            "banUsers" : this.banUsers,
            "textCommands" : this.textCommands
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
            "cats" : [],
            "logicState" : this.logicState,
            "captainTick" : this.captainTick,
            "captainForce" : this.captainForce,
            "gameRef" : this.gameRef != null ? this.gameRef.toJSON() : null,
            "gameHistory" : []
        };

        this.gameHistory.forEach((gameRef) => {
            result["gameHistory"].push(gameRef.toJSON());
        });

        return result;
    }

    fromJSON(input) {

        ["logicState", "captainTick", "captainForce"].forEach((c) => {
            if (typeof input[c] != 'undefined') {
                this[c] = input[c];
            }
        });

        this.gameRef = input["gameRef"] ? Game.fromJSON(input["gameRef"]) : null;

        this.gameHistory = [];

        if (input["gameHistory"] && Array.isArray(input["gameHistory"])) {
            input["gameHistory"].forEach((c) => {
                this.gameHistory.push(Game.fromJSON(c));
            });
        }

        if (this.gameRef == null) {
            this.logicState = 0;
        }

    }

    saveState() {
        var fs = require('fs');
        var jsonStr = JSON.stringify(this.toJSON());

        fs.writeFile("persistent.json", jsonStr, function(err) {
        });

        jsonStr = JSON.stringify(this.toJSON_conf(), null, 2);

        fs.writeFile("config_live.json", jsonStr, function(err) {
        });
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
    }

    ircNickChange(oldNick, newNick) {
        this.cats.forEach((catRef) => {

            catRef.ircNickChange(oldNick, newNick);

        });
    }

    leaveEvent(partRef) {
        this.supplyCommandAny(partRef, "lva", false);
    }

    getCatRef(flag) {
        if (flag) {
            var idx = 0;

            while (idx < this.cats.length) {
                if (this.cats[idx].flag == flag) {
                    return this.cats[idx];

                } else {
                    idx++;
                }
            }

        } else if (this.cats.length == 1) {
            return this.cats[0];
        }

        return null;
    }

    getCatRefByFlag(flag) {
        var idx = 0;

        while (idx < this.cats.length) {
            if (this.cats[idx].flag == flag) {
                return this.cats[idx];

            } else {
                idx++;
            }
        }

        return null;
    }

    deleteCatRef(flag) {
        var idx = 0;

        while (idx < this.cats.length) {
            if (this.cats[idx].flag == flag) {
                while (idx < this.cats.length - 1) {
                    this.cats[idx] = this.cats[idx + 1];
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

    getCmdAuth(cmd, flag = 'auth') {
        for (var key in this.cmds) {
            if (typeof this.cmds[key][flag] == 'undefined') {
                // none ...

            } else if (key == cmd) {
                return this.cmds[key][flag];

            } else if (this.cmds[key]['alt']) {
                var cRes = this.cmds[key]['alt'].some((cAlt) => {
                    return cAlt == cmd;
                });

                if (cRes) {
                    return this.cmds[key][flag];
                }
            }
        }

        if (flag == 'auth') {
            return 10;
        } else {
            return false;
        }
    }

    supplyCommand(partRef, text, privMsg) {
        if (text.startsWith("!") || text.startsWith(".")) {

            text = text.substr(1);

            if (this.logicState == 0) {
                // filling the pug

                this.supplyCommandAny(partRef, text, privMsg);


            } else if (this.logicState == 1) {
                // picking captains

                this.supplyCommandAny(partRef, text, privMsg);

            } else if (this.logicState == 2) {
                // picking players

                this.supplyCommandAny(partRef, text, privMsg);

            }

        } // if
    }

    supplyCommandAny(partRef, text, privMsg) {

        let cStk = new CmdStack(this, text);

        partRef.getCompleted(this, (finPartRef) => {

            this.supplyCommandFn(finPartRef, cStk, privMsg);

        });
    }

    supplyCommandFn(partRef, cStk, privMsg) {

        let cRef, catRef, wRef, cmdName, privPartRef = privMsg ? partRef : null;
        let result;
        let teamRef;
        let currentCmd = cStk.pop();

        if (this.banUsers[partRef.getAuthKey()]) {
            partRef.noticeMessage(this, WordCo.cre().text('You are banned!'));
            return false;

        } else if (partRef.authLevel < this.getCmdAuth(currentCmd)) {
            partRef.noticeMessage(this, WordCo.cre().text('Command ').texth(currentCmd).text(' is not allowed!'));
            return false;

        } else if (privMsg && partRef.authLevel < 10 && !this.getCmdAuth(currentCmd, 'allow_priv')) {
            partRef.noticeMessage(this, WordCo.cre().text('You are not allowed to send bot commands trought priv message!'));
            return false;
        }

        switch (currentCmd) {
            case 'help' :
                if (cStk.pop()) {
                    wRef = WordCo.cre();

                    if (this.cmds[cStk.last()]) {
                        wRef.text(this.cmds[cStk.last()]['info']);

                    } else {
                        wRef.text("Command ").texth(cStk.last()).text(" not found!");
                    }

                    partRef.noticeMessage(this, wRef);

                } else {
                    var cmds = [], cmdsLines = [];

                    for (var key in this.cmds) {
                        if (partRef.authLevel >= this.getCmdAuth(key)) {
                            cmds.push('!' + key);

                            if (cmds.length >= 8) {
                                cmdsLines.push(cmds);
                                cmds = [];
                            } // if
                        }
                    }

                    if (cmds.length > 0) {
                        cmdsLines.push(cmds);
                    }

                    if (cmdsLines.length > 0) {
                        cmdsLines.forEach((cmds) => {

                            wRef = WordCo.cre();
                            wRef.text('Commands: ');

                            for (var sf = 0; sf < cmds.length; sf++) {
                                if (sf != 0) wRef.text(', ');
                                wRef.texth(cmds[sf]);
                            }

                            partRef.noticeMessage(this, wRef);

                        });
                    }

                    if (cmdsLines.length == 0) {
                        wRef = WordCo.cre();
                        wRef.text('You are not allowed to use any command!');

                        partRef.noticeMessage(this, wRef);
                    }
                }
                break;

            case 'add' :
            case 'a' :
            case 'join' :
            case 'j' :
                if (this.logicState != 0) {
                    partRef.noticeMessage(this, WordCo.cre().text('Cannot join - pug starting!'));

                } else if ((catRef = this.getCatRef(cStk.popMod())) == null) {
                    partRef.noticeMessage(this, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

                } else {
                    result = catRef.joinParticipant(partRef);

                    if (result == -1) {
                        partRef.noticeMessage(this, WordCo.cre().text('You allready joined to ').texth(catRef.flag).text(' pug!'));

                    } else if (result == -2) {
                        partRef.noticeMessage(this, WordCo.cre().text('You cannot join to ').texth(catRef.flag).text(' pug - capacity is full! (').texth(catRef.playerLimit).text(')'));

                    } else if (result == 0 || result == 1) {
                        partRef.noticeMessage(this, WordCo.cre().text('You joined to ').texth(catRef.flag).text(' pug.'));
                    }

                    if (result == 1) {
                        this.startSelectCaptains(catRef);
                    }
                }
                break;

            case 'addplayer' :
                if ((catRef = this.getCatRef(cStk.popMod())) == null) {
                    partRef.noticeMessage(this, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

                } else {
                    this.getUser(cStk.pop(), (cPartRef) => {

                        if (cPartRef == null) {
                            partRef.noticeMessage(this, WordCo.cre().text('No such player ').texth(cStk.last()).text('!'));

                        } else {
                            result = catRef.joinParticipant(cPartRef);

                            if (result == -1) {
                                partRef.noticeMessage(this, WordCo.cre().text('User ').texth(cPartRef.nick).text(' allready joined to ').texth(catRef.flag).text(' pug!'));

                            } else if (result == -2) {
                                partRef.noticeMessage(this, WordCo.cre().text('Cannot add player ').texth(cPartRef.nick).text(' - ').texth(catRef.flag).text(' pug capacity is full! (').texth(catRef.playerLimit).text(')'));

                            } else if (result == 0 || result == 1) {
                                // msg to all
                                this.sendMsg(false, WordCo.cre().text('Player ').texth(cPartRef.nick).text(' was added to ').texth(catRef.flag).text(' pug.'), privPartRef);
                            }

                            if (result == 1) {
                                this.startSelectCaptains(catRef);
                            }
                        }

                    });
                }
                break;

            case 'delplayer' :
                if ((catRef = this.getCatRef(cStk.popMod())) == null) {
                    partRef.noticeMessage(this, WordCo.cre().text('No such pug ').text(cStk.last()).text('!'));

                } else if ((cRef = catRef.getParticipantNickOrForceIndex(cStk.pop())) != null) {

                    result = catRef.leaveParticipant(cRef);

                    if (result == -1) {
                        // not contained ...

                    } else if (this.logicState == 0) {
                        // msg to all
                        this.sendMsg(false, WordCo.cre().text('Player ').texth(cRef.nick).text(' was removed from ').texth(catRef.flag).text(' pug.'), privPartRef);

                    } else {
                        // msg to all
                        this.sendMsg(false, WordCo.cre().text('The ').texth(catRef.flag).text(' pug stopped because player ').texth(cRef.nick).text(' was removed.'), privPartRef);

                        this.logicState = 0;
                    }

                } else {
                    partRef.noticeMessage(this, WordCo.cre().text('No such player ').texth(cStk.last()).text(' in ').texth(catRef.flag).texth(' pug!'));
                }
                break;

            case 'addrandom' :
            case 'addcustom' :
                if (this.logicState != 0) {
                    partRef.noticeMessage(this, WordCo.cre().text('Cannot add random player - pug starting!'));

                } else if ((catRef = this.getCatRef(cStk.popMod())) == null) {
                    partRef.noticeMessage(this, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

                } else {
                    var numCnt = 1;
                    var randNick = currentCmd == 'addcustom' ? cStk.pop() : '';

                    if (currentCmd == 'addrandom') {
                        numCnt = !isNaN(parseInt(cStk.pop())) ? parseInt(cStk.last()) : 1;
                        if (numCnt < 1) numCnt = 1;
                    }

                    var uTag = cStk.pop() ? cStk.last() : '';

                    if (uTag.length > 20) uTag = uTag.substr(0, 20);
                    if ((new RegExp("^[a-zA-Z]{1}[a-zA-Z0-9]{0,19}$")).test(uTag) == false) uTag = '';

                    if (currentCmd == 'addcustom') {
                        cRef = new Participant({ "author" : randNick, "channel" : false });
                        cRef.id = randNick;
                        cRef.tag = uTag;

                        if ((result = catRef.joinParticipant(cRef)) == 0 || result == 1) {
                            partRef.noticeMessage(this, WordCo.cre().text('Custom player ').texth(cRef.nick).text(' was added to ').texth(catRef.flag).text(' pug.'));
                        }

                    } else {
                        do {
                            randNick = this.nounRef.getNoun();

                            cRef = new Participant({ "author" : randNick, "channel" : false });
                            cRef.id = randNick;
                            cRef.tag = uTag;

                            if ((result = catRef.joinParticipant(cRef)) == 0 || result == 1) {
                                partRef.noticeMessage(this, WordCo.cre().text('Random player ').texth(cRef.nick).text(' was added to ').texth(catRef.flag).text(' pug.'));
                            }

                            numCnt--;

                        } while (numCnt > 0 && result == 0);
                    }

                    if (result == -1) {
                        partRef.noticeMessage(this, WordCo.cre().text('User ').texth(cRef.nick).text(' allready joined to ').texth(catRef.flag).text(' pug!'));

                    } else if (result == -2) {
                        partRef.noticeMessage(this, WordCo.cre().text('Cannot join ').texth(cRef.nick).text(' - ').texth(catRef.flag).text(' pug capacity is full! (').texth(catRef.playerLimit).text(')'));
                    }

                    if (result == 1) {
                        this.startSelectCaptains(catRef);
                    }
                }
                break;

            case 'leave' :
            case 'l' :
                if ((catRef = this.getCatRef(cStk.popMod())) == null) {
                    partRef.noticeMessage(this, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

                } else {
                    result = catRef.leaveParticipant(partRef);

                    if (result == -1) {
                        // not contained ...

                    } else if (this.logicState == 0) {
                        partRef.noticeMessage(this, WordCo.cre().text('You left the ').texth(catRef.flag).text(' pug.'));

                    } else {
                        // msg to all
                        this.sendMsg(false, WordCo.cre().text('The ').texth(catRef.flag).text(' pug stopped because player ').texth(partRef.nick).text(' left.'), privPartRef);

                        this.logicState = 0;
                    }
                }
                break;

            case 'lva' :
                this.cats.forEach((catRef) => {
                    result = catRef.leaveParticipant(partRef);

                    if (result == -1) {
                        // not contained ...

                    } else if (this.logicState == 0) {
                        partRef.noticeMessage(this, WordCo.cre().text('You left the ').texth(catRef.flag).text(' pug.'));

                    } else {
                        // msg to all
                        this.sendMsg(false, WordCo.cre().text('The ').texth(catRef.flag).text(' pug stopped because player `').texth(partRef.nick).text(' left.'), privPartRef);

                        this.logicState = 0;
                    }
                });
                break;

            case 'list' :
            case 'ls' :
            case 'liast' :
                if (this.logicState == 2) {
                    this.sendMsg(false, this.gameRef.restCat.addStatusReadable(WordCo.cre(), true), privPartRef);

                } else if (cStk.pop() != false) {

                    if ((catRef = this.getCatRef(cStk.last())) == null) {
                        partRef.noticeMessage(this, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

                    } else {
                        this.sendMsg(false, catRef.addStatusReadable(WordCo.cre()), privPartRef);
                    }

                } else if (this.cats.length > 1) {

                    if (currentCmd == 'liast') {
                        if (this.gameHistory.length == 0) {
                            this.sendMsg(this, WordCo.cre().text('No game history.'), privPartRef);

                        } else {
                            this.sendMsg(false, this.gameHistory[0].addStatusReadable(WordCo.cre(), true), privPartRef);
                        }
                    }

                    var sf;

                    wRef = WordCo.cre();

                    for (sf = 0; sf < this.cats.length; sf++) {
                        if (sf != 0) wRef.sep();
                        this.cats[sf].addStatusReadableShort(wRef);
                    }

                    this.sendMsg(false, wRef, privPartRef);

                } else if ((catRef = this.getCatRef(false)) != null) {

                    if (currentCmd == 'liast') {
                        if (this.gameHistory.length == 0) {
                            this.sendMsg(this, WordCo.cre().text('No game history.'), privPartRef);

                        } else {
                            this.sendMsg(false, this.gameHistory[0].addStatusReadable(WordCo.cre(), true), privPartRef);
                        }
                    }

                    this.sendMsg(false, catRef.addStatusReadable(WordCo.cre()), privPartRef);
                }
                break;

            case 'deltag' :
                if ((catRef = this.getCatRef(cStk.popMod())) == null) {
                    partRef.noticeMessage(this, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

                } else if ((cRef = catRef.getParticipant(partRef)) != null) {

                    cRef.setTag(false);

                    partRef.noticeMessage(this, WordCo.cre().text('Your nicktag was removed.'));

                }
                break;

            case 'tag' :
                if ((catRef = this.getCatRef(cStk.popMod())) == null) {
                    partRef.noticeMessage(this, WordCo.cre().text('No such pug ').text(cStk.last()).texth('!'));

                } else if ((cRef = catRef.getParticipant(partRef)) == null) {
                    partRef.noticeMessage(this, WordCo.cre().text('You`re not joined to ').texth(catRef.flag).text(' pug.'));

                } else {

                    var pTag = cStk.pop() ? cStk.last() : '';
                    if (pTag.length > 20) pTag = pTag.substr(0, 20);

                    if ((new RegExp("^[a-zA-Z]{1}[a-zA-Z0-9]{0,19}$")).test(pTag) == false) {
                        partRef.noticeMessage(this, WordCo.cre().text('Invalid tag value! Use only characters and numbers (max 20 characters).'));

                    } else {
                        cRef.setTag(pTag);

                        partRef.noticeMessage(this, WordCo.cre().text('Your nicktag for ').texth(catRef.flag).text(' pug changed to ').texth(pTag).text('.'));
                    }
                }
                break;

            case 'here' :
                this.cats.forEach((catRef) => {
                    if ((cRef = catRef.getParticipant(partRef)) != null) {

                        cRef.refreshTime();

                    }
                });
                break;

            case 'captain' :
                if (this.logicState == 1) {
                    if (!this.gameRef.partInGame(partRef)) {
                        partRef.noticeMessage(this, WordCo.cre().text('You not in the ').texth(this.gameRef.restCat.flag).text(' pug!'));

                    } else if (this.gameRef.getTeamByCaptain(partRef) != null) {
                        partRef.noticeMessage(this, WordCo.cre().text('You allready are captain!'));

                    } else if ((teamRef = this.gameRef.setCaptainFirstPossibleTeam(partRef)) != null) {

                        // msg to all
                        wRef = WordCo.cre();

                        wRef.text('Player ');
                        teamRef.addTextFormatted(wRef, partRef.nick, false, true);
                        wRef.text(' became captain for ');
                        teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
                        wRef.text('.');

                        this.sendMsg(false, wRef, privPartRef);

                        if (this.gameRef.getNonCaptainCount() == 0) {
                            this.captainForce = true;
                            this.captainForcePicked = true;
                        }

                    }
                }
                break;

            case 'setcaptain' :
                if (this.logicState == 1) {
                    this.getUser(cStk.pop(), (cPartRef) => {

                        if (cPartRef == null) {
                            partRef.noticeMessage(this, WordCo.cre().text('No such player ').texth(cStk.last()).text('!'));

                        } else if (!this.gameRef.partInGame(cPartRef)) {
                            partRef.noticeMessage(this, WordCo.cre().text('User ').texth(cPartRef.nick).text(' is not in ').texth(this.gameRef.restCat.flag).text(' pug!'));

                        } else if (this.gameRef.getTeamByCaptain(cPartRef) != null) {
                            partRef.noticeMessage(this, WordCo.cre().text('User ').texth(cPartRef.nick).text(' is allready a captain!'));

                        } else if ((teamRef = this.gameRef.setCaptainFirstPossibleTeam(cPartRef)) != null) {

                            // msg to all
                            wRef = WordCo.cre();

                            wRef.text('Player ');
                            teamRef.addTextFormatted(wRef, cPartRef.nick, false, true);
                            wRef.text(' was set as captain for ');
                            teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
                            wRef.text('.');

                            this.sendMsg(false, wRef, privPartRef);

                            // msg to specific
                            wRef = WordCo.cre();

                            wRef.text('You was set as captain for ');
                            teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
                            wRef.text(' by ');
                            wRef.texth(partRef.nick);
                            wRef.text('.');

                            cPartRef.personalMessage(this, wRef);

                            if (this.gameRef.getNonCaptainCount() == 0) {
                                this.captainForce = true;
                                this.captainForcePicked = true;
                            }

                        }

                    });
                }
                break;

            case 'teams' :
                if (this.logicState == 2) {
                    this.gameRef.teams.forEach((teamRef) => {
                        this.sendMsg(false, teamRef.addStatusReadable(WordCo.cre()), privPartRef);
                    });
                }
                break;

            case 'vote' :

                break;

            case 'captainforce' :
                if (this.logicState == 1) {

                    this.captainForce = true;

                }
                break;

            case 'turn' :
                if (this.logicState == 2) {

                    teamRef = this.gameRef.getTeamByTurn();

                    // msg to all
                    wRef = WordCo.cre();

                    teamRef.addTextFormatted(wRef, teamRef.captPartRef.nick, false, true);
                    wRef.text(' now picks');

                    this.sendMsg(false, wRef, privPartRef);

                    this.gameRef.teams.forEach((teamRef) => {
                        this.sendMsg(false, teamRef.addStatusReadable(WordCo.cre()), privPartRef);
                    });
                }
                break;

            case 'pick' :
            case 'p' :
            case 'promote' :
                if (this.logicState == 0 && (cStk.last() == 'p' || cStk.last() == 'promote')) {

                    if ((catRef = this.getCatRef(cStk.popMod())) == null) {
                        partRef.noticeMessage(this, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

                    } else if (!catRef.isFull()) {
                        // msg to all
                        this.sendMsg(false, WordCo.cre().text('Only ').texth(catRef.playerLimit - catRef.list.length, true).text(' needed for the ').texth(catRef.flag).text(' pug!'), privPartRef);
                    }

                } else if (this.logicState == 2) {

                    result = this.gameRef.doPickPlayer(partRef, cStk.pop());

                    if (result == -2) {
                        partRef.noticeMessage(this, WordCo.cre().text('Player ').texth(cStk.last()).text(' not found!'));

                    } else if (result == -1) {
                        partRef.noticeMessage(this, WordCo.cre().text('Currently picking ').texth(this.gameRef.getTeamByTurn().captPartRef.nick).text('!'));

                    } else if (result == 0) {
                        partRef.noticeMessage(this, WordCo.cre().text('You picked player ').texth(this.gameRef.lastPickPartRef.nick).text('.'));

                    } else if (result == 1) {
                        // pick turn

                        this.gameRef.teams.forEach((teamRef) => {
                            this.sendMsg(false, teamRef.addStatusReadable(WordCo.cre()), privPartRef);
                        });

                        teamRef = this.gameRef.getTeamByTurn();

                        // msg to all
                        wRef = WordCo.cre();
                        teamRef.addTextFormatted(wRef, teamRef.captPartRef.nick, false, true);
                        wRef.text(' now picks');

                        this.sendMsg(false, wRef, privPartRef);

                    } else if (result == 2) {
                        // picking finished

                        this.pickingHasFinished();

                    }
                }
                break;

            case 'last' :
            case 'lastt' :
            case 'lasttt' :
            case 'lastttt' :
                var hSteps = 0;

                if (cStk.last() == 'last') {
                    hSteps = isNaN(parseInt(cStk.pop())) ? 1 : parseInt(cStk.last());
                    if (hSteps < 1) hSteps = 1;

                } else if (cStk.last() == 'lastt') {
                    hSteps = 2;

                } else if (cStk.last() == 'lasttt') {
                    hSteps = 3;

                } else if (cStk.last() == 'lastttt') {
                    hSteps = 4;
                }

                hSteps--;

                if (hSteps >= 0 && hSteps < this.gameHistory.length) {

                    var hGameRef = this.gameHistory[hSteps];

                    // msg to all
                    this.sendMsg(false, hGameRef.addStatusReadable(WordCo.cre(), true), privPartRef);

                } else {
                    this.sendMsg(this, WordCo.cre().text('No such game history.'), privPartRef);
                }
                break;

            case 'reset' :
                if (this.logicState == 0) {
                    this.sendMsg(false, WordCo.cre().text('Cannot reset - no picking started!'), privPartRef);

                } else if ((catRef = this.getCatRef(this.gameRef.restCat.flag)) == null) {
                    this.sendMsg(false, WordCo.cre().text('No such pug ').texth(this.gameRef.restCat.flag).text('!'), privPartRef);

                } else {
                    this.startSelectCaptains(catRef, -5);

                    // msg to all
                    this.sendMsg(false, WordCo.cre().text('The picking in ').texth(catRef.flag).text(' pug was reset.'), privPartRef);
                }
                break;

            case 'fullreset' :
                if ((catRef = this.getCatRef(cStk.popMod())) == null) {
                    this.sendMsg(false, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'), privPartRef);

                } else {
                    catRef.flushParticipants();

                    this.logicState = 0;

                    // msg to all
                    this.sendMsg(false, WordCo.cre().text('The ').texth(catRef.flag).text(' pug was reset.'), privPartRef);
                }
                break;

            case 'addhistory' :
                var gameTime;

                if ((catRef = this.getCatRef(cStk.popMod())) == null) {
                    this.sendMsg(false, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'), privPartRef);

                } else if (isNaN(gameTime = parseInt(cStk.pop()))) {
                    this.sendMsg(false, WordCo.cre().text('Invalid history time!'), privPartRef);

                } else {
                    var cPlayer, addGameRef = new Game(catRef, catRef.teamCount);

                    addGameRef.timeCapt = gameTime;
                    addGameRef.timeFinished = gameTime;

                    while (cPlayer = cStk.pop()) {
                        addGameRef.addDummyPlayer(cPlayer);
                    }

                    this.gameAddToHistory(addGameRef);
                    this.saveState();

                    wRef = WordCo.cre();
                    wRef.text('History added: ');
                    addGameRef.addStatusReadable(wRef, true);

                    this.sendMsg(false, wRef, privPartRef);
                }
                break;

            case 'createpug' :
            case 'quickpug' :

                var is_quick = currentCmd == 'quickpug';
                var in_flag = cStk.pop();
                var in_players = parseInt(cStk.pop());
                var in_teams = parseInt(cStk.pop());

                if (isNaN(in_players)) in_players = 0;
                if (isNaN(in_teams)) in_teams = 2;

                if ((new RegExp("^[a-z]{1}[a-z0-9]{0,9}$")).test(in_flag) == false) {
                    partRef.noticeMessage(this, WordCo.cre().text('Invalid pug name! Use only characters and numbers (max 10 characters).'));

                } else if (in_players < 1 || in_players > 20) {
                    partRef.noticeMessage(this, WordCo.cre().text('Player count must be between 1-20!'));

                } else if ((in_teams == 0 || (in_teams >= 2 && in_teams <= 4)) == false) {
                    partRef.noticeMessage(this, WordCo.cre().text('Team count must be between 2-4 or 0!'));

                } else if (in_teams != 0 && in_players % in_teams != 0) {
                    partRef.noticeMessage(this, WordCo.cre().text('Player count must be divisible by team count!'));

                } else if (this.getCatRef(in_flag) != null) {
                    partRef.noticeMessage(this, WordCo.cre().text('Pug ').texth(in_flag).text(' allready exists!'));

                } else if (is_quick && partRef.authLevel < 10 && this.getCatRefByCreator(partRef) != null) {
                    partRef.noticeMessage(this, WordCo.cre().text('You allready have created one quick pug!'));

                } else {
                    catRef = new Catalog(in_flag, in_players, in_teams);

                    catRef.creatorPartRef = partRef;

                    if (is_quick) {
                        catRef.isQuick = true;
                        catRef.touchTime = (new Date()).getTime() / 1000;
                    }

                    this.cats.push(catRef);

                    // msg to all
                    this.sendMsg(false, WordCo.cre().text('Pug ').texth(in_flag).text(' with ').texth(in_players).text(' players and ').texth(in_teams).text(' teams was created!'), privPartRef);
                    this.sendMsg(false, WordCo.cre().text('Type .j ').texth(in_flag).text(' to join this pug.'), privPartRef);

                }
                break;

            case 'deletepug' :
                if ((catRef = this.getCatRef(cStk.popMod())) == null) {
                    partRef.noticeMessage(this, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

                } else if (catRef.isQuick == false && partRef.authLevel < 10) {
                    partRef.noticeMessage(this, WordCo.cre().text('Cannot delete pug ').texth(catRef.flag).text('!'));

                } else if (partRef.authLevel < 10 && catRef.creatorPartRef != null && !catRef.creatorPartRef.compareEqual(partRef)) {
                    partRef.noticeMessage(this, WordCo.cre().text('Cannot delete pug which you didn`t created!'));

                } else {
                    this.deleteCatRef(catRef.flag);

                    // msg to all
                    this.sendMsg(false, WordCo.cre().text('The ').texth(catRef.flag).text(' pug was deleted!'), privPartRef);
                }
                break;

            case 'addcmd' :
                if ((cmdName = cStk.pop()) == null) {
                    partRef.noticeMessage(this, WordCo.cre().text('No command specified!'));

                } else if (this.cmds[cmdName]) {
                    partRef.noticeMessage(this, WordCo.cre().text('Cannot overwrite command ').texth(cmdName).text('!'));

                } else {
                    this.textCommands[cmdName] = [];
                    this.textCommands[cmdName].push(cStk.getRestString());
                    this.saveState();

                    partRef.noticeMessage(this, WordCo.cre().text('The command ').texth(cmdName).text(' was set.'));
                }
                break;

            case 'delcmd' :
                if ((cmdName = cStk.pop()) == null) {
                    partRef.noticeMessage(this, WordCo.cre().text('No command specified!'));

                } else if (this.cmds[cmdName]) {
                    partRef.noticeMessage(this, WordCo.cre().text('Cannot delete command ').texth(cmdName).text('!'));

                } else {
                    delete this.textCommands[cmdName];
                    this.saveState();

                    partRef.noticeMessage(this, WordCo.cre().text('The command ').texth(cmdName).text(' was deleted.'));
                }
                break;

            case 'say' :
                this.sendMsg(false, WordCo.cre().text(cStk.getRestString()));
                break;

            case 'userinfo' :
                var subPartRef;

                if ((subPartRef = this.botRef.channelDisUsers.getUser(cStk.pop())) != null) {
                    subPartRef.getCompleted(this, (cPartRef) => {

                        this.sendMsg(false, WordCo.cre().text(cPartRef.readableInfo()), privPartRef);

                    });
                }

                if (((subPartRef = this.botRef.channelIrcUsers.getUser(cStk.last()))) != null) {
                    subPartRef.getCompleted(this, (cPartRef) => {

                        this.sendMsg(false, WordCo.cre().text(cPartRef.readableInfo()), privPartRef);
                        this.sendMsg(false, WordCo.cre().text('Whois: ').texth(JSON.stringify(cPartRef.whois)), privPartRef);

                    });
                }
                break;

            case 'pm' :
                this.getUser(cStk.pop(), (sPartRef) => {

                    if (sPartRef != null) {
                        sPartRef.personalMessage(this, cStk.pop());
                    }

                });
                break;

            case 'notice' :
                this.getUser(cStk.pop(), (sPartRef) => {

                    if (sPartRef != null) {
                        sPartRef.noticeMessage(this, cStk.pop());
                    }

                });
                break;

            case 'noun' :
                this.sendMsg(false, WordCo.cre().text(this.nounRef.getNoun()), privPartRef);
                break;

            case 'authlevel' :
                if (cStk.pop() == false) {
                    partRef.noticeMessage(this, WordCo.cre().text('Your auth level is: ').texth(partRef.authLevel));

                } else {
                    this.getUser(cStk.last(), (cPartRef) => {

                        if (cPartRef == null) {
                            partRef.noticeMessage(this, WordCo.cre().text('No such player ').texth(cStk.last()).text('!'));

                        } else {
                            partRef.noticeMessage(this, WordCo.cre().text('Auth level of user ').texth(cPartRef.nick).text(' is: ').texth(cPartRef.authLevel));
                        }

                    });
                }
                break;

            case 'grant' :
                this.getUser(cStk.pop(), (cPartRef) => {

                    if (cPartRef == null) {
                        partRef.noticeMessage(this, WordCo.cre().text('No such player ').texth(cStk.last()).text('!'));

                    } else {
                        var nAuthLevel = parseInt(cStk.pop());
                        if (isNaN(nAuthLevel)) nAuthLevel = 0;

                        if (cPartRef.getAuthKey() == false) {
                            partRef.noticeMessage(this, WordCo.cre().text('Cannot grant user ').texth(cPartRef.nick).text('! User dont have discord ID or irc ACCOUNT.').texth(nAuthLevel));

                        } else {
                            this.authUsers[cPartRef.getAuthKey()] = nAuthLevel;
                            this.saveState();

                            partRef.noticeMessage(this, WordCo.cre().text('Auth level of user ').texth(cPartRef.nick).text(' was set to: ').texth(nAuthLevel));
                        }
                    }
                    
                });
                break;

            case 'delgrant' :
                this.getUser(cStk.pop(), (cPartRef) => {

                    if (cPartRef == null) {
                        partRef.noticeMessage(this, WordCo.cre().text('No such player ').texth(cStk.last()).text('!'));

                    } else if (cPartRef.getAuthKey() == false || typeof this.authUsers[cPartRef.getAuthKey()] == 'undefined') {
                        partRef.noticeMessage(this, WordCo.cre().text('User ').texth(cPartRef.nick).text(' is not in grant table!'));

                    } else {
                        delete this.authUsers[cPartRef.getAuthKey()];
                        this.saveState();

                        partRef.noticeMessage(this, WordCo.cre().text('User ').texth(cPartRef.nick).text(' was removed from grant table.'));
                    }

                });
                break;

            case 'ban' :
                this.getUser(cStk.pop(), (cPartRef) => {

                    if (cPartRef == null) {
                        partRef.noticeMessage(this, WordCo.cre().text('No such player ').texth(cStk.last()).text('!'));

                    } else {
                        var nBanDuration = parseInt(cStk.pop());
                        if (isNaN(nBanDuration)) nBanDuration = 0;

                        if (cPartRef.getAuthKey() == false) {
                            partRef.noticeMessage(this, WordCo.cre().text('Cannot ban user ').texth(cPartRef.nick).text('! User dont have discord ID or irc ACCOUNT.'));

                        } else {
                            this.banUsers[cPartRef.getAuthKey()] = {
                                'time' : (new Date()).getTime() / 1000,
                                'duration' : nBanDuration,
                                'partRef' : cPartRef.getClone()
                            };

                            this.saveState();
                            this.statsRef.addUserBan(cPartRef);

                            if (nBanDuration == 0) {
                                partRef.noticeMessage(this, WordCo.cre().text('User ').texth(cPartRef.nick).text(' was banned permanently.'));

                            } else {
                                partRef.noticeMessage(this, WordCo.cre().text('User ').texth(cPartRef.nick).text(' was banned for ').texth(nBanDuration).text(' hours.'));
                            }
                        }
                    }

                });
                break;

            case 'delban' :
                this.getUser(cStk.pop(), (cPartRef) => {

                    if (cPartRef == null) {
                        partRef.noticeMessage(this, WordCo.cre().text('No such player ').texth(cStk.last()).text('!'));

                    } else if (cPartRef.getAuthKey() == false || typeof this.banUsers[cPartRef.getAuthKey()] == 'undefined') {
                        partRef.noticeMessage(this, WordCo.cre().text('User ').texth(cPartRef.nick).text(' is not banned!'));

                    } else {
                        delete this.banUsers[cPartRef.getAuthKey()];
                        this.saveState();

                        partRef.noticeMessage(this, WordCo.cre().text('User ').texth(cPartRef.nick).text(' was unbanned.'));
                    }

                });
                break;

            case 'banlist' :
                var isStart = true;

                wRef = WordCo.cre();

                if (Object.keys(this.banUsers).length == 0) {
                    wRef.text("No users banned.");

                } else {
                    for (cmdName in this.banUsers) {
                        if (isStart) {
                            isStart = false;
                        } else {
                            wRef.text(', ');
                        }

                        wRef.texth(this.banUsers[cmdName]['partRef'].readableInfo_b());

                        if (this.banUsers[cmdName]['duration'] == 0) {
                            wRef.text(' permanent ban');
                        } else {
                            wRef.text(' banned for ').texth(this.banUsers[cmdName]['duration']).text(' hours');
                        }
                    }
                }

                this.sendMsg(false, wRef, privPartRef);
                break;

            case 'rules' :
                var pos = 1, msgs = [];

                while (this.textCommands["rule" + pos]) {
                    this.textCommands["rule" + pos].forEach((msg) => {
                        msgs.push(WordCo.cre().text(msg));
                    });

                    pos++;
                }

                if (msgs.length > 0) {
                    this.sendMsgArray(false, msgs, 0, privPartRef);

                } else {
                    this.sendMsg(false, WordCo.cre().text('No rules defined!'), privPartRef);
                }
                break;

            case 'stats' :
                if ((catRef = this.getCatRef(cStk.popMod())) == null) {
                    this.sendMsg(false, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'), privPartRef);
                    
                } else {
                    this.getUser(cStk.pop(), (cPartRef) => {

                        this.statsRef.getStatsMessages(catRef.flag, cPartRef == null ? cStk.last() : cPartRef, cStk.pop(), (msgs) => {

                            if (msgs.length > 0) {
                                this.sendMsgArray(false, msgs, 0, privPartRef);
                            } else {
                                partRef.noticeMessage(this, WordCo.cre().text("No stats found."));
                            }

                        });

                    });
                }
                break;

            case 'mystats' :
                if ((catRef = this.getCatRef(cStk.popMod())) == null) {
                    this.sendMsg(false, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'), privPartRef);

                } else {
                    this.statsRef.getStatsMessages(catRef.flag, partRef, cStk.pop(), (msgs) => {

                        if (msgs.length > 0) {
                            this.sendMsgArray(false, msgs, 0, privPartRef);
                        } else {
                            partRef.noticeMessage(this, WordCo.cre().text("No stats found."));
                        }

                    });
                }
                break;

            case 'getstat' :
                /*
                var hGameRef = this.gameHistory[0];
                this.statsRef.saveGameToStats(hGameRef);
                //this.statsRef.getUser(partRef);
                */
                break;

            case 'quit' :
                this.botRef.doQuit();
                break;

            case 'restart' :
                this.botRef.doQuit(true);
                break;

            case 'pid' :
                this.sendMsg(false, WordCo.cre().text(process.pid), privPartRef);
                break;

            case 'eatstats' :
                this.statsRef.eatIni(cStk.pop(), (msg) => {

                    this.sendMsg(false, WordCo.cre().text(msg), privPartRef);

                });
                break;

            case 'flushstats' :
                this.statsRef.flushStats(() => {

                    this.sendMsg(false, WordCo.cre().text("Stats were flushed."), privPartRef);

                });
                break;

            default :
                if (this.textCommands[currentCmd] && Array.isArray(this.textCommands[currentCmd])) {
                    this.textCommands[currentCmd].forEach((msg) => {
                        this.sendMsg(false, WordCo.cre().text(msg), privPartRef);
                    });
                }
                break;
        }

        this.saveState();

    }

    startSelectCaptains(catRef, startSeconds) {

        this.gameRef = new Game(catRef, catRef.teamCount);
        
        this.logicState = 1;
        this.captainTick = startSeconds ? startSeconds : 0;
        this.captainForce = false;
        this.captainForcePicked = false;

        this.saveState();

    }

    logicLoop() {
        if (this.botRef.discordReady && this.botRef.ircReady) {

            let wRef, cTime = (new Date()).getTime() / 1000;

            this.botRef.channelDisUsers.refreshKnownUsers();

            // remove inactive players

            this.cats.forEach((catRef) => {

                let toKick = catRef.getParticipantsByStamp(this.playerInactivitySeconds);

                if (toKick.length > 0) {
                    toKick.forEach((partRef) => {

                        if (catRef.leaveParticipant(partRef) == 0) {

                            // msg to all
                            this.sendMsg(false, WordCo.cre().text('Player ').texth(partRef.nick).text(' removed from ').texth(catRef.flag).text(' pug for inactivity.'));

                        }

                    });
                }
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

                    this.sendMsg(false, WordCo.cre().text('Player ').texth(c['partRef'].nick).text(' was unbaned.'));

                    delete this.banUsers[authKey];
                });

                this.saveState();
            }

            // remove inactive quickpugs

            var flagsRem = [];

            this.cats.forEach((catRef) => {
                if (catRef.isQuick && catRef.isEmpty() && (cTime - catRef.touchTime) > this.quickpugInactivitySeconds) {
                    flagsRem.push(catRef.flag);
                }
            });

            if (flagsRem.length > 0) {
                flagsRem.forEach((c) => {

                    this.deleteCatRef(c);

                    // msg to all
                    this.sendMsg(false, WordCo.cre().text('The ').texth(c).text(' pug was removed for inactivity.'));

                });

                this.saveState();
            }


            if (this.logicState == 0) {
                // joining ...

            } else if (this.logicState == 1) {
                // captain picking

                if (this.gameRef.teams.length == 0) {

                    this.sendMsg(false, WordCo.cre().text('The ').texth(this.gameRef.restCat.flag).text(' pug has been filled!'));
                    this.sendMsg(false, this.gameRef.restCat.addStatusReadable(WordCo.cre()));
                    this.sendMsg(false, WordCo.cre().text('Pug is without teams so go server now please!'));

                    this.gameRef.getAllParticipants().forEach((cPartRef) => {

                        cPartRef.personalMessage(this, WordCo.cre().text('The ').texth(this.gameRef.restCat.flag).text(' pug has been filled! Go server now please!'));

                    });

                    this.gameHasFinished();

                    this.saveState();

                } else if (this.captainTick == 1) {

                    this.sendMsg(false, WordCo.cre().text('The ').texth(this.gameRef.restCat.flag).text(' pug has been filled!'));
                    this.sendMsg(false, this.gameRef.restCat.addStatusReadable(WordCo.cre()));

                    this.gameRef.getAllParticipants().forEach((cPartRef) => {

                        cPartRef.personalMessage(this, WordCo.cre().text('The ').texth(this.gameRef.restCat.flag).text(' pug has been filled! Please be prepared.'));

                    });

                } else if (!this.captainForce && this.captainTick == 2) {

                    this.sendMsg(false, WordCo.cre().text('Picking random captains in ').texth(this.captainPickSeconds).text(' seconds. Players tagged nocapt will be avoided. Type !captain to become a captain.'));

                } else if (!this.captainForce && this.captainPickSeconds - (this.captainTick - 2) == 5) {

                    this.sendMsg(false, WordCo.cre().text('Random captains in 5 seconds!'));

                } else if (this.captainForce || this.captainPickSeconds - (this.captainTick - 2) == 0) {

                    this.gameRef.doPickCaptains();

                    var teamRef;

                    if (!this.captainForcePicked) {

                        var idx = 0;

                        while (idx < this.gameRef.teams.length) {
                            teamRef = this.gameRef.teams[idx];

                            // channel notify
                            wRef = WordCo.cre();
                            teamRef.addTextFormatted(wRef, teamRef.captPartRef.nick, false, true);
                            wRef.text(' is captain for the ');
                            teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
                            wRef.text('.');

                            this.sendMsg(false, wRef);

                            // captain notify
                            wRef = WordCo.cre();

                            wRef.text('You are captain for ');
                            teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
                            wRef.text('.');

                            teamRef.captPartRef.personalMessage(this, wRef);

                            idx++;
                        }
                    }

                    teamRef = this.gameRef.getTeamByTurn();

                    wRef = WordCo.cre();
                    wRef.text('Captains have been picked. ');
                    teamRef.addTextFormatted(wRef, teamRef.captPartRef.nick, false, true);
                    wRef.text(' picks first. Captains type .here to prevent getting kicked.');

                    this.sendMsg(false, wRef);

                    this.logicState = 2;

                    this.saveState();

                    if (this.gameRef.restCat.isEmpty()) {
                        this.pickingHasFinished();
                    }

                }

                this.captainTick++;

            } else if (this.logicState == 2) {
                // player picking



            }

        }
    }

    pickingHasFinished() {
        if (this.logicState == 2) {

            // global msg

            let wRef;

            this.gameRef.teams.forEach((teamRef) => {
                wRef = WordCo.cre();
                teamRef.addStatusReadable(wRef);

                this.sendMsg(false, wRef);
            });

            this.sendMsg(false, WordCo.cre().text('Picking has finished.'));

            // notify participants

            this.gameRef.teams.forEach((teamRef) => {
                teamRef.catRef.list.forEach((cPartRef) => {

                    wRef = WordCo.cre();
                    wRef.text('Picking has finished. You are member of the ');
                    teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
                    wRef.text('. Go server now please!');

                    cPartRef.personalMessage(this, wRef);

                });
            });

            this.statsRef.saveGameToStats(this.gameRef);

            this.gameHasFinished();

            this.saveState();

        }
    }

    gameHasFinished() {
        if (this.logicState == 2 || this.logicState == 1) {

            this.gameRef.timeFinished = (new Date()).getTime() / 1000;

            var catRef;

            if ((catRef = this.getCatRef(this.gameRef.restCat.flag)) != null) {
                catRef.flushParticipants();

                if (catRef.isQuick) {
                    this.deleteCatRef(catRef.flag);
                }
            }

            this.gameAddToHistory(this.gameRef);

            this.logicState = 0;

        }
    }

    gameAddToHistory(addGameRef) {
        this.gameHistory.push(null);

        for (var sf = this.gameHistory.length - 1; sf > 0; sf--) {
            this.gameHistory[sf] = this.gameHistory[sf - 1];
        }

        this.gameHistory[0] = addGameRef;

        while (this.gameHistory.length > 20) {
            this.gameHistory.pop();
        }
    }

    getUser(nick, callback) {
        var subPartRef = null, idx;

        if ((idx = nick.indexOf(":")) != -1) {
            var pref = nick.substr(0, idx);

            nick = nick.substr(idx + 1);

            if (pref == 'irc') {
                subPartRef = this.botRef.channelIrcUsers.getUser(nick);

            } else if (pref == 'discord') {
                subPartRef = this.botRef.channelDisUsers.getUser(nick);
            }

        } else {
            if ((subPartRef = this.botRef.channelDisUsers.getUser(nick)) == null || !subPartRef.isOnline()) {

                subPartRef = this.botRef.channelIrcUsers.getUser(nick);

            }
        }

        if (subPartRef != null && subPartRef.isOnline()) {
            subPartRef.getCompleted(this, (cPartRef) => {

                callback(cPartRef);

            });

        } else {
            callback(null);
        }
    }

    sendMsg(channel, text, privPartRef = null) {
        if (privPartRef != null) {

            if (typeof text == 'object') {
                privPartRef.noticeMessage(this, text.getIrc());
            } else {
                privPartRef.noticeMessage(this, text);
            }

        } else if (typeof text == 'object') {
            this.botRef.sendExactToIRC(channel, text.getIrc());

            const msgStr = new discord.RichEmbed();

            msgStr.setDescription(text.getDiscord());
            msgStr.setColor([255, 0, 0]);

            this.botRef.sendExactToDiscord(channel, msgStr);

        } else {
            this.botRef.sendExactToIRC(channel, text);

            const msgStr = new discord.RichEmbed();

            msgStr.setDescription(formatFromIRCToDiscord(text));
            msgStr.setColor([255, 0, 0]);

            this.botRef.sendExactToDiscord(channel, msgStr);
        }
    }

    sendMsgArray(channel, list, idx, privPartRef = null) {
        if (privPartRef != null) {
            privPartRef.noticeMessage(this, list[idx].getIrc());

        } else {
            this.botRef.sendExactToIRC(channel, list[idx].getIrc());

            const msgStr = new discord.RichEmbed();

            msgStr.setDescription(list[idx].getDiscord());
            msgStr.setColor([255, 0, 0]);

            this.botRef.sendExactToDiscord(channel, msgStr);
        }

        if (idx + 1 < list.length) {
            setTimeout(() => {
                this.sendMsgArray(channel, list, idx + 1, privPartRef);
            }, 1000);
        }
    }
}

export default Operator;