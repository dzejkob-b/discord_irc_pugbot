import WordCo from './word_co';

class OpMention {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, reason, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        operRef.getUser(cStk.pop(), (cPartRef) => {

            reason = cStk.getRestString();

            if (cPartRef == null) {
                partRef.noticeMessage(operRef, WordCo.cre().text('No such user ').texth(cStk.last()).text('!'));

            } else if (reason) {
                cPartRef.noticeMessage(operRef, WordCo.cre().textNick(cPartRef.nick, false, cPartRef.getDiscordId()).text(', you were mentioned by ').texth(partRef.nick).text(': ' + reason));

                operRef.sendMsg(channelKey, WordCo.cre().textNick(cPartRef.nick, false, cPartRef.getDiscordId()).text(', ' + reason), privPartRef);

            } else {
                cPartRef.noticeMessage(operRef, WordCo.cre().textNick(cPartRef.nick, false, cPartRef.getDiscordId()).text(', you were mentioned by ').texth(partRef.nick));

                operRef.sendMsg(channelKey, WordCo.cre().textNick(cPartRef.nick, false, cPartRef.getDiscordId()).text(' !'), privPartRef);
            }

        }, partRef.type);
    }
}

export default OpMention;