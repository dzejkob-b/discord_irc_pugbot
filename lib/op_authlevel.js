import WordCo from './word_co';

class OpAuthLevel {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;
        
        if (cStk.pop() == false) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Your auth level is: ').texth(partRef.authLevel));

        } else {
            operRef.getUser(cStk.last(), (cPartRef) => {

                if (cPartRef == null) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('No such user ').texth(cStk.last()).text('!'));

                } else {
                    partRef.noticeMessage(operRef, WordCo.cre().text('Auth level of user ').texth(cPartRef.nick).text(' is: ').texth(cPartRef.authLevel));
                }

            }, partRef.type);
        }
    }
}

export default OpAuthLevel;