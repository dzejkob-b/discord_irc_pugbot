import WordCo from './word_co';

class OpGrant {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        operRef.getUser(cStk.pop(), (cPartRef) => {

            if (cPartRef == null) {
                partRef.noticeMessage(operRef, WordCo.cre().text('No such user ').texth(cStk.last()).text('!'));

            } else {
                var nAuthLevel = parseInt(cStk.pop());
                if (isNaN(nAuthLevel)) nAuthLevel = 0;

                if (cPartRef.getAuthKey() == false) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('Cannot grant user ').texth(cPartRef.nick).text('! User dont have discord ID or irc ACCOUNT.').texth(nAuthLevel));

                } else {
                    operRef.authUsers[cPartRef.getAuthKey()] = nAuthLevel;
                    operRef.saveState();

                    partRef.noticeMessage(operRef, WordCo.cre().text('Auth level of user ').texth(cPartRef.nick).text(' was set to: ').texth(nAuthLevel));
                }
            }

        }, partRef.type);
    }
}

export default OpGrant;