import WordCo from './word_co';

class OpRestart {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        operRef.botRef.doQuit(true);
    }
}

export default OpRestart;