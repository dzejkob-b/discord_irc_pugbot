import WordCo from './word_co';

class OpLva {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, result, reason, tt, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;
        
        reason = cStk.pop();
        
        operRef.cats.forEach((catRef) => {
            result = catRef.leaveParticipant(operRef.gameRef, partRef);

            if (result == -1) {
                // not contained ...

            } else if (operRef.logicState != 0 && operRef.gameRef.restCat.flag == catRef.flag) {
                // msg to all

                operRef.sendMsg(catRef.channelKey, WordCo.cre().text('The ').texth(catRef.flag).text(' pug stopped because player ').texth(partRef.nick).text(' left.'), privPartRef);
                operRef.gameRef.clearCaptainIdle();
                operRef.logicState = 0;

            } else {
                operRef.sendMsg(catRef.channelKey, partRef.getPartMessage(catRef, reason), privPartRef);
            }
        });

        tt = operRef.voteRef.findJoinedParticipant(partRef);

        if (tt["partRef"] == null) {
            operRef.voteRef.removeVoteSelf(partRef);
            operRef.voteRef.removeVoteTrg(partRef);
        }
    }
}

export default OpLva;