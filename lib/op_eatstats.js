import WordCo from './word_co';

class OpEatStats {
    constructor(parent) {
        this.parent = parent;
    }

    exec(channelKey) {
        let operRef = this.parent, cStk = this.parent.cStk, privPartRef = this.parent.privPartRef;

        operRef.statsRef.sumRef.eatIni(cStk.pop(), (msg) => {
            
            operRef.sendMsg(channelKey, WordCo.cre().text(msg), privPartRef);

        });
    }
}

export default OpEatStats;