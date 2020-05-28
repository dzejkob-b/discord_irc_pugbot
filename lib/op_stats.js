import WordCo from './word_co';

class OpStats {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, catRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (!operRef.anyCats(channelKey)) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No available pugs in this channel!'));

        } else if ((catRef = operRef.getCatRef(channelKey, cStk.popMod(channelKey))) == null) {
            operRef.sendMsg(channelKey, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'), privPartRef);

        } else {
            operRef.getUser(cStk.pop(), (cPartRef) => {

                operRef.statsRef.getStatsMessages(catRef.flag, cPartRef == null ? cStk.last() : cPartRef, cStk.pop(), (msgs) => {

                    if (msgs.length > 0) {
                        operRef.sendMsgArrayPrep(channelKey, msgs, privPartRef);
                    } else {
                        partRef.noticeMessage(operRef, WordCo.cre().text("No stats found."));
                    }

                });

            }, partRef.type);
        }
    }
}

export default OpStats;