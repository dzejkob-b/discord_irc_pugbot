import WordCo from './word_co';

class OpDeltag {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, catRef, cRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if ((catRef = operRef.getCatRef(cStk.popMod())) == null) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

        } else if ((cRef = catRef.getParticipant(partRef)) != null) {

            cRef.setTag(false);

            if (operRef.gameRef) {
                operRef.gameRef.setTagByPart(cRef, false);
            }
            
            partRef.noticeMessage(operRef, WordCo.cre().text('Your nicktag was removed.'));

        }
    }
}

export default OpDeltag;