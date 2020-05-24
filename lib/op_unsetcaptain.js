import WordCo from './word_co';

class OpUnsetCaptain {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, teamRef, teamColor, wRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.logicState == 1 || operRef.logicState == 2) {

            teamColor = cStk.pop();
            teamRef = null;

            if ((teamRef = operRef.gameRef.getTeamByColor(teamColor)) == null) {
                partRef.noticeMessage(operRef, WordCo.cre().text('No such team ').texth(teamColor).text('!'));

            } else if (teamRef.captPartRef == null) {
                partRef.noticeMessage(operRef, WordCo.cre().text('Team ').texth(teamRef.colorName).text(' dont have captain!'));

            } else {
                let befCaptPartRef = teamRef.captPartRef;

                operRef.gameRef.resetPickings();

                teamRef.unsetCaptParticipant(teamRef);
                operRef.gameRef.restCat.joinParticipant(befCaptPartRef, false, true);

                operRef.logicState = 1;
                operRef.captainTick = 3;
                operRef.captainForce = false;
                operRef.captainForcePicked = false;

                operRef.saveState();

                wRef = WordCo.cre();

                wRef.text('Captain');
                teamRef.addTextFormatted(wRef, ' ' + befCaptPartRef.nick + ' ', false, true);
                wRef.text('of ');
                wRef.textDiscord(teamRef.getDiscordIcon());
                teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
                wRef.text(' was removed.');

                operRef.sendMsg(channelKey, wRef, privPartRef);

                operRef.logicLoopTick();
            }

        } // if
    }
}

export default OpUnsetCaptain;