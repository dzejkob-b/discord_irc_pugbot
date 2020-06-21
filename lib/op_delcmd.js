import WordCo from './word_co';

class OpDelCmd {
    constructor(parent) {
        this.parent = parent;
    }

    exec() {
        let operRef = this.parent,
            cmdName,
            cStk = this.parent.cStk,
            partRef = this.parent.partRef;

        if ((cmdName = cStk.pop()) == null) {
            partRef.noticeMessage(
                operRef,
                WordCo.cre().text('No command specified!')
            );
        } else if (operRef.cmds[cmdName]) {
            partRef.noticeMessage(
                operRef,
                WordCo.cre()
                    .text('Cannot delete command ')
                    .texth(cmdName)
                    .text('!')
            );
        } else if (!operRef.textCommands[cmdName]) {
            partRef.noticeMessage(
                operRef,
                WordCo.cre()
                    .text('Text command ')
                    .texth(cmdName)
                    .text(' does not exist!')
            );
        } else {
            operRef.textCommands[cmdName] = null;
            delete operRef.textCommands[cmdName];

            operRef.saveState();

            partRef.noticeMessage(
                operRef,
                WordCo.cre()
                    .text('The command ')
                    .texth(cmdName)
                    .text(' was deleted.')
            );
        }
    }
}

export default OpDelCmd;
