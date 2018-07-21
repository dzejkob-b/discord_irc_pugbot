import WordCo from './word_co';

class OpDeletePug {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, catRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if ((catRef = operRef.getCatRef(cStk.popMod())) == null) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

        } else if (catRef.isQuick == false && partRef.authLevel < 10) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Cannot delete pug ').texth(catRef.flag).text('!'));

        } else if (partRef.authLevel < 10 && catRef.creatorPartRef != null && !catRef.creatorPartRef.compareEqual(partRef)) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Cannot delete pug which you didn`t created!'));
            
        } else if ((operRef.gameRef == null || catRef.flag == operRef.gameRef.restCat.flag) && operRef.logicState != 0) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Cannot delete ').texth(catRef.flag).text(' pug now - captain or player picking allready started!'));

        } else {
            operRef.deleteCatRef(catRef.flag);

            // msg to all
            operRef.sendMsg(false, WordCo.cre().text('The ').texth(catRef.flag).text(' pug was deleted!'), privPartRef);
        }
    }
}

export default OpDeletePug;