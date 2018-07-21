import WordCo from './word_co';

class OpQuit {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        operRef.botRef.doQuit();
    }
}

export default OpQuit;