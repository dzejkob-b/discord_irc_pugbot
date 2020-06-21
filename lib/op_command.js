import WordCo from './word_co';

class OpCommand {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, wRef, foundKey, cStk = this.parent.cStk, partRef = this.parent.partRef;

        if (cStk.pop()) {
            foundKey = false;
            wRef = WordCo.cre();

            for (var cKey in operRef.cmds) {
                if (cStk.last() == cKey) {
                    foundKey = cKey;
                    break;
                    
                } else if (operRef.cmds[cKey]['alt']) {
                    for (var sf = 0; sf < operRef.cmds[cKey]['alt'].length; sf++) {
                        if (operRef.cmds[cKey]['alt'][sf] == cStk.last()) {
                            foundKey = cKey;
                            break;
                        }
                    }
                }
            }

            if (foundKey) {
                wRef.text(operRef.cmds[foundKey]['info']);

            } else {
                wRef.text("Command ").texth(cStk.last()).text(" not found!");
            }
            
            partRef.noticeMessage(operRef, wRef);

        } else {

            partRef.noticeMessage(operRef, WordCo.cre().text('See documentation here: ').text('https://github.com/dzejkob-b/discord_irc_pugbot'));

            /*
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
            */
        }
    }
}

export default OpCommand;