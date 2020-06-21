class OpRestart {
    constructor(parent) {
        this.parent = parent;
    }

    exec() {
        let operRef = this.parent;

        operRef.botRef.doQuit(true);
    }
}

export default OpRestart;
