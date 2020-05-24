import WordCo from './word_co';

class OpLast {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, sf, hSteps = 0, hFlag = false, hCnt = false, hList = [], cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.historyRef.historyFindFlag(cStk.pop())) {
            hFlag = cStk.last();
            hCnt = cStk.pop();
            
        } else {
            hCnt = cStk.last();
        }

        for (sf = 0; sf < operRef.historyRef.gameHistory.length; sf++) {
            if (
                (operRef.historyRef.gameHistory[sf].channelKey == channelKey) &&
                (!hFlag || operRef.historyRef.gameHistory[sf].restCat.flag == hFlag)
            ) {
                hList.push(operRef.historyRef.gameHistory[sf]);
            }
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
            operRef.sendMsg(channelKey, hGameRef.addStatusReadable(WordCo.cre(), true), privPartRef);

        } else {
            operRef.sendMsg(channelKey, WordCo.cre().text('No such game history.'), privPartRef);
        }
    }
}

export default OpLast;