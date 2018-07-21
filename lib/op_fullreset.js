import WordCo from './word_co';

class OpFullReset {
    constructor(parent) {

        this.parent = parent;

    }
    
    exec() {
        let operRef = this.parent, catRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if ((catRef = operRef.getCatRef(cStk.popMod())) == null) {
            operRef.sendMsg(false, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'), privPartRef);

        } else {
            catRef.flushParticipants();

            operRef.logicState = 0;
            operRef.voteRef.clear();

            // msg to all
            operRef.sendMsg(false, WordCo.cre().text('The ').texth(catRef.flag).text(' pug was reset.'), privPartRef);
        }
    }
}

export default OpFullReset;