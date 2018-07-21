import WordCo from './word_co';

class OpJoin {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, catRef, result, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;
        
        if (operRef.logicState != 0) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Cannot join - pug starting!'));

        } else if ((catRef = operRef.getCatRef(cStk.popMod())) == null) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

        } else {
            result = catRef.joinParticipant(partRef);

            if (result == -1) {
                partRef.noticeMessage(operRef, WordCo.cre().text('You allready joined to ').texth(catRef.flag).text(' pug!'));

            } else if (result == -2) {
                partRef.noticeMessage(operRef, WordCo.cre().text('You cannot join to ').texth(catRef.flag).text(' pug - capacity is full! (').texth(catRef.playerLimit).text(')'));

            } else if (result == 0 || result == 1) {
                partRef.noticeMessage(operRef, WordCo.cre().text('You joined to ').texth(catRef.flag).text(' pug.'));
            }

            if (result == 1) {
                operRef.startSelectCaptains(catRef);
            }
        }
    }
}

export default OpJoin;