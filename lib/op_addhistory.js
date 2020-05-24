import WordCo from './word_co';
import Game from './game';

class OpAddHistory {
    constructor(parent) {

        this.parent = parent;

    }
    
    exec(channelKey) {
        let operRef = this.parent, catRef, wRef, gameTime, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (!operRef.anyCats(channelKey)) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No available pugs in this channel!'));

        } else if ((catRef = operRef.getCatRef(channelKey, cStk.popMod(channelKey))) == null) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

        } else if (isNaN(gameTime = parseInt(cStk.pop()))) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Invalid history time!'));

        } else {
            var cPlayer, addGameRef = new Game(channelKey, catRef, catRef.teamCount);

            addGameRef.timeCapt = gameTime;
            addGameRef.timeFinished = gameTime;

            while (cPlayer = cStk.pop()) {
                addGameRef.addDummyPlayer(cPlayer);
            }

            operRef.historyRef.historyAddGame(addGameRef);
            operRef.saveState();

            wRef = WordCo.cre();
            wRef.text('History added: ');
            addGameRef.addStatusReadable(wRef, true);

            operRef.sendMsg(channelKey, wRef, privPartRef);
        }
    }
}

export default OpAddHistory;