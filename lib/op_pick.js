import WordCo from './word_co';

class OpPick {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, catRef, result, tt, teamRef, wRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.logicState == 0 && (cStk.last() == 'p' || cStk.last() == 'pall' || cStk.last() == 'promote' || cStk.last() == 'promoteall')) {

            var isAll = cStk.last() == 'pall' || cStk.last() == 'promoteall';

            if ((catRef = operRef.getCatRef(false, cStk.popMod(false), channelKey)) == null) {
                partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

            } else if (!catRef.isFull()) {

                operRef.botRef.getChannelKeysFilter(isAll ? false : channelKey).forEach((cChannelKey) => {

                    var wo = WordCo.cre();

                    wo.text('Only ').texth(catRef.playerLimit - catRef.list.length, true).text(' needed for the ').texth(catRef.flag).text(' pug!');
                    wo.text(' Type ').texth('.j ' + catRef.flag).text(' to join.');

                    if (catRef.channelKey != cChannelKey && (tt = operRef.botRef.channels[catRef.channelKey]) && tt['channelDiscord']) {
                        wo.channelLink(tt, ' (', ')');
                    }

                    operRef.sendMsg(cChannelKey, wo);

                });
            }

        } else if (operRef.logicState == 2) {

            while ((tt = cStk.pop()) != false) {
                result = operRef.gameRef.doPickPlayer(partRef, tt);

                if (result == -2) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('Player ').texth(tt).text(' not found!'));
                    break;

                } else if (result == -1) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('Currently picking ').texth(operRef.gameRef.getTeamByTurn().captPartRef.nick).text('!'));
                    break;

                } else if (result >= 0) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('You picked player ').texth(operRef.gameRef.lastPickPartRef.nick).text('.'));

                    if (result == 1) {
                        // pick turn

                        operRef.gameRef.teams.forEach((teamRef) => {

                            operRef.sendMsg(teamRef.channelKey, teamRef.addStatusReadable(WordCo.cre()), privPartRef);

                        });

                        teamRef = operRef.gameRef.getTeamByTurn();

                        // msg to all
                        wRef = WordCo.cre();
                        wRef.text('Captain');
                        teamRef.addTextFormatted(wRef, ' ' + teamRef.captPartRef.nick + ' ', false, true);
                        wRef.text('now picks');

                        operRef.sendMsg(operRef.gameRef.channelKey, wRef, privPartRef);

                        break;
                        
                    } else if (result == 2) {
                        // picking finished

                        operRef.pickingHasFinished();
                        break;
                    }
                }
            }

        }
    }
}

export default OpPick;