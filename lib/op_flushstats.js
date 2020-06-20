import WordCo from './word_co';

class OpFlushStats {
    constructor(parent) {
        this.parent = parent;
    }

    exec(channelKey) {
        let operRef = this.parent, privPartRef = this.parent.privPartRef;

        operRef.statsRef.flushStats(() => {

            operRef.sendMsg(channelKey, WordCo.cre().text("Stats were flushed."), privPartRef);

        });
    }
}

export default OpFlushStats;