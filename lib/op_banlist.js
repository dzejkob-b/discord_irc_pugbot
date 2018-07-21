import WordCo from './word_co';

class OpBanList {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, isStart, wRef, banKey, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        isStart = true;

        wRef = WordCo.cre();

        if (Object.keys(operRef.banUsers).length == 0) {
            wRef.text("No users banned.");

        } else {
            for (banKey in operRef.banUsers) {
                if (isStart) {
                    isStart = false;
                } else {
                    wRef.text(', ');
                }

                if (operRef.banUsers[banKey]['partRef']) {
                    wRef.texth(operRef.banUsers[banKey]['partRef'].readableInfo_b());
                } else {
                    wRef.texth(banKey);
                }

                if (operRef.banUsers[banKey]['duration'] == 0) {
                    wRef.text(' permanent ban for: ').texth(operRef.banUsers[banKey]['reason']);

                } else {
                    wRef.text(' banned for ').texth(operRef.banUsers[banKey]['duration']).text(' hours: ').texth(operRef.banUsers[banKey]['reason']);
                }

                if (operRef.banUsers[banKey]['mask'] && Array.isArray(operRef.banUsers[banKey]['mask']) && operRef.banUsers[banKey]['mask'].length > 0) {
                    wRef.text(' (masks: ').texth(operRef.banUsers[banKey]['mask'].join(', ')).text(')');
                }
            }
        }

        operRef.sendMsg(false, wRef, privPartRef);
    }
}

export default OpBanList;