import WordCo from './word_co';
import Operator from './operator';
import VoteOperator from './vote';
import Game from './game';
import Catalog from './catalog';

class ChannelAction {
    constructor(operRef, channelKey) {

        this.operRef = operRef;
        this.msgRef = operRef.msgRef;
        this.statsRef = operRef.statsRef;

        this.channelKey = channelKey;

        this.logicState = 0;

        this.captainTick = 0;
        this.captainForce = false;
        this.captainForcePicked = false;

        this.gameRef = null;
        this.gameCatRef = null;

        this.captainPickSeconds = 20;

        this.voteRef = new VoteOperator(this);
        
    }

    toJSON() {
        var result = {
            "channelKey" : this.channelKey,
            "logicState" : this.logicState,
            "captainTick" : this.captainTick,
            "captainForce" : this.captainForce,
            "voteRef" : this.voteRef.toJSON(),
            "gameRef" : this.gameRef != null ? this.gameRef.toJSON() : null,
            "gameCatRef" : this.gameCatRef != null ? this.gameCatRef.toJSON() : null
        };

        return result;
    }

    static fromJSON(operRef, input) {
        var ref = new ChannelAction(operRef);

        ["channelKey", "logicState", "captainTick", "captainForce"].forEach((c) => {
            if (typeof input[c] != 'undefined') {
                ref[c] = input[c];
            }
        });
        
        if (input["voteRef"]) {
            ref.voteRef = VoteOperator.fromJSON(ref, input["voteRef"]);
        }

        ref.gameRef = input["gameRef"] ? Game.fromJSON(input["gameRef"]) : null;
        ref.gameCatRef = input["gameCatRef"] ? Catalog.fromJSON(input["gameCatRef"]) : null;

        if (ref.gameRef == null) {
            ref.logicState = 0;
        }

        return ref;
    }

    startSelectCaptains(catRef, startSeconds) {
        // create game reference

        this.gameRef = new Game(catRef.channelKey, catRef, catRef.teamCount);
        this.gameCatRef = catRef;
        
        this.logicState = 1;
        this.captainTick = startSeconds ? startSeconds : 0;
        this.captainForce = false;
        this.captainForcePicked = false;

        if (!this.operRef.botRef.playMultiPugs) {
            // leave participants from other pugs

            this.gameRef.getAllParticipants().forEach((cPartRef) => {

                const removedPugs = this.operRef.removePlayerFromAllOtherCatalogs(this.gameRef.restCat, cPartRef); // should probably be the other way around.

                if (removedPugs.length > 0) {

                    cPartRef.personalMessage(this.operRef, WordCo.cre().texth(` You've been removed from [${removedPugs.map(p => p.flag).join(", ")}]`), true);

                }

            });
        }

        this.saveState();
    }

    clearSelectCaptains() {

        this.logicState = 0;
        this.captainForce = false;
        this.captainForcePicked = false;

        if (this.gameRef) {
            this.gameRef.clearCaptainIdle();
        }

        this.gameRef = null;
        this.gameCatRef = null;

        this.saveState();
    }

    logicLoop() {
        let wRef;
        
        if (this.logicState == 0) {
            // joining ...

        } else if (this.logicState == 1) {
            // captain picking

            let tmList = [], chk = this.gameRef.channelKey;

            if (this.gameRef.teams.length == 0) {

                tmList.push(WordCo.cre().text('The ').texth(this.gameRef.restCat.flag).text(' pug has been filled!'));
                tmList.push(WordCo.cre());
                tmList.push(this.gameRef.restCat.addStatusReadable(WordCo.cre(), false, this.voteRef));
                tmList.push(WordCo.cre().text('Pug is without teams so go server now please!'));

                this.gameRef.getAllParticipants().forEach((cPartRef) => {

                    cPartRef.personalMessage(this.operRef, WordCo.cre().text('The ').texth(this.gameRef.restCat.flag).text(' pug has been filled! Go server now please!'), true);

                });

                this.statsRef.saveGameToStats(this.gameRef, this.voteRef);

                this.gameHasFinished();

                this.saveState();

            } else if (this.captainTick == 1) {

                tmList.push(WordCo.cre().text('The ').texth(this.gameRef.restCat.flag).text(' pug has been filled!'));
                tmList.push(WordCo.cre());
                tmList.push(this.gameRef.restCat.addStatusReadable(WordCo.cre(), false, this.voteRef));
                
                this.gameRef.getAllParticipants().forEach((cPartRef) => {

                    cPartRef.personalMessage(this.operRef, WordCo.cre().text('The ').texth(this.gameRef.restCat.flag).text(' pug has been filled! Please be prepared.'), true);

                    /*
                    const message = WordCo.cre().text('The ').texth(this.gameRef.restCat.flag).text(' pug has been filled! Please be prepared.');

                    if (!this.operRef.botRef.playMultiPugs) {
                        const removedPugs = this.operRef.removePlayerFromAllOtherCatalogs(this.gameRef.restCat, cPartRef); // should probably be the other way around.

                        if (removedPugs.length > 0) {
                            message.texth(` You've been removed from [${removedPugs.map(p => p.flag).join(", ")}]`);
                        }
                    }

                    cPartRef.personalMessage(this.operRef, message, true);
                    */

                });

            } else if (!this.captainForce && this.captainTick == 2) {

                wRef = WordCo.cre();
                wRef.text('Picking random captains in ').texth(this.captainPickSeconds).text(' seconds.');
                if (this.gameRef.restCat.limitNoCaptTag > 0) {
                    wRef.text(' Players tagged nocapt will be avoided.');
                }
                wRef.texth(' Type !captain').text(' to become a captain.');

                if (this.gameRef.restCat.possibleVotes > 0) {
                    wRef.text(' Use ');
                    wRef.texth('!vote [player]').text(' to vote for your captain (you got ' + this.gameRef.restCat.possibleVotes + ' votes).');
                }

                tmList.push(wRef);

            } else if (!this.captainForce && this.captainPickSeconds - (this.captainTick - 2) == 5) {

                if (this.voteRef == null) {
                    tmList.push(WordCo.cre().text('Random captains in ').texth('5').text(' seconds!'));

                } else {
                    tmList.push(WordCo.cre().text('Captains will be picked in ').texth('5').text(' seconds!'));
                }

            } else if (this.captainForce || this.captainPickSeconds - (this.captainTick - 2) <= 0) {

                let self = this;

                this.gameRef.doPickCaptains(this.operRef, this.voteRef, () => {

                    if (self.logicState == 0) {
                        return false;
                    }

                    var teamRef, tmList = [];

                    if (!self.captainForcePicked) {

                        var idx = 0;

                        while (idx < self.gameRef.teams.length) {
                            teamRef = self.gameRef.teams[idx];

                            // channel notify
                            wRef = WordCo.cre();
                            wRef.text('Player');
                            teamRef.addTextFormatted(wRef, ' ' + teamRef.captPartRef.nick + ' ', false, true);

                            if (teamRef.captPartRef.captainSetMethod) {
                                var cptSetFlag = '';

                                switch (teamRef.captPartRef.captainSetMethod) {
                                    case 'enforced' :
                                        cptSetFlag = 'Enforced captain';
                                        break;

                                    case 'wanted' :
                                        cptSetFlag = 'Wanted captain';
                                        break;

                                    case 'random' :
                                        cptSetFlag = 'Random captain';
                                        break;
                                }

                                if (teamRef.captPartRef.avgTotPick) {
                                    wRef.text(' ').texth('[').text(cptSetFlag ? (cptSetFlag + ' avg pick: ') : ('Avg pick: ')).text(teamRef.captPartRef.avgPick).texth('/').text(teamRef.captPartRef.avgTotPick).texth(']').text(' ');

                                } else if (cptSetFlag) {
                                    wRef.text(' ').texth('[').text(cptSetFlag).texth(']').text(' ');

                                } else if (teamRef.captPartRef.captainSetMethod == 'avgpick') {
                                    wRef.text(' ').texth('[').text('random').texth(']').text(' ');
                                }
                            }


                            wRef.text('is captain for the ');
                            wRef.textDiscord(teamRef.getDiscordIcon());
                            teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
                            wRef.text('.');

                            tmList.push(wRef);

                            // captain notify
                            wRef = WordCo.cre();

                            wRef.text('You are captain for ');
                            wRef.textDiscord(teamRef.getDiscordIcon());
                            teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
                            wRef.text('.');

                            teamRef.captPartRef.personalMessage(self.operRef, wRef);

                            idx++;
                        }
                    }

                    teamRef = self.gameRef.getTeamByTurn();

                    tmList.push(WordCo.cre());

                    wRef = WordCo.cre();
                    wRef.text('Captains have been picked. Captain');
                    teamRef.addTextFormatted(wRef, ' ' + teamRef.captPartRef.nick + ' ', false, true);
                    wRef.text('picks first: ');

                    wRef = self.gameRef.restCat.addStatusReadable(wRef, true, self.voteRef, chk, self);

                    tmList.push(wRef);

                    self.gameRef.areCaptainsSet = true;
                    self.logicState = 2;
                    self.gameRef.setCaptainIdleTimeout(teamRef.captPartRef);
                    self.saveState();

                    if (self.gameRef.restCat.isEmpty()) {
                        var finList = self.pickingHasFinished();

                        if (finList.length > 0 && tmList.length > 0) {
                            tmList.push(WordCo.cre());
                        }

                        finList.forEach((c) => {

                            tmList.push(c);

                        });
                    }

                    if (tmList.length > 0) {
                        self.msgRef.sendMsgArrayPrep(chk, tmList);
                    }

                });

            }

            if (tmList.length > 0) {
                this.msgRef.sendMsgArrayPrep(chk, tmList);
            }

            this.captainTick++;


        } else if (this.logicState == 2) {
            // player picking

            const gameCatRef = this.gameCatRef;

            if (this.gameRef.captainIdle && this.gameRef.captainIdlePart) {
                this.msgRef.sendMsg(gameCatRef.channelKey, WordCo.cre().text('The ').texth(gameCatRef.flag).text(' pug stopped because ').texth(this.gameRef.captainIdlePart.nick).text(' was idle.'));

                this.gameCatRef.leaveParticipantCooldown(this.gameRef, this.gameRef.captainIdlePart, false, true);
                this.gameRef.areCaptainsSet = false;
                this.gameRef.clearCaptainIdle();
                this.logicState = 0;

            } else if (this.gameRef.captainIdleInSecs > 0 && this.gameRef.captainIdleHeadsUpReached && this.gameRef.captainIdlePart) { // because of 'this.gameRef.captainIdlePart' in condition, when bot died in picking it won't give headsup.. should be improved.

                this.gameRef.captainIdleHeadsUpReached = false;
                this.gameRef.captainIdlePart.noticeMessage(this.operRef, wRef);
                this.msgRef.sendMsg(gameCatRef.channelKey, `<@${this.gameRef.captainIdlePart.id}> wake up! You have ${(this.gameRef.captainIdleHeadsUpInSecs / 1000)} seconds to pick a player. Type '.here' for extra time.`, null, true);
            }
        }
    }

    pickingHasFinished() {
        var tmList = [];

        if (this.logicState == 2) {

            // global msg

            let wRef;

            this.gameRef.teams.forEach((teamRef) => {

                tmList.push(teamRef.addStatusReadable(WordCo.cre()));

            });

            tmList.push(WordCo.cre());
            tmList.push(WordCo.cre().text('Picking has finished.'));

            // notify participants

            this.gameRef.teams.forEach((teamRef) => {
                teamRef.catRef.list.forEach((cPartRef) => {

                    wRef = WordCo.cre();
                    wRef.text('Picking has finished. You are member of the ');
                    wRef.textDiscord(teamRef.getDiscordIcon());
                    teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
                    wRef.text('. Go server now please!');

                    cPartRef.personalMessage(this.operRef, wRef, true);

                });
            });

            this.statsRef.saveGameToStats(this.gameRef, this.voteRef);

	      this.gameRef.areCaptainsSet = false;

	      this.gameHasFinished();

            this.saveState();

        }

        return tmList;
    }

    gameHasFinished() {

        if (this.logicState == 2 || this.logicState == 1) {

            this.gameRef.timeFinished = (new Date()).getTime() / 1000;

            var catRef;

            if ((catRef = this.operRef.getCatRef(this.gameRef.channelKey, this.gameRef.restCat.flag)) != null) {
                catRef.flushParticipants();

                if (catRef.isQuick) {
                    this.operRef.deleteCatRef(catRef.channelKey, catRef.flag);
                }
            }

            this.voteRef.clear();

            this.logicState = 0;
        }
    }

    saveState() {
        this.operRef.saveState();
    }
}

export default ChannelAction;