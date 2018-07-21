import WordCo from './word_co';

class OpAddCmd {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        let operRef = this.parent, cmdName, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if ((cmdName = cStk.pop()) == null) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No command specified!'));

        } else if (operRef.cmds[cmdName]) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Cannot overwrite command ').texth(cmdName).text('!'));

        } else {
            operRef.textCommands[cmdName] = [];
            operRef.textCommands[cmdName].push(cStk.getRestString());
            operRef.saveState();

            partRef.noticeMessage(operRef, WordCo.cre().text('The command ').texth(cmdName).text(' was set.'));
        }
    }
}

export default OpAddCmd;