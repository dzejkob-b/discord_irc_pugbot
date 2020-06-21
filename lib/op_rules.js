import WordCo from './word_co';
import Rules from './rules';

class OpRules {
    constructor(parent) {
        this.parent = parent;
    }

    exec(channelKey) {
        let mList = new Rules(this.parent).getRules(channelKey),
            partRef = this.parent.partRef;

        if (mList.length > 0) {
            this.parent.sendMsgArrayPrep(channelKey, mList, partRef);
        } else {
            partRef.noticeMessage(
                this.parent,
                WordCo.cre().text('No rules defined!')
            );
        }
    }
}

export default OpRules;
