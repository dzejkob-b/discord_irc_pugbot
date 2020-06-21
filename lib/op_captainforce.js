class OpCaptainForce {
    constructor(parent) {
        this.parent = parent;
    }

    exec() {
        let operRef = this.parent;

        if (operRef.logicState == 1) {
            operRef.captainForce = true;
        }
    }
}

export default OpCaptainForce;
