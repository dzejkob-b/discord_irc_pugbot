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
        this.list = [];

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
            "list" : []
        };

        this.list.forEach((partRef) => {
            result["list"].push(partRef.toJSON());
        });

        return result;
    }
    
    static fromJSON(input) {
        var ref = new Catalog();

        ["channelKey", "flag", "playerLimit", "teamCount", "isQuick", "createTime", "touchTime"].forEach((c) => {
            if (typeof input[c] != 'undefined') {
                ref[c] = input[c];
            }
        });

        ref.parentCatRef = input["parentCatRef"] ? Catalog.fromJSON(input["parentCatRef"]) : null;
        ref.creatorPartRef = input["creatorPartRef"] ? Participant.fromJSON(input["creatorPartRef"]) : null;
        ref.list = [];

        if (typeof input["list"] != 'undefined' && Array.isArray(input["list"])) {
            input["list"].forEach((c) => {
                ref.list.push(Participant.fromJSON(c));
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

    addStatusReadable(wRef, useForceIndex, voteRef) {
        wRef.text(this.flag.toUpperCase(), true);

        if (this.isQuick) {
            wRef.text('{').texth('qi', true).text('}');
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

    addStatusReadableShort(wRef) {
        wRef.text(this.flag.toUpperCase(), true);

        if (this.isQuick) {
            wRef.text('{').texth('qi', true).text('}');
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
}

export default Catalog;
