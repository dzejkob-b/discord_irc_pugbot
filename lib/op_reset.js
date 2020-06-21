import WordCo from './word_co';

class OpReset {
    constructor(parent) {
        this.parent = parent;
    }

    exec(channelKey) {
        let operRef = this.parent,
            catRef,
            partRef = this.parent.partRef,
            privPartRef = this.parent.privPartRef;

        if (operRef.logicState == 0) {
            operRef.sendMsg(
                channelKey,
                WordCo.cre().text('Cannot reset - no picking started!'),
                privPartRef
            );
        } else if (!operRef.anyCats(channelKey)) {
            partRef.noticeMessage(
                operRef,
                WordCo.cre().text('No available pugs in this channel!')
            );
        } else if (
            (catRef = operRef.getCatRef(
                channelKey,
                operRef.gameRef.restCat.flag
            )) == null
        ) {
            operRef.sendMsg(
                channelKey,
                WordCo.cre()
                    .text('No such pug ')
                    .texth(operRef.gameRef.restCat.flag)
                    .text('!'),
                privPartRef
            );
        } else {
            operRef.startSelectCaptains(catRef, -5);

            // msg to all
            operRef.sendMsg(
                channelKey,
                WordCo.cre()
                    .text('The picking in ')
                    .texth(catRef.flag)
                    .text(' pug was reset.'),
                privPartRef
            );
        }
    }
}

export default OpReset;
