import WordCo from './word_co';

class OpAddCmd {
    constructor(parent) {
        this.parent = parent;
    }

    exec() {
        let operRef = this.parent, cmdName, cStk = this.parent.cStk, partRef = this.parent.partRef;

        if ((cmdName = cStk.pop()) == null) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No command specified!'));

        } else if (operRef.cmds[cmdName]) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Cannot overwrite command ').texth(cmdName).text('!'));

        } else {
            operRef.textCommands[cmdName] = [];

            cStk.getRestString().split('::NEWLINE').forEach((cPart) => {

                operRef.textCommands[cmdName].push(cPart.trim());

            });

            operRef.saveState();

            partRef.noticeMessage(operRef, WordCo.cre().text('The command ').texth(cmdName).text(' was set.'));
        }
    }
}

export default OpAddCmd;