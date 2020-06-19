import WordCo from './word_co';

class OpConfigPugSet {

    static SUBCOMMANDS = ['playerrejoincooldown', 'captainidlecooldown', 'captainidle'];

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
                if (parseInt(value) >= 0) {
                    catRef.setPlayerRejoinCooldown(parseInt(value));
                    shouldSaveState = true;
                    partRef.noticeMessage(operRef, WordCo.cre().text(`${subCmd} has been set to: ${value}`));
                }
                else {
                    partRef.noticeMessage(operRef, WordCo.cre().text(`${subCmd} value must be a positive number.`));
                }
                break;

            case 'captainidlecooldown':
                if (parseInt(value) >= 0) {
                    catRef.setCaptainIdleCooldown(parseInt(value));
                    shouldSaveState = true;
                    partRef.noticeMessage(operRef, WordCo.cre().text(`${subCmd} has been set to: ${value}`));
                }
                else {
                    partRef.noticeMessage(operRef, WordCo.cre().text(`${subCmd} value must be a positive number.`));
                }
                break;

            case 'captainidle':
                if (parseInt(value) >= 0) {
                    catRef.setCaptainIdle(parseInt(value));
                    shouldSaveState = true;
                    partRef.noticeMessage(operRef, WordCo.cre().text(`${subCmd} has been set to: ${value}`));
                }
                else {
                    partRef.noticeMessage(operRef, WordCo.cre().text(`${subCmd} value must be a positive number.`));
                }
                break;

            case '':
                partRef.noticeMessage(operRef, WordCo.cre().text(`You must supply a subcommand ${OpConfigPugSet.SubCommandsList()}`));
                break;

            default:
                partRef.noticeMessage(operRef, WordCo.cre().text(`Unknown subcommand "${subCmd}", SubCommands: ${OpConfigPugSet.SubCommandsList()}`));
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
        return '[' + OpConfigPugSet.SUBCOMMANDS.join(', ') + ']';
    }
}

export default OpConfigPugSet;