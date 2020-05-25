import WordCo from './word_co';

class OpCommand {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, wRef, tt, cStk = this.parent.cStk, partRef = this.parent.partRef;

        if (cStk.pop()) {
            wRef = WordCo.cre();

            if (operRef.cmds[cStk.last()]) {
                wRef.text(operRef.cmds[cStk.last()]['info']);

            } else {
                wRef.text("Command ").texth(cStk.last()).text(" not found!");
            }

            partRef.noticeMessage(operRef, wRef);

        } else {
            var key, cmds = [], cmdsLines = [];

            for (key in operRef.cmds) {
                if ((tt = operRef.getCmdAuth(channelKey, key)) && partRef.authLevel >= tt['result']) {
                    cmds.push('!' + key);

                    if (cmds.length >= 15) {
                        cmdsLines.push(cmds);
                        cmds = [];
                    } // if
                }
            }

            for (key in operRef.textCommands) {
                cmds.push('!' + key);

                if (cmds.length >= 15) {
                    cmdsLines.push(cmds);
                    cmds = [];
                } // if
            }

            if (cmds.length > 0) {
                cmdsLines.push(cmds);
            }

            if (cmdsLines.length > 0) {
                cmdsLines.forEach((cmds) => {

                    wRef = WordCo.cre();
                    wRef.text('Commands: ');

                    for (var sf = 0; sf < cmds.length; sf++) {
                        if (sf != 0) wRef.text(', ');
                        wRef.texth(cmds[sf]);
                    }

                    partRef.noticeMessage(operRef, wRef);

                });
            }

            if (cmdsLines.length == 0) {
                wRef = WordCo.cre();
                wRef.text('You are not allowed to use any command!');

                partRef.noticeMessage(operRef, wRef);
            }
        }
    }
}

export default OpCommand;