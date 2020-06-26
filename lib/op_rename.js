import WordCo from './word_co';

class OpRename {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, catRef, removePartRef, partIdx, removePartIdx, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (!operRef.anyCats(channelKey)) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No available pugs in this channel!'));

        } else if ((catRef = operRef.getCatRef(channelKey, cStk.popMod(channelKey))) == null) {
            partRef.noticeMessage(operRef, cStk.first() ? WordCo.cre().text('No such pug ').texth(cStk.first()).text('!') : WordCo.cre().text('Please specify pug!'));

        } else if ((removePartRef = catRef.getParticipantNickOrForceIndex(cStk.pop())) == null || (removePartIdx = catRef.findParticipant(removePartRef)) == -1) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Player ').texth(cStk.last()).text(' is not joined in the ').texth(catRef.flag).text(' pug!'));

        } else {
            operRef.getUser(cStk.pop(), (addPartRef) => {

                if (addPartRef == null) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('No such player ').texth(cStk.last()).text('!'));

                } else if ((partIdx = catRef.findParticipant(addPartRef)) != -1) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('User ').texth(addPartRef.nick).text(' allready joined to ').texth(catRef.flag).text(' pug!'));

                } else {
                    operRef.getAction(channelKey).logicState = 0;

                    catRef.replaceParticipant(removePartIdx, addPartRef);

                    operRef.msgRef.sendMsg(channelKey, WordCo.cre().text('Player ').texth(removePartRef.nick).text(' was replaced by ').texth(addPartRef.nick).text(' in ').texth(catRef.flag).text(' pug.'), privPartRef);
                }

            }, partRef.type);
        }
    }
}

export default OpRename;