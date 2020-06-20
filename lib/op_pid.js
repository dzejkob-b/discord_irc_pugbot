import WordCo from './word_co';

class OpPid {
    constructor(parent) {
        this.parent = parent;
    }

    exec(channelKey) {
        let operRef = this.parent, privPartRef = this.parent.privPartRef;
        
        operRef.sendMsg(channelKey, WordCo.cre().text(process.pid), privPartRef);
    }
}

export default OpPid;