import WordCo from './word_co';

class OpDelBan {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, banNick, banKey, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        operRef.getUser(banNick = cStk.pop(), (cPartRef) => {

            banKey = banNick;

            if (cPartRef != null && typeof operRef.banUsers[cPartRef.getAuthKey()] != 'undefined') {
                banKey = cPartRef.getAuthKey();
            }

            if (typeof operRef.banUsers[banKey] == 'undefined') {
                partRef.noticeMessage(operRef, WordCo.cre().text('Ban ').texth(banNick).text(' not found!'));

            } else {
                delete operRef.banUsers[banKey];
                operRef.saveState();
                
                operRef.sendMsg(channelKey, WordCo.cre().text('User ').texth(banNick).text(' was unbanned.')); // !! NOT privPartRef - public message
            }

        }, partRef.type);
    }
}

export default OpDelBan;