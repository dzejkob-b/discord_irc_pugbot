import Participant from './participant';
import WordCo from './word_co';
import TimeUtils from './utils/time';

class Catalog {

    static DEFAULT_PICK_STEPS = [1, 2];
    static DEFAULT_POSSIBLE_VOTES = 1;
    static DEFAULT_CAPTAIN_IDLE_IN_SECS = 0;
    static DEFAULT_CAPTAIN_IDLE_COOLDOWN_IN_SECS = 600;
    static DEFAULT_PLAYER_REJOIN_COOLDOWN_IN_SECS = 300;
    static DEFAULT_LIMIT_NOCAPT_TAG = 0;
    static DEFAULT_AVGPICK_STATS_METHOD = 'sumarize';

    static SUBCOMMANDS = {
        'plcooldown': {
            readable: 'Player rejoin cooldown',
            key: 'playerRejoinCooldownInSecs',
            settable: true,
            minInSecs: 0,
            maxInSecs: 60
        },
        'cptcooldown': {
            readable: 'Captain idle cooldown',
            key: 'captainIdleCooldownInSecs',
            settable: true,
            minInSecs: 0,
            maxInSecs: 600,
        },
        'cptidle': {
            readable: 'Captain idle',
            key: 'captainIdleInSecs',
            settable: true
        },
        'votes': {
            readable: 'Possible captain votes',
            key: 'possibleVotes',
            settable: true
        },
        'picksteps': {
            readable: 'Player picking steps',
            key: 'pickSteps',
            settable: true
        },
        'limitnocapttag': {
            readable: 'Limit number of NoCapt tag',
            key: 'limitNoCaptTag',
            settable: true
        },
        'avgpickmth': {
            readable: 'Avg pick stats method',
            key: 'avgPickStatsMethod',
            settable: true
        }
    };

    static SubCommandsList() {
        return '[' + Object.keys(Catalog.SUBCOMMANDS).join(', ') + ']';
    }

    constructor(channelKey, flag, playerLimit, teamCount, parentCatRef, extraSettings) {

        this.channelKey = channelKey;
        this.flag = flag;
        this.playerLimit = playerLimit;
        this.teamCount = teamCount;
        this.parentCatRef = parentCatRef;
        this.creatorPartRef = null;
        this.isQuick = false;
        this.createTime = (new Date()).getTime() / 1000;
        this.touchTime = false;
        this.list = [];
        this.timeouts = [];

        this.pickSteps = Catalog.DEFAULT_PICK_STEPS;
        this.possibleVotes = Catalog.DEFAULT_POSSIBLE_VOTES;
        this.captainIdleInSecs = Catalog.DEFAULT_CAPTAIN_IDLE_IN_SECS;
        this.captainIdleCooldownInSecs = Catalog.DEFAULT_CAPTAIN_IDLE_COOLDOWN_IN_SECS;
        this.playerRejoinCooldownInSecs = Catalog.DEFAULT_PLAYER_REJOIN_COOLDOWN_IN_SECS;
        this.limitNoCaptTag = Catalog.DEFAULT_LIMIT_NOCAPT_TAG;
        this.avgPickStatsMethod = Catalog.DEFAULT_AVGPICK_STATS_METHOD;


        if (extraSettings) {
            for (var c of ['pickSteps', 'possibleVotes', 'captainIdleInSecs', 'captainIdleCooldownInSecs', 'playerRejoinCooldownInSecs', 'limitNoCaptTag', 'avgPickStatsMethod']) {
                if (typeof extraSettings[c] != 'undefined') {
                    this[c] = extraSettings[c];
                }
            }
        }
    }

    toJSON() {
        var result = {
            "channelKey" : this.channelKey,
            "flag" : this.flag,
            "playerLimit" : this.playerLimit,
            "teamCount" : this.teamCount,
            "parentCatRef" : this.parentCatRef ? this.parentCatRef.toJSON() : null,
            "creatorPartRef" : this.creatorPartRef,
            "isQuick" : this.isQuick,
            "createTime" : this.createTime,
            "touchTime" : this.touchTime,
            "list" : [],
            "timeouts" : [],
            "pickSteps" : this.pickSteps,
            "possibleVotes" : this.possibleVotes,
            "captainIdleInSecs" : this.captainIdleInSecs,
            "captainIdleCooldownInSecs" : this.captainIdleCooldownInSecs,
            "playerRejoinCooldownInSecs" : this.playerRejoinCooldownInSecs,
            "limitNoCaptTag" : this.limitNoCaptTag,
            "avgPickStatsMethod" : this.avgPickStatsMethod,
            'lastPromoteTime': this.lastPromoteTime
        };

        this.list.forEach((partRef) => {
            result["list"].push(partRef.toJSON());
        });

        this.timeouts.forEach((c) => {
            result["timeouts"].push({
                "partRef" : c["partRef"].toJSON(),
                "time" : c["time"]
            });
        });

        return result;
    }
    
    static fromJSON(input) {
        var ref = new Catalog();

        // Settings
        ["channelKey", "flag", "playerLimit", "teamCount", "isQuick", "createTime", "touchTime", "pickSteps", "possibleVotes", "captainIdleInSecs", "captainIdleCooldownInSecs", "playerRejoinCooldownInSecs", "limitNoCaptTag", "avgPickStatsMethod", 'lastPromoteTime'].forEach(c => {
            if (typeof input[c] != 'undefined') {
                ref[c] = input[c];
            }
        });

        // State
        ['lastPromoteTime'].forEach(c => {
            if (typeof input[c] != 'undefined') {
                ref[c] = input[c];
            }
        });

        ref.parentCatRef = input["parentCatRef"] ? Catalog.fromJSON(input["parentCatRef"]) : null;
        ref.creatorPartRef = input["creatorPartRef"] ? Participant.fromJSON(input["creatorPartRef"]) : null;
        ref.list = [];
        ref.timeouts = [];
        // ref.extraSettings = input["extraSettings"];

        if (typeof input["list"] != 'undefined' && Array.isArray(input["list"])) {
            input["list"].forEach((c) => {
                ref.list.push(Participant.fromJSON(c));
            });
        }

        if (typeof input["timeouts"] != 'undefined' && Array.isArray(input["timeouts"])) {
            input["timeouts"].forEach((c) => {
                ref.timeouts.push({
                    "partRef" : Participant.fromJSON(c["partRef"]),
                    "time" : c["time"]
                });
            });
        }

        return ref;
    }

    getClone() {
        var catRef = new Catalog(this.channelKey, this.flag, this.playerLimit, this.teamCount, this.parentCatRef, this.extraSettings);

        catRef.creatorPartRef = this.creatorPartRef;
        catRef.isQuick = this.isQuick;
        catRef.createTime = this.createTime;
        catRef.touchTime = this.touchTime;
        catRef.pickSteps = this.pickSteps;
        catRef.possibleVotes = this.possibleVotes;
        catRef.limitNoCaptTag = this.limitNoCaptTag;
        catRef.avgPickStatsMethod = this.avgPickStatsMethod;
        catRef.captainIdleInSecs = this.captainIdleInSecs;
        catRef.captainIdleCooldownInSecs = this.captainIdleCooldownInSecs;
        catRef.playerRejoinCooldownInSecs = this.playerRejoinCooldownInSecs;
        catRef.list = [];

        this.list.forEach((partRef) => {
            catRef.list.push(partRef);
        });

        return catRef;
    }

    setPlayerRejoinCooldown(seconds) {
        this.playerRejoinCooldownInSecs = seconds;
    }

    setCaptainIdleCooldown(seconds) {
        this.captainIdleCooldownInSecs = seconds;
    }

    setCaptainIdle(seconds) {
        this.captainIdleInSecs = seconds;
    }

    setPickSteps(steps) {
        this.pickSteps = steps;
    }

    setPossibleVotes(votes) {
        this.possibleVotes = votes;
    }

    setLimitNoCaptTag(maxNoCapt) {
        this.limitNoCaptTag = maxNoCapt;
    }

    setPromote() {
        this.lastPromoteTime = Date.now();
        this.toJSON();
    }

    canPromote() {
        return !this.lastPromoteTime || TimeUtils.lessThenInSecs(this.lastPromoteTime, 10*60);
    }

    setAvgPickStatsMethod(method) {
        this.avgPickStatsMethod = method;
    }

    refreshTouchTime() {
        this.touchTime = (new Date()).getTime() / 1000;
    }

    isFull() {
        return this.list.length >= this.playerLimit;
    }

    isEmpty() {
        return this.list.length == 0;
    }
    
    getListAvgPickSorted(limit = false) {
        var result = [], listIdx = 0;

        this.list.forEach((partRef) => {

            var brk = false;
            var idx = 0;

            while (!brk && idx < result.length) {

                var addKoef = partRef.avgTotPick ? (partRef.avgPick / partRef.avgTotPick) : 10000;
                var rKoef = result[idx]['partRef'].avgTotPick ? (result[idx]['partRef'].avgPick / result[idx]['partRef'].avgTotPick) : 10000;

                if (addKoef < rKoef) {
                    brk = true;
                } else {
                    idx++;
                }
            }

            if (brk) {
                result.splice(idx, 0, {
                    'partRef' : partRef,
                    'idx' : listIdx
                });

            } else {
                result.push({
                    'partRef' : partRef,
                    'idx' : listIdx
                });
            }
            
            listIdx++;

        });

        return result;
    }

    loadAvgPick(statsRef, method, callback) {
        
        if (!method) {
            method = statsRef.parseAvgStatMethod(this.avgPickStatsMethod);
        }

        if (!method) {
            method = statsRef.parseAvgStatMethod('sumarize');
        }

        if (!this.list || this.list.length == 0) {
            callback();

        } else if (statsRef) {
            var self = this;

            for (var sf = 0; sf < this.list.length; sf++) {
                this.list[sf].unsetAvgPick();
            }

            statsRef.getStatsMultiple(method, this.flag, this.list, function(rows) {

                if (rows) {
                    rows.forEach((row) => {

                        var brk = false;
                        var pos = 0;

                        while (!brk && pos < self.list.length) {
                            if (self.list[pos].matchStatsRow(row)) {
                                brk = true;

                            } else {
                                pos++;
                            }
                        }

                        if (brk) {
                            var tPugs = row['totalpugs'] - row['captained'];

                            self.list[pos].tPugs = tPugs;

                            if (tPugs > 0) {
                                var tAvgPick = Math.round((row['picks'] / tPugs) * 100.0) / 100.0;
                                var tAvgTotPick = Math.round((row['totalpicks'] / tPugs) * 100.0) / 100.0;

                                self.list[pos].avgPick = tAvgPick;
                                self.list[pos].avgTotPick = tAvgTotPick;
                            }
                        }

                    });

                    /*
                     // !! DEBUG !!
                     for (var sf = 0; sf < self.list.length; sf++) {
                     self.list[sf].avgPick = Math.round(((Math.random() * 8.0 ) + 1) * 100.0) / 100.0;
                     self.list[sf].avgTotPick = 8;
                     }
                     */

                }

                callback(method);

            });

        }
    }

    addStatusReadable(wRef, useForceIndex, voteRef, channelKey, operRef) {

        wRef.text(this.flag.toUpperCase(), true);
        
        if (this.isQuick) {
            wRef.text('{').texth('qi', true).text('}');
        }

        if (channelKey && operRef && this.channelKey != channelKey) {
            wRef.channelLink(operRef.botRef.channels[this.channelKey], '{', '}');
        }

        wRef.text(' ');

        wRef.texth('[');

        if (this.parentCatRef) {
            wRef.text(this.parentCatRef.list.length);
            wRef.texth('/');
            wRef.text(this.parentCatRef.playerLimit);

        } else {
            wRef.text(this.list.length);
            wRef.texth('/');
            wRef.text(this.playerLimit);
        }

        wRef.texth(']');

        wRef.sep();

        if (this.list.length == 0) {
            wRef.texth('{ no players joined }');

        } else {
            let votes, idx = 0;

            while (idx < this.list.length) {
                if (idx != 0) {
                    wRef.textDiscord(',');
                    wRef.text(' ');
                }

                wRef.texth(useForceIndex && this.list[idx].forceIndex !== false ? (this.list[idx].forceIndex + 1) : (idx + 1));
                wRef.text(') ', true);
                wRef.text(this.list[idx].nick, false, true);

                if (this.list[idx].tag != false) {
                    wRef.texth('[');
                    wRef.text(this.list[idx].tag);
                    wRef.texth(']');
                }

                if (voteRef) {
                    if ((votes = voteRef.getTotalVotes(this.list[idx])) > 0) {
                        wRef.texth('(');
                        wRef.text(votes + 'v');
                        wRef.texth(')');
                    }
                }

                idx++;
            }
        }

        return wRef;
    }

    addStatusReadableShort(wRef, channelKey, operRef) {
        wRef.text(this.flag.toUpperCase(), true);

        if (this.isQuick) {
            wRef.text('{').texth('qi', true).text('}');
        }

        if (channelKey && operRef && this.channelKey != channelKey) {
            wRef.channelLink(operRef.botRef.channels[this.channelKey], '{', '}');
        }

        wRef.text(' ');

        wRef.texth('[');

        if (this.parentCatRef) {
            wRef.text(this.parentCatRef.list.length);
            wRef.texth('/');
            wRef.text(this.parentCatRef.playerLimit);

        } else {
            wRef.text(this.list.length);
            wRef.texth('/');
            wRef.text(this.playerLimit);
        }

        wRef.texth(']');

        return wRef;
    }

    addStatusReadableAvgPick(method, wRef, useForceIndex, voteRef, channelKey, operRef) {

        wRef.text(this.flag.toUpperCase(), true);

        if (this.isQuick) {
            wRef.text('{').texth('qi', true).text('}');
        }

        if (channelKey && operRef && this.channelKey != channelKey) {
            wRef.channelLink(operRef.botRef.channels[this.channelKey], '{', '}');
        }

        wRef.text(' ');

        wRef.texth('[');

        if (this.parentCatRef) {
            wRef.text(this.parentCatRef.list.length);
            wRef.texth('/');
            wRef.text(this.parentCatRef.playerLimit);

        } else {
            wRef.text(this.list.length);
            wRef.texth('/');
            wRef.text(this.playerLimit);
        }

        wRef.texth(']');

        wRef.sep();

        if (this.list.length == 0) {
            wRef.texth('{ no players joined }');

        } else {
            let votes, idx = 0, sorted = this.getListAvgPickSorted();

            while (idx < sorted.length) {
                if (idx != 0) {
                    wRef.textDiscord(',');
                    wRef.text(' ');
                }

                wRef.texth(useForceIndex && sorted[idx]['partRef'].forceIndex !== false ? (sorted[idx]['partRef'].forceIndex + 1) : (sorted[idx]['idx'] + 1));
                wRef.text(') ', true);
                wRef.text(sorted[idx]['partRef'].nick, false, true);

                if (sorted[idx]['partRef'].tag) {
                    wRef.texth('[');
                    wRef.text(sorted[idx]['partRef'].tag);
                    wRef.texth(']');
                }

                if (voteRef) {
                    if ((votes = voteRef.getTotalVotes(sorted[idx]['partRef'])) > 0) {
                        wRef.texth('(');
                        wRef.text(votes + 'v');
                        wRef.texth(')');
                    }
                }

                if (sorted[idx]['partRef'].avgTotPick && sorted[idx]['partRef'].avgTotPick > 1) {
                    wRef.texth(' ~ ');
                    
                    // avgPick starting from 1
                    var koef = Math.round((sorted[idx]['partRef'].avgTotPick ? (1.0 - ((sorted[idx]['partRef'].avgPick - 1.0) / (sorted[idx]['partRef'].avgTotPick - 1.0))) : 0) * 100.0);

                    wRef.text(koef + ' %', true);

                } else {
                    wRef.texth(' ~ ');
                    wRef.text('0 %', true);
                }

                idx++;
            }
        }

        switch (method['type']) {
            case 'sumarize' :
                wRef.text(' ').texth('(from sumarized stats)');
                break;

            case 'pastpicks' :
                wRef.text(' ').texth('(from past ').texth(method['value']).texth(' picks)');
                break;

            case 'pastdays' :
                wRef.text(' ').texth('(from past ').texth(method['value']).texth(' days)');
                break;
        }

        return wRef;
    }

    nickChange(type, oldNick, newNick) {
        let idx = 0;
        
        while (idx < this.list.length) {
            this.list[idx].nickChange(type, oldNick, newNick);

            idx++;
        }
    }

    findParticipant(partRef) {
        let idx = 0;

        while (idx < this.list.length) {
            let cRef = this.list[idx];

            if (cRef.compareEqual(partRef)) {
                return idx;
            }

            idx++;
        }

        return -1;
    }

    getParticipant(partRef) {
        let idx = this.findParticipant(partRef);
        return idx == -1 ? null : this.list[idx];
    }

    getParticipantNickOrForceIndex(input) {
        let idx = 0;

        while (idx < this.list.length) {
            if (this.list[idx].nick.toLowerCase().trim() == input.toLowerCase() || (this.list[idx].forceIndex !== false && (this.list[idx].forceIndex + 1) == input)) {
                return this.list[idx];
            }

            idx++;
        }

        return null;
    }

    replaceParticipant(index, partRef) {
        if (index >= 0 && index < this.list.length) {
            let befForceIndex = this.list[index].forceIndex;

            this.list[index] = partRef;
            this.list[index].forceIndex = befForceIndex;
            this.list[index].refreshTime();
        }
    }

    joinParticipant(partRef) {
        let idx = this.findParticipant(partRef);

        if (idx != -1 || !partRef) {
            return -1;

        } else if (this.list.length >= this.playerLimit) {
            return -2;

        } else {
            this.list.push(partRef);

            partRef.refreshTime();
            
            this.refreshTouchTime();

            return this.list.length == this.playerLimit ? 1 : 0;
        }
    }

    joinParticipantSorted(partRef) {
        let idx = this.findParticipant(partRef);

        if (idx != -1 || !partRef) {
            return -1;

        } else if (this.list.length >= this.playerLimit) {
            return -2;

        } else {
            var pos = 0, found = false;

            while (!found && pos < this.list.length) {
                if (this.list[pos].forceIndex > partRef.forceIndex) found = true;
                else pos++;
            }

            if (found) {
                this.list.push(null);

                for (var sf = this.list.length - 1; sf > pos; sf--) {
                    this.list[sf] = this.list[sf - 1];
                }

                this.list[pos] = partRef;

            } else {
                this.list.push(partRef);
            }

            partRef.refreshTime();

            this.refreshTouchTime();

            return this.list.length == this.playerLimit ? 1 : 0;
        }
    }

    joinParticipantList(list) {
        list.forEach((partRef, idx) => {
            this.joinParticipant(partRef, false);
        });
    }

    joinParticipantListWithForceIndex(list) {
        list.forEach((partRef, idx) => {

            partRef.forceIndex = idx;
            
            this.joinParticipant(partRef, idx);
        });
    }

    // setCaptainIdleTimeout(captPartRef) {
    //     clearCaptainIdle();
    //     captainIdleTimeout = setTimeout(this.captainIsIdle(captPartRef), 3*60*1000);
    // }

    // captainIsIdle(captPartRef) {
    //     this.leaveParticipant(captPartRef);
    //     this.addParticipantTimeout(gameRef, partRef, secs);
    //     this.gameRef.resetPickings()
    // }

    // clearCaptainIdle() {
    //     clearTimeout(this.captainIdleTimeout);
    // }

    leaveParticipant(partRef) {
        let idx = this.findParticipant(partRef);

        if (idx == -1) {
            return -1;

        } else {
            this.list.splice(idx, 1);

            this.refreshTouchTime();

            return 0;
        }
    }
    
    leaveParticipantCooldown(gameRef, partRef, secs = false, isCaptainIdle = false) {
        let res = this.leaveParticipant(partRef);

        if (res == 0 && gameRef && gameRef.areCaptainsSet) {
            // const isCaptain = gameRef.getTeamByCaptain(partRef) != null;

            this.addParticipantTimeout(gameRef, partRef, secs,  isCaptainIdle);
        }

        return res;
    }

    leaveParticipantList(list) {
        list.forEach((partRef, idx) => {

            this.leaveParticipant(partRef);

        });
    }

    getRandomParticipant() {
        if (this.list.length == 0) {
            return null;
            
        } else {
            return this.list[Math.round(Math.random() * (this.list.length - 1))];
        }
    }

    getParticipantsByStamp(secondsLimit) {
        let result = [];
        let idx = 0;
        let cTime = (new Date()).getTime() / 1000;

        while (idx < this.list.length) {
            if (cTime - this.list[idx].time >= secondsLimit) {
                result.push(this.list[idx]);
            }

            idx++;
        }

        return result;
    }

    getParticipantsByTagNeg(notTag) {
        let result = [];
        let idx = 0;

        while (idx < this.list.length) {
            if (this.list[idx].tag != notTag) {
                result.push(this.list[idx]);
            }

            idx++;
        }

        return result;
    }

    getParticipantsWithTag(name = null) {
        const nameAsUpper = name.toUpperCase();
        const result = this.list.filter(l => (l.tag || "").toUpperCase() == nameAsUpper);
        return result;
    }

    flushParticipants() {
        this.list = [];
        this.refreshTouchTime();
    }

    findParticipantTimeout(partRef) {
        let idx = 0;

        while (idx < this.timeouts.length) {
            let cRef = this.timeouts[idx]["partRef"];

            if (cRef.compareEqual(partRef)) {
                return idx;
            }

            idx++;
        }

        return -1;
    }

    testParticipantTimeout(partRef) {
        let idx = this.findParticipantTimeout(partRef);

        if (idx != -1) {
            let restTime = this.timeouts[idx]["time"] - ((new Date()).getTime() / 1000);

            if (Math.round(restTime) <= 0) {
                // dont show 0 seconds ...
                
                restTime = 1;
            }

            return WordCo.cre().text('Please wait ').texth(Math.round(restTime)).text(' seconds to rejoin the ').texth(this.flag).text(' pug.');

        } else {
            return null;
        }
    }

    addParticipantTimeout(operRef, partRef, secs = false, isCaptainIdle = false) {
        let idx = this.findParticipantTimeout(partRef);
        let cTime = ((new Date()).getTime() / 1000);

        if (secs) {
            cTime += secs;

        } else if (isCaptainIdle) {
            cTime += this.captainIdleCooldownInSecs;

        } else {
            cTime += this.playerRejoinCooldownInSecs || operRef.botRef.rejoinTimeout;
        }

        if (idx != -1) {
            this.timeouts[idx]["time"] = cTime;

        } else {
            this.timeouts.push({
                "partRef" : partRef,
                "time" : cTime
            })
        }
    }

    removeTimeoutByName(part) {
        const index = this.timeouts.findIndex(t => t.id == part.id);
        if (index > -1) {
            this.timeouts.splice(index, 1);
            return true;
        }
        return false;
    }

    logicLoop() {
        let idx = 0, cTime = ((new Date()).getTime() / 1000);

        while (idx < this.timeouts.length) {
            if (this.timeouts[idx]["time"] < cTime) {
                this.timeouts.splice(idx, 1);

            } else {
                idx++;
            }
        }
    }

    isPlayer(partRef) {
        return this.list.filter(part => part.id == partRef.id).length > 0;
    }
}

export default Catalog;
