import WordCo from './word_co';

class OpUserInfo {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, subPartRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef, tmp;

        if (operRef.currentCmd == 'userinfo2') {
            operRef.getUser(tmp = cStk.pop(), (cPartRef) => {
                if (cPartRef != null) {

                    operRef.msgRef.sendMsg(channelKey, WordCo.cre().text(cPartRef.readableInfo()), privPartRef);

                } else {
                    operRef.msgRef.sendMsg(channelKey, WordCo.cre().text('Cannot find user ').texth(tmp).text('!'), privPartRef);
                }

            }, partRef.type);

        } else {
            if ((subPartRef = operRef.botRef.channelDisUsers.getUser(cStk.pop())) != null) {
                subPartRef.getCompleted(operRef, (cPartRef) => {

                    operRef.msgRef.sendMsg(channelKey, WordCo.cre().text(cPartRef.readableInfo()), privPartRef);

                }, true);
            }

            if (((subPartRef = operRef.botRef.channelIrcUsers.getUser(cStk.last()))) != null) {
                subPartRef.getCompleted(operRef, (cPartRef) => {

                    operRef.msgRef.sendMsg(channelKey, WordCo.cre().text(cPartRef.readableInfo()), privPartRef);
                    operRef.msgRef.sendMsg(channelKey, WordCo.cre().text('Whois: ').texth(JSON.stringify(cPartRef.whois)), privPartRef);

                }, true);
            }
        }
    }
}

export default OpUserInfo;