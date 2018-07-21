import WordCo from './word_co';

class OpHere {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, cRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        operRef.cats.forEach((catRef) => {
            if ((cRef = catRef.getParticipant(partRef)) != null) {

                cRef.refreshTime();

            }
        });
    }
}

export default OpHere;