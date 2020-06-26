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
            partRef.noticeMessage(operRef, cStk.first() ? WordCo.cre().text('No such pug ').texth(cStk.first()).text('!') : WordCo.cre().text('Please specify pug!'));

        } else if (isNaN(gameTime = parseInt(cStk.pop()))) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Invalid history time!'));

        } else {
            partRef.noticeMessage(operRef, WordCo.cre().text('Deprecated!'));
        }
    }
}

export default OpAddHistory;