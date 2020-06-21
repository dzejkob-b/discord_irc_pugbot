import WordCo from './word_co'

class OpAddHistory {
    constructor(parent) {
        this.parent = parent
    }

    exec(channelKey) {
        let operRef = this.parent,
            cStk = this.parent.cStk,
            partRef = this.parent.partRef

        if (!operRef.anyCats(channelKey)) {
            partRef.noticeMessage(
                operRef,
                WordCo.cre().text('No available pugs in this channel!')
            )
        } else if (
            operRef.getCatRef(channelKey, cStk.popMod(channelKey)) == null
        ) {
            partRef.noticeMessage(
                operRef,
                cStk.first()
                    ? WordCo.cre()
                          .text('No such pug ')
                          .texth(cStk.first())
                          .text('!')
                    : WordCo.cre().text('Please specify pug!')
            )
        } else if (isNaN(parseInt(cStk.pop()))) {
            partRef.noticeMessage(
                operRef,
                WordCo.cre().text('Invalid history time!')
            )
        } else {
            partRef.noticeMessage(operRef, WordCo.cre().text('Deprecated!'))

            /*
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
            */
        }
    }
}

export default OpAddHistory
