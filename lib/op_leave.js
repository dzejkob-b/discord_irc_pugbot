import WordCo from './word_co';

class OpLeave {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, catRef, tt, result, reason, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (!operRef.anyCats(channelKey)) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No available pugs in this channel!'));

        } else if ((catRef = operRef.getCatRef(channelKey, cStk.popMod(channelKey))) == null) {
            partRef.noticeMessage(operRef, cStk.first() ? WordCo.cre().text('No such pug ').texth(cStk.first()).text('!') : WordCo.cre().text('Please specify pug!'));

        } else {
            result = catRef.leaveParticipant(partRef);
            reason = cStk.pop();

            if (result == -1) {
                // not contained ...

            } else if (operRef.logicState != 0 && operRef.gameRef.restCat.flag == catRef.flag) {
                // msg to all

                operRef.sendMsg(catRef.channelKey, WordCo.cre().text('The ').texth(catRef.flag).text(' pug stopped because player ').texth(partRef.nick).text(' left.'), privPartRef);

                operRef.logicState = 0;

                catRef.addParticipantTimeout(operRef, partRef);
                
            } else {
                operRef.sendMsg(catRef.channelKey, partRef.getPartMessage(catRef, reason), privPartRef);
                catRef.addParticipantTimeout(operRef, partRef);
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