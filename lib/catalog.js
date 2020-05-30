import Participant from './participant';
import WordCo from './word_co';

class Catalog {
    constructor(channelKey, flag, playerLimit, teamCount, parentCatRef) {

        this.channelKey = channelKey;
        this.flag = flag;
        this.playerLimit = playerLimit;
        this.teamCount = teamCount;
        this.parentCatRef = parentCatRef;
        this.creatorPartRef = null;
        this.isQuick = false;
        this.createTime = (new Date()).getTime() / 1000;
        this.touchTime = false;
        this.rejoinTimeout = 0;
        this.possibleVotes = 1;
        this.list = [];
        this.timeouts = [];

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
            "possibleVotes" : this.possibleVotes,
            "list" : [],
            "timeouts" : []
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

        ["channelKey", "flag", "playerLimit", "teamCount", "isQuick", "createTime", "touchTime", "possibleVotes"].forEach((c) => {
            if (typeof input[c] != 'undefined') {
                ref[c] = input[c];
            }
        });

        ref.parentCatRef = input["parentCatRef"] ? Catalog.fromJSON(input["parentCatRef"]) : null;
        ref.creatorPartRef = input["creatorPartRef"] ? Participant.fromJSON(input["creatorPartRef"]) : null;
        ref.list = [];
        ref.timeouts = [];

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
        var catRef = new Catalog(this.channelKey, this.flag, this.playerLimit, this.teamCount, this.parentCatRef);

        catRef.creatorPartRef = this.creatorPartRef;
        catRef.isQuick = this.isQuick;
        catRef.createTime = this.createTime;
        catRef.touchTime = this.touchTime;
        catRef.list = [];

        this.list.forEach((partRef) => {
            catRef.list.push(partRef);
        });

        return catRef;
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
    
    getListAvgPickSorted() {
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

    loadAvgPick(statsRef, callback) {

        if (this.list) {
            for (var sf = 0; sf < this.list.length; sf++) {
                if (typeof this.list[sf].avgPick != 'undefined') {
                    this.list[sf].avgPick = null;
                    delete this.list[sf].avgPick;
                }

                if (typeof this.list[sf].avgTotPick != 'undefined') {
                    this.list[sf].avgTotPick = null;
                    delete this.list[sf].avgTotPick;
                }
            }
        }

        if (statsRef) {
            var self = this;

            statsRef.getStatsMultiple(this.flag, this.list, function(rows) {

                if (rows) {
                    rows.forEach((row) => {

                        var brk = false;
                        var pos = 0;

                        while (!brk && pos < self.list.length) {
                            if (self.list[pos].type == 0 && self.list[pos].id == row['discordId']) {
                                brk = true;

                            } else if (self.list[pos].type == 1 && self.list[pos].whois && self.list[pos].whois["account"] == row['ircAuth']) {
                                brk = true;

                            } else if (self.list[pos].nick == row['nick']) {
                                brk = true;

                            } else {
                                pos++;
                            }
                        }

                        if (brk) {
                            var tPugs = row['totalpugs'] - row['captained'];

                            if (tPugs > 0) {
                                self.list[pos].avgPick = Math.round((row['picks'] / tPugs) * 100.0) / 100.0;
                                self.list[pos].avgTotPick = Math.round((row['totalpicks'] / tPugs) * 100.0) / 100.0;
                            }
                        }

                    });

                    /*
                    if (true) {
                        // !! DEBUG !!
                        for (var sf = 0; sf < self.list.length; sf++) {
                            if (!self.list[sf].avgTotPick) {
                                self.list[sf].avgPick = Math.round(((Math.random() * 8.0 ) + 1) * 100.0) / 100.0;
                                self.list[sf].avgTotPick = 8;
                            }
                        }
                    }
                    */
                }
                
                callback();

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

    addStatusReadableAvgPick(wRef, useForceIndex, voteRef, channelKey, operRef) {

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

                if (sorted[idx]['partRef'].tag != false) {
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
            if (this.list[idx].nick.toLowerCase() == input.toLowerCase() || (this.list[idx].forceIndex !== false && (this.list[idx].forceIndex + 1) == input)) {
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

    joinParticipant(partRef, forceIndex, sorted, forceAdd) {
        let idx = this.findParticipant(partRef);

        if (idx != -1 || !partRef) {
            return -1;

        } else if (this.list.length >= this.playerLimit) {
            return -2;

        } else if (!partRef.getAuthKeyRelevant() && !forceAdd) {
            return -3;

        } else {
            if (typeof forceIndex != 'undefined' && forceIndex !== false) {
                partRef.forceIndex = forceIndex;
            }

            var pos = 0, found = false;

            while (!found && pos < this.list.length) {
                if (sorted && this.list[pos].forceIndex > partRef.forceIndex) found = true;
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
            this.joinParticipant(partRef, false, false, true);
        });
    }

    joinParticipantListWithForceIndex(list) {
        list.forEach((partRef, idx) => {
            this.joinParticipant(partRef, idx, false, true);
        });
    }

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

    leaveParticipantList(list) {
        list.forEach((partRef, idx) => {
            this.leaveParticipant(partRef);
        });
    }

    getRandomParticipant() {
        if (this.list.length == 0) {
            return null;
        } else {
            return this.list[Math.floor(Math.random() * this.list.length)];
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

    addParticipantTimeout(operRef, partRef, secs = false) {
        let idx = this.findParticipantTimeout(partRef);
        let cTime = ((new Date()).getTime() / 1000);

        if (secs) {
            cTime += secs;

        } else if (this.rejoinTimeout) {
            cTime += this.rejoinTimeout;

        } else {
            cTime += operRef.botRef.rejoinTimeout;
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
}

export default Catalog;
