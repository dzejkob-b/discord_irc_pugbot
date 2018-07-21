import WordCo from './word_co';

class OpBan {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, banNick, banKey, wRef, cur, idx, pref, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        operRef.getUser(banNick = cStk.pop(), (cPartRef) => {

            banKey = banNick;

            var nBanReason = '';
            var nBanMask = [];
            var nBanDuration = '';

            pref = false;

            while (cur = cStk.pop()) {
                if ((idx = cur.indexOf(':')) >= 0) {
                    pref = cur.substr(0, idx);
                    cur = cur.substr(idx + 1);
                }

                if (pref == 'reason') {
                    nBanReason += (nBanReason == '' ? '' : ' ') + cur;

                } else if (pref == 'mask') {
                    nBanMask.push(cur);

                } else if (pref == 'dur' || pref == 'duration') {
                    nBanDuration = cur;
                }
            }

            if (!nBanReason) nBanReason = 'simply banned';

            nBanDuration = parseInt(nBanDuration);
            if (isNaN(nBanDuration)) nBanDuration = 0;

            /*
            console.log("REASON: " + nBanReason);
            console.log("MASK: " + nBanMask);
            console.log("DURATION: " + nBanDuration);

            return false;
            */

            if ((cPartRef == null || cPartRef.getAuthKey() == false) && nBanMask.length == 0) {
                partRef.noticeMessage(operRef, WordCo.cre().text('Cannot ban user ').texth(banNick).text('! User dont have discord ID or irc ACCOUNT and ban mask is not specified.'));

            } else {
                if (cPartRef != null && nBanMask.length == 0) {
                    banKey = cPartRef.getAuthKey();
                }

                operRef.banUsers[banKey] = {
                    'time' : (new Date()).getTime() / 1000,
                    'reason' : nBanReason,
                    'duration' : nBanDuration,
                    'mask' : nBanMask,
                    'by' : partRef.getClone(),
                    'partRef' : cPartRef != null && nBanMask.length == 0 ? cPartRef.getClone() : null
                };

                operRef.saveState();

                if (cPartRef != null) {
                    operRef.statsRef.addUserBan(cPartRef);
                }

                wRef = WordCo.cre();

                if (nBanDuration == 0) {
                    wRef.text('User ').texth(banNick).text(' was permanently banned by ').texth(partRef.nick).text('for: ').texth(nBanReason);

                } else {
                    wRef.text('User ').texth(banNick).text(' was banned by ').texth(partRef.nick).text(' for ').texth(nBanDuration).text(' hours: ').texth(nBanReason);
                }

                if (nBanMask.length > 0) {
                    wRef.text(' (masks: ').texth(nBanMask.join(', ')).text(')');
                }

                operRef.sendMsg(false, wRef); // !! NOT privPartRef - public message
            }

        }, partRef.type, true);
    }
}

export default OpBan;