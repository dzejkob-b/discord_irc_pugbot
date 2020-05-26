import WordCo from './word_co';

class OpList {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, catRef, wRef, hist, chCats, useChan, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.currentCmd == 'listall' || operRef.currentCmd == 'liastall' || operRef.currentCmd == 'lsall') {
            useChan = false;
        } else {
            useChan = channelKey;
        }

        if (operRef.logicState == 2 || operRef.logicState == 1) {
            operRef.sendMsg(channelKey, operRef.gameRef.restCat.addStatusReadable(WordCo.cre(), true, operRef.voteRef, channelKey, operRef), privPartRef);

        } else if (cStk.pop() != false) {

            if ((catRef = operRef.getCatRef(false, cStk.last())) == null) {
                partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

            } else {
                operRef.sendMsg(channelKey, catRef.addStatusReadable(WordCo.cre(), false, operRef.voteRef, channelKey, operRef), privPartRef);
            }

        } else if ((chCats = operRef.getCatsInChannel(useChan)) != false && chCats.length > 1) {
            
            if (operRef.currentCmd == 'liast' || operRef.currentCmd == 'liastall') {
                if (hist = operRef.historyRef.getFirst(useChan)) {
                    operRef.sendMsg(channelKey, hist.addStatusReadable(WordCo.cre(), true), privPartRef);

                } else {
                    operRef.sendMsg(operRef, WordCo.cre().text('No game history.'), privPartRef);
                }
            }

            var sf;

            wRef = WordCo.cre();

            for (sf = 0; sf < chCats.length; sf++) {
                if (sf != 0) wRef.sep();
                chCats[sf].addStatusReadableShort(wRef, channelKey, operRef);
            }

            operRef.sendMsg(channelKey, wRef, privPartRef);

        } else if ((catRef = operRef.getCatRef(channelKey, false)) != null) {

            if (operRef.currentCmd == 'liast' || operRef.currentCmd == 'liastall') {
                if (hist = operRef.historyRef.getFirst(useChan)) {
                    operRef.sendMsg(channelKey, hist.addStatusReadable(WordCo.cre(), true), privPartRef);

                } else {
                    operRef.sendMsg(operRef, WordCo.cre().text('No game history.'), privPartRef);
                }
            }

            operRef.sendMsg(channelKey, catRef.addStatusReadable(WordCo.cre(), false, operRef.voteRef, channelKey, operRef), privPartRef);
        }
    }
}

export default OpList;