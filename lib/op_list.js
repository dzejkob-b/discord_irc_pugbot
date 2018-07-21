import WordCo from './word_co';

class OpList {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, catRef, wRef, hist, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.logicState == 2 || operRef.logicState == 1) {
            operRef.sendMsg(false, operRef.gameRef.restCat.addStatusReadable(WordCo.cre(), true, operRef.voteRef), privPartRef);

        } else if (cStk.pop() != false) {

            if ((catRef = operRef.getCatRef(cStk.last())) == null) {
                partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

            } else {
                operRef.sendMsg(false, catRef.addStatusReadable(WordCo.cre(), false, operRef.voteRef), privPartRef);
            }

        } else if (operRef.cats.length > 1) {

            if (operRef.currentCmd == 'liast') {
                if (hist = operRef.historyRef.getFirst()) {
                    operRef.sendMsg(false, hist.addStatusReadable(WordCo.cre(), true), privPartRef);

                } else {
                    operRef.sendMsg(operRef, WordCo.cre().text('No game history.'), privPartRef);
                }
            }

            var sf;

            wRef = WordCo.cre();

            for (sf = 0; sf < operRef.cats.length; sf++) {
                if (sf != 0) wRef.sep();
                operRef.cats[sf].addStatusReadableShort(wRef);
            }

            operRef.sendMsg(false, wRef, privPartRef);

        } else if ((catRef = operRef.getCatRef(false)) != null) {

            if (operRef.currentCmd == 'liast') {
                if (hist = operRef.historyRef.getFirst()) {
                    operRef.sendMsg(false, hist.addStatusReadable(WordCo.cre(), true), privPartRef);

                } else {
                    operRef.sendMsg(operRef, WordCo.cre().text('No game history.'), privPartRef);
                }
            }

            operRef.sendMsg(false, catRef.addStatusReadable(WordCo.cre(), false, operRef.voteRef), privPartRef);
        }
    }
}

export default OpList;