import WordCo from './word_co';

class OpSetCaptain {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, cRef, teamRef, teamColor, wRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.logicState == 1 || operRef.logicState == 2) {
            var cPartRef;

            if ((cPartRef = operRef.gameCatRef.getParticipantNickOrForceIndex(cStk.pop())) == null) {
                partRef.noticeMessage(operRef, WordCo.cre().text('No user ').texth(cStk.last()).text(' in the ').texth(operRef.gameRef.restCat.flag).text(' pug!'));

            } else {
                teamColor = cStk.pop();
                teamRef = null;

                if (teamColor) {
                    if ((teamRef = operRef.gameRef.getTeamByColor(teamColor)) == null) {
                        partRef.noticeMessage(operRef, WordCo.cre().text('No such team ').texth(teamColor).text('!'));
                    }

                } else {
                    if ((teamRef = operRef.gameRef.getFirstNocaptTeam()) == null) {
                        partRef.noticeMessage(operRef, WordCo.cre().text('All captains is set. Please use command with color ').texth('!setcaptain playerName color'));
                    }
                }

                if (teamRef != null) {
                    var befNocaptCount = operRef.gameRef.getNonCaptainCount();

                    operRef.gameRef.resetPickings();
                    operRef.gameRef.setCaptainToTeam(teamRef, cPartRef);

                    if (operRef.gameRef.getNonCaptainCount() > 0) {
                        operRef.logicState = 1;
                        operRef.captainTick = 3;
                        operRef.captainForce = false;
                        operRef.captainForcePicked = false;
                    }

                    operRef.saveState();

                    // msg to all
                    wRef = WordCo.cre();

                    wRef.text('Player');
                    teamRef.addTextFormatted(wRef, ' ' + cPartRef.nick + ' ', false, true);
                    wRef.text('was set as captain for ');
                    wRef.textDiscord(teamRef.getDiscordIcon());
                    teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
                    wRef.text('.');

                    if (befNocaptCount == 0 && operRef.gameRef.getNonCaptainCount() > 0) {
                        wRef.text(' (Captain on one team was removed)');
                    }

                    operRef.sendMsg(false, wRef, privPartRef);

                    // msg to specific
                    wRef = WordCo.cre();

                    wRef.text('You were set as captain for ');
                    wRef.textDiscord(teamRef.getDiscordIcon());
                    teamRef.addTextFormatted(wRef, teamRef.colorName + ' Team');
                    wRef.text(' by ');
                    wRef.texth(partRef.nick);
                    wRef.text('.');

                    cPartRef.personalMessage(operRef, wRef);

                    operRef.logicLoopTick();

                    if (operRef.gameRef.getNonCaptainCount() == 0) {
                        operRef.captainForce = true;
                        operRef.captainForcePicked = true;
                    }

                } // if
            }

        } // if
    }
}

export default OpSetCaptain;