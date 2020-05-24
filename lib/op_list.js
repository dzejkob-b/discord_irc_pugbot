import WordCo from './word_co';

class OpList {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, catRef, wRef, hist, chCats, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.logicState == 2 || operRef.logicState == 1) {
            operRef.sendMsg(channelKey, operRef.gameRef.restCat.addStatusReadable(WordCo.cre(), true, operRef.voteRef), privPartRef);

        } else if (cStk.pop() != false) {

            if ((catRef = operRef.getCatRef(channelKey, cStk.last())) == null) {
                partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

            } else {
                operRef.sendMsg(channelKey, catRef.addStatusReadable(WordCo.cre(), false, operRef.voteRef), privPartRef);
            }

        } else if ((chCats = operRef.getCatsInChannel(channelKey)) != false && chCats.length > 1) {
            
            if (operRef.currentCmd == 'liast') {
                if (hist = operRef.historyRef.getFirst()) {
                    operRef.sendMsg(channelKey, hist.addStatusReadable(WordCo.cre(), true), privPartRef);

                } else {
                    operRef.sendMsg(operRef, WordCo.cre().text('No game history.'), privPartRef);
                }
            }

            var sf;

            wRef = WordCo.cre();

            for (sf = 0; sf < chCats.length; sf++) {
                if (sf != 0) wRef.sep();
                chCats[sf].addStatusReadableShort(wRef);
            }

            operRef.sendMsg(channelKey, wRef, privPartRef);

        } else if ((catRef = operRef.getCatRef(channelKey, false)) != null) {

            if (operRef.currentCmd == 'liast') {
                if (hist = operRef.historyRef.getFirst()) {
                    operRef.sendMsg(channelKey, hist.addStatusReadable(WordCo.cre(), true), privPartRef);

                } else {
                    operRef.sendMsg(operRef, WordCo.cre().text('No game history.'), privPartRef);
                }
            }

            operRef.sendMsg(channelKey, catRef.addStatusReadable(WordCo.cre(), false, operRef.voteRef), privPartRef);
        }
    }
}

export default OpList;