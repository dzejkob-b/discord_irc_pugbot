import WordCo from './word_co';

class OpLva {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, result, reason, tt, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;
        
        reason = cStk.pop();

        var acRef = operRef.getAction(channelKey);

        operRef.cats.forEach((catRef) => {
            result = catRef.leaveParticipantCooldown(acRef.gameRef, partRef);

            if (result == -1) {
                // not contained ...

            } else if (acRef.logicState != 0 && acRef.gameRef.restCat.flag == catRef.flag) {
                // msg to all

                operRef.msgRef.sendMsg(catRef.channelKey, WordCo.cre().text('The ').texth(catRef.flag).text(' pug stopped because player ').texth(partRef.nick).text(' left.'), privPartRef);

                acRef.gameRef.clearCaptainIdle();
                acRef.logicState = 0;

            } else {
                operRef.msgRef.sendMsg(catRef.channelKey, partRef.getPartMessage(catRef, reason), privPartRef);
            }
        });

        tt = acRef.voteRef.findJoinedParticipant(false, partRef);

        if (tt["partRef"] == null) {
            acRef.voteRef.removeVoteSelf(partRef);
            acRef.voteRef.removeVoteTrg(partRef);
        }
    }
}

export default OpLva;