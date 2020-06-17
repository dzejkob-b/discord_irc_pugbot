import WordCo from './word_co';

class OpDelHistory {
    constructor(parent) {

        this.parent = parent;

    }
    
    exec(channelKey) {
        let operRef = this.parent, hIdx, sf, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;
        
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