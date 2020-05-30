import WordCo from './word_co';

class OpCaptain {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, cRef, teamRef, wRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.logicState == 1) {
            if (!operRef.gameRef.partInGame(partRef)) {
                partRef.noticeMessage(operRef, WordCo.cre().text('You not in the ').texth(operRef.gameRef.restCat.flag).text(' pug!'));
                
            } else if (operRef.gameRef.getTeamByCaptain(partRef) != null) {
                partRef.noticeMessage(operRef, WordCo.cre().text('You allready are captain!'));

            } else if ((teamRef = operRef.gameRef.setCaptainFirstPossibleTeam(partRef, 'wanted')) != null) {

                // msg to all
                wRef = WordCo.cre();

                wRef.text('Player');
                teamRef.addTextFormatted(wRef, ' ' + partRef.nick + ' ', false, true);
                wRef.text('became captain for ');
                wRef.textDiscord(teamRef.getDiscordIcon());
                teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
                wRef.text('.');

                operRef.sendMsg(channelKey, wRef, privPartRef);
                operRef.logicLoopTick();

                if (operRef.gameRef.getNonCaptainCount() == 0) {
                    operRef.captainForce = true;
                    operRef.captainForcePicked = true;
                }

            } else {
                partRef.noticeMessage(operRef, WordCo.cre().text('All teams allready have captains!'));
            }
        }
    }
}

export default OpCaptain;