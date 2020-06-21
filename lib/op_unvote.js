import WordCo from './word_co';

class OpUnvote {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, wRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.logicState > 0) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Your cannot remove vote when pug starting!'));

        } else if (operRef.voteRef.removeVoteSelf(partRef)) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Your votes was removed.'));

        } else {
            partRef.noticeMessage(operRef, WordCo.cre().text('You did not vote for anyone.'));
        }

        if (operRef.logicState == 1) {

            operRef.captainTick = 3;

            wRef = WordCo.cre();
            
            wRef.text('Captain candidates: ');
            operRef.voteRef.addStatusReadable(wRef);

            operRef.sendMsg(channelKey, wRef, privPartRef);

            operRef.logicLoopTick();

        }
    }
}

export default OpUnvote;