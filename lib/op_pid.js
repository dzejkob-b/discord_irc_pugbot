import WordCo from './word_co';

class OpPid {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;
        
        operRef.msgRef.sendMsg(channelKey, WordCo.cre().text(process.pid), privPartRef);
    }
}

export default OpPid;