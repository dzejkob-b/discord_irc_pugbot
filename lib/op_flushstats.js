import WordCo from './word_co';

class OpFlushStats {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        operRef.statsRef.flushStats(() => {

            operRef.sendMsg(false, WordCo.cre().text("Stats were flushed."), privPartRef);

        });
    }
}

export default OpFlushStats;