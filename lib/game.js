import Participant from './participant';
import Catalog from './catalog'
import Team from './team'
import WordCo from './word_co';
import {secsAgoFormat} from './helpers';

class Game {
    captainIdleTimeout;
    static CAPTAINIDLE_HEADSUP = 10*1000; // 10 seconds
    
    constructor(channelKey, catRef, teamCount, extraSettings) {

        this.channelKey = channelKey;
        this.teams = [];
        this.restCat = null;

        if (catRef) {
            for (var sf = 1; sf <= teamCount; sf++) {
                switch (sf) {
                    case 1 :
                        this.teams.push(new Team(this.channelKey, "Red", catRef.playerLimit / teamCount));
                        break;

                    case 2 :
                        this.teams.push(new Team(this.channelKey, "Blue", catRef.playerLimit / teamCount));
                        break;

                    case 3 :
                        this.teams.push(new Team(this.channelKey, "Green", catRef.playerLimit / teamCount));
                        break;

                    case 4 :
                        this.teams.push(new Team(this.channelKey, "Yellow", catRef.playerLimit / teamCount));
                        break;
                }
            }

            extraSettings = {
                pickSteps: catRef.pickSteps,
                possibleVotes: catRef.possibleVotes,
                captainIdleInSecs: catRef.captainIdleInSecs,
                captainIdleCooldownInSecs: catRef.captainIdleCooldownInSecs,
                playerRejoinCooldownInSecs: catRef.playerRejoinCooldownInSecs
            };

            this.restCat = new Catalog(catRef.channelKey, catRef.flag, catRef.playerLimit, catRef.teamCount, catRef, extraSettings);
            this.restCat.joinParticipantListWithForceIndex(catRef.list);
        }

        this.captainTurn = 0;
        this.pickCount = 0;
        this.pickIndex = 0;
        this.lastPickPartRef = null;

        this.timeCapt = (new Date()).getTime() / 1000;
        this.timeFinished = false;
    }

    toJSON() {
        var result = {
            "channelKey" : this.channelKey,
            "teams" : [],
            "restCat" : this.restCat.toJSON(),
            "captainTurn" : this.captainTurn,
            "pickCount" : this.pickCount,
            "pickIndex" : this.pickIndex,
            "lastPickPartRef" : this.lastPickPartRef != null ? this.lastPickPartRef.toJSON() : null,
            "timeCapt" : this.timeCapt,
            "timeFinished" : this.timeFinished
        };

        this.teams.forEach((teamRef) => {
            result["teams"].push(teamRef.toJSON());
        });

        return result;
    }

    static fromJSON(input) {
        var ref = new Game();

        ["channelKey", "captainTurn", "pickCount", "pickIndex", "timeCapt", "timeFinished"].forEach((c) => {
            if (typeof input[c] != 'undefined') {
                ref[c] = input[c];
            }
        });
        
        ref.restCat = input["restCat"] ? Catalog.fromJSON(input["restCat"]) : null;
        ref.lastPickPartRef = input["lastPickPartRef"] ? Participant.fromJSON(input["lastPickPartRef"]) : null;
        ref.teams = [];

        if (input["teams"] && Array.isArray(input["teams"])) {
            input["teams"].forEach((c) => {
                ref.teams.push(Team.fromJSON(c));
            });
        }

        return ref;
    }

    static fromStatData(st_row, pl_rows) {
        var ref = new Game(), teamsCounts = {}, teams = {};
        
        pl_rows.forEach((c) => {

            var tt = parseInt(c["teamIndex"]);

            if (teamsCounts[tt] == "undefined") {
                teamsCounts[tt] = 0;
            }

            teamsCounts[tt]++;
        });

        pl_rows.forEach((c) => {

            var tt = parseInt(c["teamIndex"]);

            if (tt >= 0 && typeof teams[tt] == "undefined") {
                teams[tt] = new Team(st_row["channelKey"], c["teamName"], teamsCounts[tt]);
            }

        });
        
        ref.channelKey = st_row["channelKey"];
        ref.restCat = new Catalog(st_row["channelKey"], st_row["flag"], pl_rows.length, teams.length);
        ref.timeFinished = st_row["starttime"];

        pl_rows.forEach((c) => {

            var tt = parseInt(c["teamIndex"]), aPartRef = Participant.fromStatData(c);

            if (tt >= 0) {
                if (!teams[tt].captPartRef) {
                    teams[tt].captPartRef = aPartRef;
                }

                teams[tt].catRef.list.push(aPartRef);

            } else {
                ref.restCat.list.push(aPartRef);
            }

        });

        var tIdx;

        for (tIdx in teams) {

            ref.teams.push(teams[tIdx]);

        }
        
        return ref;
    }

    addStatusReadable(wRef, showAgo, listInfo) {
        
        wRef.text(this.restCat.flag.toUpperCase(), true);

        if (listInfo) {
            wRef.text(' [' + listInfo["index"] + ' / ' + listInfo["count"] + '] ');
        }

        wRef.sep();

        var idx;

        if (this.teams.length == 0) {
            for (idx = 0; idx < this.restCat.list.length; idx++) {

                wRef.text(this.restCat.list[idx].nick, false, true);
                wRef.text(' ');

            }

        } else {
            for (idx = 0; idx < this.teams.length; idx++) {

                if (idx != 0) {
                    wRef.discordSep();
                }

                this.teams[idx].addStatusReadable(wRef);
                wRef.text(' ');

            }
        }

        if (showAgo) {
            wRef.sep();

            if (!this.timeFinished) {
                wRef.text('unfinished');

            } else {
                var secs = ((new Date()).getTime() / 1000) - this.timeFinished;
                wRef.text(secsAgoFormat(secs) + ' ago');
            }
        }

        return wRef;
    }

    getAllParticipants() {
        var result = [];

        this.teams.forEach((teamRef) => {

            teamRef.catRef.list.forEach((partRef) => {
                result.push(partRef);
            });

        });

        this.restCat.list.forEach((partRef) => {
            result.push(partRef);
        });

        return result;
    }

    setTagByPart(partRef, tagValue) {
        this.getAllParticipants().forEach(function(cPartRef) {
            if (cPartRef.compareEqual(partRef)) {
                cPartRef.setTag(tagValue);
            }
        });
    }

    getTeamByCaptain(partRef) {
        var idx = 0;

        while (idx < this.teams.length) {
            if (this.teams[idx].captPartRef != null && this.teams[idx].captPartRef.compareEqual(partRef)) {
                return this.teams[idx];
            }

            idx++;
        }

        return null;
    }

    getNonCaptainCount() {
        var idx = 0, cnt = 0;

        while (idx < this.teams.length) {
            if (this.teams[idx].captPartRef == null) {
                cnt++;
            }

            idx++;
        }
        
        return cnt++;
    }

    setCaptainFirstPossibleTeam(partRef, setMethod = false) {
        var teamRef = this.getFirstNocaptTeam();

        if (teamRef != null) {
            teamRef.setCaptParticipant(partRef, setMethod);
            this.restCat.leaveParticipant(partRef);

            return teamRef;
        }

        return null;
    }

    setCaptainToTeam(teamRef, partRef, setMethod = false) {
        if (teamRef.captPartRef) {
            this.restCat.joinParticipantSorted(teamRef.captPartRef);
            teamRef.unsetCaptParticipant();
        }

        var exTeamRef = this.getTeamByCaptain(partRef);

        if (exTeamRef) {
            this.restCat.joinParticipantSorted(exTeamRef.captPartRef);
            exTeamRef.unsetCaptParticipant();
        }

        teamRef.setCaptParticipant(partRef, setMethod);
        this.restCat.leaveParticipant(partRef);

        return true;
    }

    getTeamByTurn(turnNum) {
        if (typeof turnNum == 'undefined') {
            return this.teams[this.captainTurn % this.teams.length];
        } else {
            return this.teams[turnNum % this.teams.length];
        }
    }

    getTeamByColor(teamColor) {
        var idx = 0;

        while (idx < this.teams.length) {
            if (this.teams[idx].colorName.toLowerCase() == teamColor.toLowerCase()) {
                return this.teams[idx];
            }

            idx++;
        }

        return null;
    }

    getFirstNocaptTeam() {
        var idx = 0;

        while (idx < this.teams.length) {
            if (this.teams[idx].captPartRef == null) {
                return this.teams[idx];
            }

            idx++;
        }

        return null;
    }

    partInGame(partRef) {
        var idx = 0;

        while (idx < this.teams.length) {
            if (this.teams[idx].catRef.getParticipant(partRef) != null) {
                return true;
            }

            idx++;
        }

        if (this.restCat.getParticipant(partRef) != null) {
            return true;
        }

        return false;
    }

    doPickCaptains(operRef, voteRef, callback) {
        var captainPos, captainAssigned, nocaptTeamsCount = 0;

        if (voteRef) {
            var currentCapts = [];

            this.teams.forEach((teamRef) => {
                if (teamRef.captPartRef) {
                    currentCapts.push(teamRef.captPartRef);
                }
            });

            var cands = voteRef.getVoteSumarize(currentCapts, 1, true);

            this.teams.forEach((teamRef) => {
                if (teamRef.captPartRef == null && cands.length > 0) {
                    teamRef.setCaptParticipant(cands[0]["trgPartRef"], 'voted');
                    cands.splice(0, 1);
                }
            });
        }

        this.teams.forEach((teamRef) => {
            if (teamRef.captPartRef == null) {
                nocaptTeamsCount++;
            }
        });

        // list without players tagged nocapt

        captainPos = new Catalog(this.restCat.channelKey, this.restCat.flag, this.restCat.playerLimit, this.restCat.teamCount);
        captainPos.joinParticipantList(this.restCat.getParticipantsByTagNeg('nocapt'));

        if (captainPos.list.length < nocaptTeamsCount) {
            // not enought players not tagged by nocapt - create new list with all

            captainPos = new Catalog(this.restCat.channelKey, this.restCat.flag, this.restCat.playerLimit, this.restCat.teamCount);
            captainPos.joinParticipantList(this.restCat.list);
        }

        captainAssigned = new Catalog(this.restCat.channelKey, this.restCat.flag, this.restCat.playerLimit, this.restCat.teamCount);

        this.teams.forEach((teamRef) => {
            if (teamRef.captPartRef != null) {
                // leave picked captains

                captainPos.leaveParticipant(teamRef.captPartRef);
                captainAssigned.joinParticipant(teamRef.captPartRef);

            }
        });

        if (operRef.botRef.captainPicking == "avgpick") {

            var self = this;

            captainAssigned.loadAvgPick(operRef.statsRef, function() {
                captainPos.loadAvgPick(operRef.statsRef, function() {

                    self.doPickCaptainsFinal(operRef, captainPos, captainPos.getListAvgPickSorted(), callback);

                });
            });

        } else {
            this.doPickCaptainsFinal(operRef, captainPos, null, callback);
        }
    }

    doPickCaptainsFinal(operRef, captainPos, sortedParts, callback) {

        var idx = 0, lastAvg = false;

        /*
        sortedParts.forEach((c) => {
            console.log("AVGPICK: " + c['partRef'].nick + ' | ' + c['partRef'].avgPick);
        });
        */

        this.teams.forEach((teamRef) => {
            if (teamRef.captPartRef != null && teamRef.captPartRef.avgPick) {
                lastAvg = teamRef.captPartRef.avgPick;
            }
        });

        while (idx < this.teams.length) {
            if (this.teams[idx].captPartRef == null) {

                if (sortedParts && sortedParts.length > 0) {

                    var avgIdx, minDiff, minDiffIdx;

                    if (lastAvg === false) {
                        avgIdx = Math.round(Math.random() * (sortedParts.length - 1));

                    } else {
                        avgIdx = 0;
                        minDiffIdx = -1;
                        minDiff = 0;

                        while (avgIdx < sortedParts.length) {
                            if (minDiffIdx == -1 || Math.abs(lastAvg - sortedParts[avgIdx]['partRef'].avgPick) < minDiff) {
                                minDiffIdx = avgIdx;
                                minDiff = Math.abs(lastAvg - sortedParts[avgIdx]['partRef'].avgPick);
                            }

                            avgIdx++;
                        }

                        avgIdx = minDiffIdx;
                    }

                    this.teams[idx].setCaptParticipant(sortedParts[avgIdx]['partRef'], 'avgpick');
                    captainPos.leaveParticipant(this.teams[idx].captPartRef);

                    lastAvg = sortedParts[avgIdx]['partRef'].avgPick;
                    sortedParts.splice(avgIdx, 1);

                } else {
                    this.teams[idx].setCaptParticipant(captainPos.getRandomParticipant(), 'random');
                    captainPos.leaveParticipant(this.teams[idx].captPartRef);
                }
            }

            this.restCat.leaveParticipant(this.teams[idx].captPartRef);

            idx++;
        }

        this.restCat.list.forEach((partRef) => {
            partRef.pickIndex = false;
        });

        this.pickIndex = 0;

        callback();
    }

    resetPickings() {
        this.captainTurn = 0;
        this.pickCount = 0;
        this.pickIndex = 0;

        this.teams.forEach((teamRef) => {

            var befCaptRef = teamRef.captPartRef;

            teamRef.catRef.list.forEach((partRef) => {
                this.restCat.joinParticipantSorted(partRef);
            });

            teamRef.catRef.flushParticipants();
            teamRef.captPartRef = null;

            if (befCaptRef) {
                teamRef.setCaptParticipant(befCaptRef);
                this.restCat.leaveParticipant(befCaptRef);
            }

        });
    }

    doPickPlayer(whoPartRef, playerKey) {

        var teamRef;
        var pickRef = (this.lastPickPartRef = this.restCat.getParticipantNickOrForceIndex(playerKey));

        if (pickRef == null) {
            return -2;

        } else if ((teamRef = this.getTeamByTurn()).captPartRef.compareEqual(whoPartRef) == false) {
            return -1;

        } else {
            pickRef.pickIndex = this.pickIndex++;

            teamRef.catRef.joinParticipant(pickRef);
            this.restCat.leaveParticipant(pickRef);

            if (this.restCat.list.length == 0) {
                return 2;

            } else {
                // next pick step

                this.pickCount++;

                var stepIdx = this.captainTurn >= this.restCat.pickSteps.length ? (this.restCat.pickSteps.length - 1) : this.captainTurn;

                if (this.pickCount >= this.restCat.pickSteps[stepIdx]) {
                    this.pickCount = 0;
                    this.captainTurn++;

                    if (this.restCat.list.length <= this.restCat.pickSteps[stepIdx]) {
                        // add rest players to next team

                        while (this.restCat.list.length > 0) {
                            teamRef = this.getTeamByTurn();

                            if (teamRef.catRef.isFull()) {
                                this.captainTurn++;
                                teamRef = this.getTeamByTurn();
                            }

                            this.restCat.list[0].pickIndex = this.pickIndex++;
                            teamRef.catRef.joinParticipant(this.restCat.list[0]);

                            this.restCat.leaveParticipant(this.restCat.list[0]);
                        }

                        return 2;

                    } else {
                        const currentPickingCaptain = this.getTeamByTurn().captPartRef;
                        this.setCaptainIdleTimeout(currentPickingCaptain);
                        return 1;
                    }
                }
            }

            return 0;
        }
    }

    setCaptainIdleTimeout(captPartRef) {
        this.captainIdleHeadsUpReached = false;
        this.clearCaptainIdle();

        if (this.restCat.captainIdleInSecs) {
            const idleInSecs = this.restCat.captainIdleInSecs * 1000;

            this.captainIdleNotifyTimeout = setTimeout(() => this.captainIdleHeadsUp(captPartRef, Game.CAPTAINIDLE_HEADSUP), idleInSecs - Game.CAPTAINIDLE_HEADSUP);
            this.captainIdleTimeout = setTimeout(() => this.captainIsIdle(captPartRef), (this.restCat.captainIdleInSecs * 1000));
        }
    }

    captainIdleHeadsUp(captPartRef, idleHeadsUp) {
        this.captainIdleHeadsUpInSecs = idleHeadsUp;
        this.captainIdlePart = captPartRef;
        this.captainIdleHeadsUpReached = true;
    }

    captainIsIdle(captPartRef) {
        this.captainIdle = true;
        this.captainIdlePart = captPartRef;
        // this.restCat.leaveParticipant(this, captPartRef, false);
        this.clearCaptainIdle();
    }

    clearCaptainIdle() {
        clearTimeout(this.captainIdleTimeout);
    }

    addDummyPlayer(playerName) {
        var brk = false, idx = 0;

        while (!brk && idx < this.teams.length) {
            if (this.teams[idx].catRef.list.length < this.teams[idx].teamSize) brk = true;
            else idx++;
        }

        if (brk) {
            var nPartRef = new Participant({ "author" : playerName });

            if (this.teams[idx].catRef.list.length == 0) {
                this.teams[idx].setCaptParticipant(nPartRef);

            } else {
                this.teams[idx].catRef.joinParticipant(nPartRef);
            }
        }
    }
}

export default Game;
