import WordCo from './word_co';
import TimeUtils from './utils/time';

class OpBanList {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, isStart = true, wRef, cBan, banKey, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        wRef = WordCo.cre();

        if (Object.keys(operRef.banUsers).length == 0) {
            wRef.text("No users banned.");

        } else {
            let index = 1;
            for (banKey in operRef.banUsers) {
                cBan = operRef.banUsers[banKey];

                if (isStart) {
                    isStart = false;
                } else {
                    wRef.text(', ');
                }
                
                wRef.text(index + ') ');
                if (cBan['partRef']) {
                    wRef.texth(cBan['partRef'].readableInfo_b());
                } else {
                    wRef.texth(banKey);
                }

                if (cBan['duration'] == 0) {
                    wRef.text(' permanently banned by ').texth(cBan['by'].nick).text('. Reason: ').texth(cBan['reason']);

                } else {
                    wRef.text(' banned by ').texth(cBan['by'].nick).text(' for ').texth(cBan['duration']).text(' hours. Reason: ').texth(cBan['reason']);
                }

                if (cBan['mask'] && Array.isArray(cBan['mask']) && cBan['mask'].length > 0) {
                    wRef.text(' (masks: ').texth(cBan['mask'].join(', ')).text(')');
                }

                if (cBan['duration'] == 0) {
                    const timeAgo = TimeUtils.timeSinceAsString(cBan.time * 1000);
                    wRef.text(` (${timeAgo} ago)`);
                } else {
                    const timeRemaining = TimeUtils.timeRemainingAsString(TimeUtils.addHours((cBan.time * 1000), cBan.duration));
                    wRef.text(` (${timeRemaining} remaining)`);
                }

                index++;
            }
        }

        operRef.sendMsg(channelKey, wRef, privPartRef);
    }
}

export default OpBanList;