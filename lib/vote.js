import logger from 'winston';
import Bot from './bot';
import Participant from './participant';
import Catalog from './catalog';

class VoteOperator {
    constructor(acRef) {
        
        this.acRef = acRef;
        this.votes = [];

    }

    toJSON() {
        var result = {
            "votes" : [],
        };

        this.votes.forEach((c) => {
            result["votes"].push({
                "partRef" : c["partRef"].toJSON(),
                "trgPartRef" : c["trgPartRef"].toJSON(),
                "value" : c["value"]
            });
        });

        return result;
    }

    static fromJSON(acRef, input) {
        var ref = new VoteOperator(acRef);

        /*
        ["maxVotes"].forEach((c) => {
            if (typeof input[c] != 'undefined') {
                ref[c] = input[c];
            }
        });
        */

        ref.votes = [];

        if (typeof input["votes"] != 'undefined' && Array.isArray(input["votes"])) {
            input["votes"].forEach((c) => {

                ref.votes.push({
                    "partRef" : Participant.fromJSON(c["partRef"]),
                    "trgPartRef" : Participant.fromJSON(c["trgPartRef"]),
                    "value" : c["value"]
                });

            });
        }

        return ref;
    }

    clear() {
        this.votes = [];
    }

    findJoinedParticipant(channelKey, partRef) {
        let cPartRef = null, cCatRef = null;
        
        if (this.acRef.logicState > 1) {
            cPartRef = this.acRef.gameCatRef.getParticipant(partRef);
            cCatRef = this.acRef.gameCatRef;

        } else {
            var idx = 0;
            
            while (cPartRef == null && idx < this.acRef.operRef.cats.length) {
                cCatRef = this.acRef.operRef.cats[idx];

                if (channelKey && cCatRef.channelKey != channelKey) {
                    idx++;

                } else if ((cPartRef = this.acRef.operRef.cats[idx].getParticipant(partRef)) == null) {
                    idx++;
                }
            }
        }

        return {
            "partRef" : cPartRef,
            "catRef" : cCatRef
        };
    }

    getParticipantForVoteNickOrForceIndex(channelKey, input) {
        let cPartRef = null, cCatRef = null;

        if (this.acRef.logicState > 1) {
            cPartRef = this.acRef.gameCatRef.getParticipantNickOrForceIndex(input);
            cCatRef = this.acRef.gameCatRef;

        } else {
            var idx = 0;

            while (cPartRef == null && idx < this.acRef.operRef.cats.length) {

                cCatRef = this.acRef.operRef.cats[idx];

                if (channelKey && cCatRef.channelKey != channelKey) {
                    idx++;

                } else if ((cPartRef = this.acRef.operRef.cats[idx].getParticipantNickOrForceIndex(input)) == null) {
                    idx++;
                }
            }
        }

        return {
            "partRef" : cPartRef,
            "catRef" : cCatRef
        };
    }

    getVotes(partRef) {
        let idx = 0, idxs = [];

        while (idx < this.votes.length) {
            if (this.votes[idx]["partRef"].compareEqual(partRef)) {
                idxs.push(idx);
            }

            idx++;
        }

        return idxs;
    }

    getVote(partRef, trgPartRef) {
        let idx = 0;

        while (idx < this.votes.length) {
            if (this.votes[idx]["partRef"].compareEqual(partRef) && this.votes[idx]["trgPartRef"].compareEqual(trgPartRef)) {
                return this.votes[idx];

            } else {
                idx++;
            }
        }

        return null;
    }

    addVote(acRef, catRef, partRef, trgPartRef, value) {
        if (this.getVote(partRef, trgPartRef)) {
            return -1;

        } else {
            let idxs = this.getVotes(partRef), totalVotes = 0;

            if (acRef.logicState > 0 && idxs.length >= catRef.possibleVotes) {
                return -3;
            }

            if (idxs.length == catRef.possibleVotes) {
                this.votes.splice(idxs[0], 1);
            }

            this.votes.push({
                "partRef" : partRef,
                "trgPartRef" : trgPartRef,
                "value" : value
            });

            this.votes.forEach((c) => {
                if (c["trgPartRef"].compareEqual(trgPartRef)) {
                    totalVotes += c["value"];
                }
            });

            return totalVotes;
        }
    }

    removeVoteSelf(partRef) {
        var idx = 0, removed = 0;

        while (idx < this.votes.length) {
            if (this.votes[idx]["partRef"].compareEqual(partRef)) {
                this.votes.splice(idx, 1);
                removed++;

            } else {
                idx++;
            }
        }

        return removed;
    }

    removeVoteTrg(trgPartRef) {
        var idx = 0;

        while (idx < this.votes.length) {
            if (this.votes[idx]["trgPartRef"].compareEqual(trgPartRef)) {
                this.votes.splice(idx, 1);

            } else {
                idx++;
            }
        }
    }

    getTotalVotes(partRef) {
        let idx = 0, votes = 0;

        while (idx < this.votes.length) {
            if (this.votes[idx]["trgPartRef"].compareEqual(partRef)) {
                votes += this.votes[idx]["value"];
            }

            idx++;
        }

        return votes;
    }

    getVoteSumarize(exclude, minVotes, excludeNocapt) {
        let idx = 0, result = [];

        while (idx < this.votes.length) {
            if (
                (!exclude || !this.votes[idx]["trgPartRef"].isInArray(exclude)) &&
                (!excludeNocapt || !this.votes[idx]["trgPartRef"].isNocapt())
            ) {
                let pos = 0, brk = false;

                while (!brk && pos < result.length) {
                    if (result[pos]["trgPartRef"].compareEqual(this.votes[idx]["trgPartRef"])) brk = true;
                    else pos++;
                }

                if (brk) {
                    result[pos]["votes"] += this.votes[idx]["value"];

                } else {
                    result.push({
                        "trgPartRef" : this.votes[idx]["trgPartRef"],
                        "votes" : this.votes[idx]["value"]
                    });
                }
            }

            idx++;
        }

        let resultSorted = [];

        result.forEach((c) => {
            if (!minVotes || c["votes"] >= minVotes) {
                let pos = 0, brk = false;

                while (!brk && pos < resultSorted.length) {
                    if (c["votes"] > resultSorted[pos]["votes"]) brk = true;
                    else pos++;
                }

                if (brk) {
                    resultSorted.push(null);

                    for (var sf = resultSorted.length - 1; sf > pos; sf--) {
                        resultSorted[sf] = resultSorted[sf - 1];
                    }

                    resultSorted[pos] = c;
                    
                } else {
                    resultSorted.push(c);
                }
            }
        });

        return resultSorted;
    }

    addStatusReadable(wRef) {
        let idx = 0, result = this.getVoteSumarize();

        if (result.length > 0) {
            while (idx < result.length) {
                if (idx != 0) {
                    wRef.text(', ');
                }

                wRef.text(result[idx]["trgPartRef"].nick, false, true);
                wRef.texth("[" + result[idx]["votes"] + "v" + (result[idx]["trgPartRef"].isNocapt() ? ", nocapt" : "") + "]");

                idx++;
            }

        } else {
            wRef.texth('no votes');
        }

        return result.length;
    }
}

export default VoteOperator;