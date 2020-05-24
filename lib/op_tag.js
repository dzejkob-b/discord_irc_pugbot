import WordCo from './word_co';

class OpTag {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, catRef, cRef, wRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (!operRef.anyCats(channelKey)) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No available pugs in this channel!'));

        } else if ((catRef = operRef.getCatRef(channelKey, cStk.popMod(channelKey))) == null) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').text(cStk.last()).texth('!'));

        } else if ((cRef = catRef.getParticipant(partRef)) == null) {
            partRef.noticeMessage(operRef, WordCo.cre().text('You`re not joined to ').texth(catRef.flag).text(' pug.'));

        } else {

            var pTag = cStk.pop() ? cStk.last() : '';
            if (pTag.length > 20) pTag = pTag.substr(0, 20);

            if ((new RegExp("^[a-zA-Z]{1}[a-zA-Z0-9]{0,19}$")).test(pTag) == false) {
                partRef.noticeMessage(operRef, WordCo.cre().text('Invalid tag value! Use only characters and numbers (max 20 characters).'));
                
            } else {
                cRef.setTag(pTag);

                if (operRef.gameRef) {
                    operRef.gameRef.setTagByPart(cRef, pTag);
                }
                
                wRef = WordCo.cre();

                wRef.text('Your nicktag for ').texth(catRef.flag).text(' pug changed to ').texth(pTag).text('.');

                if (cRef.isNocapt() && operRef.voteRef.getTotalVotes(cRef) > 0) {
                    wRef.text(' Do you really want to set nocapt? It was voted for you.');
                }

                partRef.noticeMessage(operRef, wRef);
            }
        }
    }
}

export default OpTag;