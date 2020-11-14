import WordCo from './word_co';

class OpAvgPick {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, acRef = operRef.getAction(channelKey), catRef = null, tmList = [], wRef, teamRef, chCats, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.currentCmd != 'avgpickspec' && (acRef.logicState == 2 || acRef.logicState == 1)) {

            acRef.gameRef.restCat.loadAvgPick(operRef.statsRef, false, function(aMth) {
                
                wRef = WordCo.cre();

                if (acRef.logicState == 2 && (teamRef = acRef.gameRef.getTeamByTurn()) != null) {
                    wRef.text('Captain');
                    teamRef.addTextFormatted(wRef, ' ' + teamRef.captPartRef.nick + ' ', false, true);
                    wRef.text('now picks: ');
                }

                wRef = acRef.gameRef.restCat.addStatusReadableAvgPick(aMth, wRef, true, acRef.voteRef, channelKey, operRef);

                tmList.push(wRef);

                if (tmList.length > 0) {
                    operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
                }
                
            });

        } else {

            var lastPop = false;

            if ((lastPop = cStk.pop()) != false && (catRef = operRef.getCatRef(false, lastPop)) == null) {
                cStk.add(lastPop);
            }

            if (catRef != null) {
                // exist ...

            } else if ((chCats = operRef.getCatsInChannel(channelKey)) == false || chCats.length == 0) {
                partRef.noticeMessage(operRef, WordCo.cre().text('No available pugs in this channel!'));

            } else if (chCats.length > 1) {

                if (lastPop) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(lastPop).text('!'));

                } else {
                    partRef.noticeMessage(operRef, WordCo.cre().text('Please specify pug!'));
                }

            } else {
                catRef = chCats[0];
            }

            if (catRef != null && (operRef.currentCmd == 'avgpickspec' || (lastPop = cStk.pop()))) {

                if (lastPop) {
                    cStk.add(lastPop);
                }

                var tt, idx, nicks = [], mth = false;

                while ((tt = cStk.pop()) != false) {
                    if ((idx = tt.indexOf(':')) > 0 && tt.substr(0, idx) == 'method') {

                        tt = tt.substr(idx + 1);

                        if ((mth = operRef.statsRef.parseAvgStatMethod(tt)) == false) {

                            nicks = [];
                            partRef.noticeMessage(operRef, WordCo.cre().text('Invalid avg stats method ').texth(tt).text('!'));

                            break;
                        }

                    } else {
                        nicks.push(tt);
                    }
                }

                operRef.getUserList(nicks, (users) => {

                    if (users.length > 0) {
                        var nCatRef = catRef.getClone();

                        nCatRef.list = users;

                        nCatRef.loadAvgPick(operRef.statsRef, mth, function(aMth) {

                            tmList.push(nCatRef.addStatusReadableAvgPick(aMth, WordCo.cre(), false, acRef.voteRef, channelKey, operRef));

                            if (tmList.length > 0) {
                                operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
                            }

                        });
                    }
                    
                }, true);

            } else if (catRef != null) {
                catRef.loadAvgPick(operRef.statsRef, false, function(aMth) {

                    tmList.push(catRef.addStatusReadableAvgPick(aMth, WordCo.cre(), false, acRef.voteRef, channelKey, operRef));

                    if (tmList.length > 0) {
                        operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
                    }

                });
            }
        }
    }
}

export default OpAvgPick;
