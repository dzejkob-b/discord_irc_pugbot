import WordCo from './word_co';

class OpEatStats {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        operRef.statsRef.eatIni(cStk.pop(), (msg) => {

            operRef.sendMsg(false, WordCo.cre().text(msg), privPartRef);

        });
    }
}

export default OpEatStats;