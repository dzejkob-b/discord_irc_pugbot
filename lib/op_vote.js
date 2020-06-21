import WordCo from './word_co';

class OpVote {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, tt, wRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.logicState == 0 || operRef.logicState == 1) {

            tt = operRef.voteRef.findJoinedParticipant(partRef);

            if (tt["partRef"] == null) {
                partRef.noticeMessage(operRef, WordCo.cre().text('You cannot vote you are not joined in the ').texth(tt["catRef"].flag).text(' pug!'));

            } else {
                tt = operRef.voteRef.getParticipantForVoteNickOrForceIndex(cStk.pop());

                if (tt["partRef"] == null) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('No such user ').texth(cStk.last()).text(' in the ').texth(tt["catRef"].flag).text(' pug!'));

                } else {
                    let votePartRef = tt["partRef"];
                    let voteValue = 1; //votePartRef.tag == "nocapt" ? 0.5 : 1;
                    let voteResult = operRef.voteRef.addVote(operRef, tt["catRef"], partRef, votePartRef, voteValue);

                    if (voteResult >= 0 && operRef.logicState == 0) {
                        // prepug voting

                        wRef = WordCo.cre();

                        wRef.text('User ').texth(votePartRef.nick).text(' gained ').texth('+' + voteValue).text(' votes (total ').texth(operRef.voteRef.getTotalVotes(votePartRef)).text(' votes). ');

                        if (votePartRef.isNocapt()) {
                            wRef.texth(votePartRef.nick).text(', consider removing ').texth('nocapt').text(' - was voted for you.');
                        }

                        operRef.sendMsg(channelKey, wRef, privPartRef);

                    } else if (voteResult >= 0 && operRef.logicState == 1) {
                        // pug is filled

                        operRef.captainTick = 3;

                        wRef = WordCo.cre();

                        wRef.text('User ').texth(votePartRef.nick).text(' gained ').texth('+' + voteValue).text(' votes. ');
                        wRef.text('Candidates: ');
                        operRef.voteRef.addStatusReadable(wRef);

                        operRef.sendMsg(channelKey, wRef, privPartRef);

                        operRef.logicLoopTick();

                    } else if (voteResult == -1) {
                        partRef.noticeMessage(operRef, WordCo.cre().text('You allready voted for ').texth(votePartRef.nick).text('!'));

                    } else if (voteResult == -2) {
                        partRef.noticeMessage(operRef, WordCo.cre().text('Cannot vote for ').texth(votePartRef.nick).text('!'));

                    } else if (voteResult == -3) {
                        partRef.noticeMessage(operRef, WordCo.cre().text('You have exhausted the number of possible votes!'));

                    } else {
                        partRef.noticeMessage(operRef, WordCo.cre().text('You cannot vote for nocapt users!'));
                    }
                }
            }

        } else {
            partRef.noticeMessage(operRef, WordCo.cre().text('You can vote for captain only when pug is filled!'));
        }
    }
}

export default OpVote;