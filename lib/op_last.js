import WordCo from './word_co';

class OpLast {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, sf, hSteps = 0, hFlag = false, hCnt = false, hList = false, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.historyRef.historyFindFlag(cStk.pop())) {
            hFlag = cStk.last();
            hCnt = cStk.pop();
            hList = [];

            for (sf = 0; sf < operRef.historyRef.gameHistory.length; sf++) {
                if (operRef.historyRef.gameHistory[sf].restCat.flag == hFlag) {
                    hList.push(operRef.historyRef.gameHistory[sf]);
                }
            }

        } else {
            hCnt = cStk.last();
            hList = operRef.historyRef.gameHistory;
        }

        if (operRef.currentCmd == 'last') {
            hSteps = isNaN(parseInt(hCnt)) ? 1 : parseInt(hCnt);
            if (hSteps < 1) hSteps = 1;

        } else if (operRef.currentCmd == 'lastt') {
            hSteps = 2;

        } else if (operRef.currentCmd == 'lasttt') {
            hSteps = 3;

        } else if (operRef.currentCmd == 'lastttt') {
            hSteps = 4;
        }

        hSteps--;

        if (hSteps >= 0 && hSteps < hList.length) {

            var hGameRef = hList[hSteps];

            // msg to all
            operRef.sendMsg(false, hGameRef.addStatusReadable(WordCo.cre(), true), privPartRef);

        } else {
            operRef.sendMsg(operRef, WordCo.cre().text('No such game history.'), privPartRef);
        }
    }
}

export default OpLast;