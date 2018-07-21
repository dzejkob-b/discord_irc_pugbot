import WordCo from './word_co';

class OpAddPlayer {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, catRef, result, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if ((catRef = operRef.getCatRef(cStk.popMod())) == null) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.last()).text('!'));

        } else {
            operRef.getUser(cStk.pop(), (cPartRef) => {

                if (cPartRef == null) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('No such player ').texth(cStk.last()).text('!'));

                } else {
                    result = catRef.joinParticipant(cPartRef);

                    if (result == -1) {
                        partRef.noticeMessage(operRef, WordCo.cre().text('User ').texth(cPartRef.nick).text(' allready joined to ').texth(catRef.flag).text(' pug!'));

                    } else if (result == -2) {
                        partRef.noticeMessage(operRef, WordCo.cre().text('Cannot add player ').texth(cPartRef.nick).text(' - ').texth(catRef.flag).text(' pug capacity is full! (').texth(catRef.playerLimit).text(')'));

                    } else if (result == 0 || result == 1) {
                        // msg to all
                        operRef.sendMsg(false, WordCo.cre().text('Player ').texth(cPartRef.nick).text(' was added to ').texth(catRef.flag).text(' pug.'), privPartRef);
                    }

                    if (result == 1) {
                        operRef.startSelectCaptains(catRef);
                    }
                }

            }, partRef.type);
        }
    }
}

export default OpAddPlayer;