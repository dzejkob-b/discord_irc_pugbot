import WordCo from './word_co';

class OpAvgPick {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, catRef = null, tmList = [], wRef, teamRef, chCats, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;
        
        if (operRef.getAction(channelKey).logicState == 2 || operRef.getAction(channelKey).logicState == 1) {

            var acRef = operRef.getAction(channelKey);

            acRef.gameRef.restCat.loadAvgPick(operRef.statsRef, function() {
                
                wRef = WordCo.cre();

                if (operRef.getAction(channelKey).logicState == 2 && (teamRef = acRef.gameRef.getTeamByTurn()) != null) {
                    wRef.text('Captain');
                    teamRef.addTextFormatted(wRef, ' ' + teamRef.captPartRef.nick + ' ', false, true);
                    wRef.text('now picks: ');
                }

                wRef = acRef.gameRef.restCat.addStatusReadableAvgPick(wRef, true, acRef.voteRef, channelKey, operRef);

                tmList.push(wRef);

                if (tmList.length > 0) {
                    operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
                }
                
            });

        } else {

            if (cStk.pop() != false) {
                if ((catRef = operRef.getCatRef(false, cStk.last())) == null) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));
                }
                
            } else if ((chCats = operRef.getCatsInChannel(channelKey)) == false || chCats.length == 0) {
                partRef.noticeMessage(operRef, WordCo.cre().text('No available pugs in this channel!'));

            } else if (chCats.length > 1) {
                partRef.noticeMessage(operRef, WordCo.cre().text('Please specify pug!'));

            } else {
                catRef = chCats[0];
            }

            if (catRef != null) {
                catRef.loadAvgPick(operRef.statsRef, function() {

                    tmList.push(catRef.addStatusReadableAvgPick(WordCo.cre(), false, acRef.voteRef, channelKey, operRef));

                    if (tmList.length > 0) {
                        operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
                    }

                });
            }
        }
    }
}

export default OpAvgPick;
