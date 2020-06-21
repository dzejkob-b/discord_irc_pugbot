import WordCo from './word_co';

class OpDelHistory {
    constructor(parent) {
        this.parent = parent;
    }

    exec() {
        let operRef = this.parent,
            hIdx,
            cStk = this.parent.cStk,
            partRef = this.parent.partRef;

        hIdx = parseInt(cStk.pop());
        if (isNaN(hIdx)) hIdx = 0;

        partRef.noticeMessage(operRef, WordCo.cre().text('Deprecated!'));

        /*
        if (operRef.historyRef.historyDelete(hIdx)) {
            partRef.noticeMessage(operRef, WordCo.cre().text('History entry was deleted.'));

        } else {
            partRef.noticeMessage(operRef, WordCo.cre().text('Invalid number ').texth(hIdx).text('!'));
        }
        */
    }
}

export default OpDelHistory;
