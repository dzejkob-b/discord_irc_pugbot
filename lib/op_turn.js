import WordCo from './word_co';

class OpTurn {
    constructor(parent) {
        this.parent = parent;
    }

    exec(channelKey) {
        let operRef = this.parent, teamRef, tmList = [], wRef, privPartRef = this.parent.privPartRef;

        if (operRef.logicState == 2) {

            teamRef = operRef.gameRef.getTeamByTurn();

            // msg to all
            wRef = WordCo.cre();

            wRef.text('Captain');
            teamRef.addTextFormatted(wRef, ' ' + teamRef.captPartRef.nick + ' ', false, true);
            wRef.text('now picks: ');
            
            wRef = operRef.gameRef.restCat.addStatusReadable(wRef, true, operRef.voteRef, channelKey, operRef);

            tmList.push(wRef);
            tmList.push(WordCo.cre());

            operRef.gameRef.teams.forEach((teamRef) => {

                tmList.push(teamRef.addStatusReadable(WordCo.cre()));

            });

            operRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
        }
    }
}

export default OpTurn;