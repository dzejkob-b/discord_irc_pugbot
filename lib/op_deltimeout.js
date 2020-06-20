import WordCo from './word_co';

class OpDelTimeout {

    constructor(parent) {
        this.parent = parent;
    }

    exec(channelKey) {
        let operRef = this.parent, cStk = this.parent.cStk, partRef = this.parent.partRef;

        const nick = cStk.pop() ? cStk.last() : false;
        if (!nick) {
            partRef.noticeMessage(operRef, WordCo.cre().text("You must supply a name to be expired. "));
            return;
        }

        const pugsBeenRemoved = operRef.getCatsInChannel(channelKey).filter(catRef => catRef.removeTimeoutByName(nick));
        if (pugsBeenRemoved.length > 0) {
            const pugNames = pugsBeenRemoved.map(catRef => catRef.flag).join(', ');
            partRef.noticeMessage(operRef, WordCo.cre().text(`${nick} has been expired from timeout at [${pugNames}]`));
        }
    }
}

export default OpDelTimeout;