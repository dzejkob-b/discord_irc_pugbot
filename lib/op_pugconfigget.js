import WordCo from './word_co';

class OpConfigPugGet {

    static SUBCOMMANDS = {
        'playerrejoincooldown': {
            minInSecs: 0,
            maxInSecs: 60
        },
        'captainidlecooldown': {
            minInSecs: 0,
            maxInSecs: 600,
        },
        'captainidle': {
        }
    };

    constructor(parent) {
        this.parent = parent;
    }

    exec(channelKey) {
        let operRef = this.parent, cRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        const popMod = cStk.popMod(channelKey);
        const catRef = operRef.getCatRef(channelKey, popMod);
        if (!catRef) {
            partRef.noticeMessage(operRef, WordCo.cre().text(`pug name doesn't exists.`));
            return;
        }

        let shouldSaveState = false;
        const subCmd = cStk.pop();
        const subCmdLowerCase = subCmd
            ? subCmd.toLowerCase()
            : '';
        const value = cStk.pop();
        switch (subCmdLowerCase) {
            case 'playerrejoincooldown':
                partRef.noticeMessage(operRef, WordCo.cre().text(`${subCmd} is set to: ${catRef.playerRejoinCooldownInSecs} seconds.`));
                break;

            case 'captainidlecooldown':
                partRef.noticeMessage(operRef, WordCo.cre().text(`${subCmd} is set to: ${catRef.captainIdleCooldownInSecs} seconds.`));
                break;

            case 'captainidle':
                partRef.noticeMessage(operRef, WordCo.cre().text(`${subCmd} is set to: ${catRef.captainIdleInSecs} seconds.`));
                break;

            case '':
                partRef.noticeMessage(operRef, WordCo.cre().text(`You must supply a subcommand ${OpConfigPugGet.SubCommandsList()}`));
                break;

            default:
                partRef.noticeMessage(operRef, WordCo.cre().text(`Unknown subcommand "${subCmd}", SubCommands: ${OpConfigPugGet.SubCommandsList()}`));
                break;
        }

        if (shouldSaveState) {
            operRef.saveState();
        }
    }

    static inRange(value, min, max) {
        return min <= value && value <= max;
    }

    static SubCommandsList() {
        return '[' + Object.keys(OpConfigPugGet.SUBCOMMANDS).join(', ') + ']';
    }
}

export default OpConfigPugGet;