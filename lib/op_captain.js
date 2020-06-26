import WordCo from './word_co';

class OpCaptain {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, acRef, cRef, teamRef, wRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if ((acRef = operRef.getAction(channelKey)) == null || acRef.logicState != 1) {
            // ...

        } else if (!acRef.gameRef.partInGame(partRef)) {
            partRef.noticeMessage(operRef, WordCo.cre().text('You not in the ').texth(acRef.gameRef.restCat.flag).text(' pug!'));

        } else if (acRef.gameRef.getTeamByCaptain(partRef) != null) {
            partRef.noticeMessage(operRef, WordCo.cre().text('You allready are captain!'));

        } else if ((teamRef = acRef.gameRef.setCaptainFirstPossibleTeam(partRef, 'wanted')) != null) {

            // msg to all
            wRef = WordCo.cre();

            wRef.text('Player');
            teamRef.addTextFormatted(wRef, ' ' + partRef.nick + ' ', false, true);
            wRef.text('became captain for ');
            wRef.textDiscord(teamRef.getDiscordIcon());
            teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
            wRef.text('.');

            operRef.msgRef.sendMsg(channelKey, wRef, privPartRef);
            operRef.logicLoopTick();

            if (acRef.gameRef.getNonCaptainCount() == 0) {
                acRef.captainForce = true;
                acRef.captainForcePicked = true;
            }

        } else {
            partRef.noticeMessage(operRef, WordCo.cre().text('All teams allready have captains!'));
        }
    }
}

export default OpCaptain;