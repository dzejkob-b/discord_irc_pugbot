import WordCo from './word_co';

class OpReset {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, catRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (operRef.logicState == 0) {
            operRef.sendMsg(false, WordCo.cre().text('Cannot reset - no picking started!'), privPartRef);

        } else if ((catRef = operRef.getCatRef(operRef.gameRef.restCat.flag)) == null) {
            operRef.sendMsg(false, WordCo.cre().text('No such pug ').texth(operRef.gameRef.restCat.flag).text('!'), privPartRef);

        } else {
            operRef.startSelectCaptains(catRef, -5);

            // msg to all
            operRef.sendMsg(false, WordCo.cre().text('The picking in ').texth(catRef.flag).text(' pug was reset.'), privPartRef);
        }
    }
}

export default OpReset;