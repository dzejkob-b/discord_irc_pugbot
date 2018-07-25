import WordCo from './word_co';

class OpRules {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;
        
        if (cStk.pop() == 'show' || !operRef.htmlPageUrl) {

            var pos = 1, msgs = [];

            while (operRef.textCommands["rule" + pos]) {
                operRef.textCommands["rule" + pos].forEach((msg) => {
                    msgs.push(WordCo.cre().text(msg));
                });

                pos++;
            }

            if (msgs.length > 0) {
                operRef.sendMsgArray(false, msgs, 0, privPartRef);

            } else {
                operRef.sendMsg(false, WordCo.cre().text('No rules defined!'), privPartRef);
            }

        } else {
            operRef.sendMsg(false, WordCo.cre().text('For rules see: ').text(operRef.htmlPageUrl).text(' or type ').texth('.rules show'), privPartRef);
        }
    }
}

export default OpRules;