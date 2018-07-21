import WordCo from './word_co';

class OpMyStats {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, catRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;
        
        if ((catRef = operRef.getCatRef(cStk.popMod())) == null) {
            operRef.sendMsg(false, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'), privPartRef);

        } else {
            operRef.statsRef.getStatsMessages(catRef.flag, partRef, cStk.pop(), (msgs) => {

                if (msgs.length > 0) {
                    operRef.sendMsgArray(false, msgs, 0, privPartRef);
                } else {
                    partRef.noticeMessage(operRef, WordCo.cre().text("No stats found."));
                }

            });
        }
    }
}

export default OpMyStats;