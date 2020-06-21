class OpQuit {
    constructor(parent) {
        this.parent = parent
    }

    exec() {
        let operRef = this.parent

        operRef.botRef.doQuit()
    }
}

export default OpQuit
