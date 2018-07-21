import WordCo from './word_co';

class OpLeave {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, catRef, tt, result, reason, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;
        
        if ((catRef = operRef.getCatRef(cStk.popMod())) == null) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

        } else {
            result = catRef.leaveParticipant(partRef);
            reason = cStk.pop();

            if (result == -1) {
                // not contained ...

            } else if (operRef.logicState != 0 && operRef.gameRef.restCat.flag == catRef.flag) {
                // msg to all
                operRef.sendMsg(false, WordCo.cre().text('The ').texth(catRef.flag).text(' pug stopped because player ').texth(partRef.nick).text(' left.'), privPartRef);

                operRef.logicState = 0;

            } else {
                operRef.sendMsg(false, partRef.getPartMessage(catRef, reason), privPartRef);
            }

            tt = operRef.voteRef.findJoinedParticipant(partRef);

            if (tt["partRef"] == null) {
                operRef.voteRef.removeVoteSelf(partRef);
                operRef.voteRef.removeVoteTrg(partRef);
            }
        }
    }
}

export default OpLeave;