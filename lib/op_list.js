import WordCo from './word_co';

class OpList {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, catRef, tmList = [], wRef, hist, chCats, useChan, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.currentCmd == 'listall' || operRef.currentCmd == 'liastall' || operRef.currentCmd == 'lsall') {
            useChan = false;
        } else {
            useChan = channelKey;
        }

        if (operRef.logicState == 2 || operRef.logicState == 1) {
            tmList.push(operRef.gameRef.restCat.addStatusReadable(WordCo.cre(), true, operRef.voteRef, channelKey, operRef));

        } else if (cStk.pop() != false) {

            if ((catRef = operRef.getCatRef(false, cStk.last())) == null) {
                partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

            } else {
                tmList.push(catRef.addStatusReadable(WordCo.cre(), false, operRef.voteRef, channelKey, operRef));
            }

        } else if ((chCats = operRef.getCatsInChannel(useChan)) != false && chCats.length > 1) {
            
            if (operRef.currentCmd == 'liast' || operRef.currentCmd == 'liastall') {
                if (hist = operRef.historyRef.getFirst(useChan)) {
                    tmList.push(hist.addStatusReadable(WordCo.cre(), true));

                } else {
                    tmList.push(WordCo.cre().text('No game history.'));
                }
            }

            if (tmList.length > 0) {
                tmList.push(WordCo.cre());
            }

            var sf;

            wRef = WordCo.cre();

            for (sf = 0; sf < chCats.length; sf++) {
                if (sf != 0) wRef.sep();
                chCats[sf].addStatusReadableShort(wRef, channelKey, operRef);
            }

            tmList.push(wRef);

        } else if ((catRef = operRef.getCatRef(channelKey, false)) != null) {

            if (operRef.currentCmd == 'liast' || operRef.currentCmd == 'liastall') {
                if (hist = operRef.historyRef.getFirst(useChan)) {
                    tmList.push(hist.addStatusReadable(WordCo.cre(), true));

                } else {
                    tmList.push(WordCo.cre().text('No game history.'));
                }
            }

            if (tmList.length > 0) {
                tmList.push(WordCo.cre());
            }

            tmList.push(catRef.addStatusReadable(WordCo.cre(), false, operRef.voteRef, channelKey, operRef));
        }

        operRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
    }
}

export default OpList;