import WordCo from './word_co';
import Participant from './participant';
import logger from 'winston';

class OpAddRandom {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, catRef, result, cRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;
        
        if (operRef.logicState != 0) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Cannot add random player - pug starting!'));

        } else if (!operRef.anyCats(channelKey)) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No available pugs in this channel!'));

        } else if ((catRef = operRef.getCatRef(channelKey, cStk.popMod(channelKey))) == null) {
            partRef.noticeMessage(operRef, cStk.first() ? WordCo.cre().text('No such pug ').texth(cStk.first()).text('!') : WordCo.cre().text('Please specify pug!'));

        } else {
            var numCnt = 1;
            var randNick = operRef.currentCmd == 'addcustom' ? cStk.pop() : '';

            if (operRef.currentCmd == 'addrandom') {
                numCnt = !isNaN(parseInt(cStk.pop())) ? parseInt(cStk.last()) : 1;
                if (numCnt < 1) numCnt = 1;
            }

            var uTag = cStk.pop() ? cStk.last() : '';

            if (uTag.length > 20) uTag = uTag.substr(0, 20);
            if ((new RegExp("^[a-zA-Z]{1}[a-zA-Z0-9]{0,19}$")).test(uTag) == false) uTag = '';

            if (operRef.currentCmd == 'addcustom') {
                cRef = new Participant({ "author" : randNick, "channel" : false });
                cRef.id = randNick;
                cRef.tag = uTag;

                if ((result = catRef.joinParticipant(cRef)) == 0 || result == 1) {
                    partRef.noticeMessage(operRef, WordCo.cre().text('Custom player ').texth(cRef.nick).text(' was added to ').texth(catRef.flag).text(' pug.'));
                }

            } else {
                do {
                    randNick = operRef.nounRef.getNoun();

                    cRef = new Participant({ "author" : randNick, "channel" : false });
                    cRef.id = randNick;
                    cRef.tag = uTag;

                    if ((result = catRef.joinParticipant(cRef, false, false, true)) == 0 || result == 1) {
                        partRef.noticeMessage(operRef, WordCo.cre().text('Random player ').texth(cRef.nick).text(' was added to ').texth(catRef.flag).text(' pug.'));

                    } else {
                        partRef.noticeMessage(operRef, WordCo.cre().text('Cannot add random player ').texth(cRef.nick).text(' to ').texth(catRef.flag).text(' pug. Result error: ').texth(result));
                    }

                    numCnt--;

                } while (numCnt > 0 && result == 0);
            }

            if (result == -1) {
                partRef.noticeMessage(operRef, WordCo.cre().text('User ').texth(cRef.nick).text(' allready joined to ').texth(catRef.flag).text(' pug!'));

            } else if (result == -2) {
                partRef.noticeMessage(operRef, WordCo.cre().text('Cannot join ').texth(cRef.nick).text(' - ').texth(catRef.flag).text(' pug capacity is full! (').texth(catRef.playerLimit).text(')'));
            }

            if (result == 1) {
                operRef.startSelectCaptains(catRef);
            }
        }
    }
}

export default OpAddRandom;