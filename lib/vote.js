import logger from 'winston';
import Bot from './bot';
import Participant from './participant';
import Catalog from './catalog';

class VoteOperator {
    constructor(catRef, maxVotes) {

        this.catRef = catRef;
        this.votes = [];
        this.maxVotes = maxVotes;

    }

    clear() {
        this.votes = [];
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

    addVote(partRef, trgPartRef, value) {
        if (this.getVote(partRef, trgPartRef)) {
            return -1;

        } else if (partRef.compareEqual(trgPartRef)) {
            return -2;

        } else if (trgPartRef.tag == "nocapt") {
            return -3;

        } else {
            let idxs = this.getVotes(partRef), totalVotes = 0;

            if (idxs.length == this.maxVotes) {
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

    getVoteSumarize(exclude) {
        let idx = 0, result = [];

        while (idx < this.votes.length) {
            if (!exclude || !this.votes[idx]["trgPartRef"].isInArray(exclude)) {
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

                idx++;
            }
        }

        let resultSorted = [];

        result.forEach((c) => {
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
        });

        return resultSorted;
    }

    addStatusReadable(wRef) {
        let idx = 0, result = this.getVoteSumarize();

        while (idx < result.length) {
            if (idx != 0) {
                wRef.text(', ');
            }

            wRef.text(result[idx]["trgPartRef"].nick, false, true);

            if (result[idx]["votes"] == 1) {
                wRef.texth("[" + result[idx]["votes"] + " vote]");
            } else {
                wRef.texth("[" + result[idx]["votes"] + " votes]");
            }

            idx++;
        }
    }
}

export default VoteOperator;