import WordCo from './word_co';

class OpTurn {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, teamRef, wRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.logicState == 2) {

            teamRef = operRef.gameRef.getTeamByTurn();

            // msg to all
            wRef = WordCo.cre();

            wRef.text('Captain');
            teamRef.addTextFormatted(wRef, ' ' + teamRef.captPartRef.nick + ' ', false, true);
            wRef.text('now picks');

            operRef.sendMsg(false, wRef, privPartRef);

            operRef.gameRef.teams.forEach((teamRef) => {
                operRef.sendMsg(false, teamRef.addStatusReadable(WordCo.cre()), privPartRef);
            });
            
        }
    }
}

export default OpTurn;