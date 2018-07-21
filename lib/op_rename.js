import WordCo from './word_co';

class OpRename {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, catRef, removePartRef, partIdx, removePartIdx, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;
        
        if ((catRef = operRef.getCatRef(cStk.popMod())) == null) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

        } else if ((removePartRef = catRef.getParticipantNickOrForceIndex(cStk.pop())) == null || (removePartIdx = catRef.findParticipant(removePartRef)) == -1) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Player ').texth(cStk.last()).text(' is not joined in the ').texth(catRef.flag).text(' pug!'));

        } else {
            operRef.getUser(cStk.pop(), (addPartRef) => {

                if (addPartRef == null) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('No such player ').texth(cStk.last()).text('!'));

                } else if ((partIdx = catRef.findParticipant(addPartRef)) != -1) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('User ').texth(addPartRef.nick).text(' allready joined to ').texth(catRef.flag).text(' pug!'));

                } else {
                    operRef.logicState = 0;

                    catRef.replaceParticipant(removePartIdx, addPartRef);

                    operRef.sendMsg(false, WordCo.cre().text('Player ').texth(removePartRef.nick).text(' was replaced by ').texth(addPartRef.nick).text(' in ').texth(catRef.flag).text(' pug.'), privPartRef);
                }

            }, partRef.type);
        }
    }
}

export default OpRename;