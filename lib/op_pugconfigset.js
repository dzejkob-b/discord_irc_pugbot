import WordCo from './word_co';
import Catalog from './catalog';

class OpConfigPugSet {

    constructor(parent) {
        this.parent = parent;
    }

    exec(channelKey) {
        let operRef = this.parent, cRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        const popMod = cStk.popMod(channelKey);
        const catRef = operRef.getCatRef(channelKey, popMod);
        const subCmd = cStk.pop();

        if (!catRef) {
            operRef.sendMsg(channelKey, WordCo.cre().text(`pug name doesn't exists.`), privPartRef);
            return;

        } else if (!subCmd || !Catalog.SUBCOMMANDS[subCmd] || !Catalog.SUBCOMMANDS[subCmd]['settable']) {

            if (!subCmd) {
                operRef.sendMsg(channelKey, WordCo.cre().text(`Please specify subcommand to set: ${OpConfigPugSet.SubCommandsList()}`), privPartRef);

            } else {
                operRef.sendMsg(channelKey, WordCo.cre().text(`Unknown subcommand "${subCmd}", SubCommands: ${OpConfigPugSet.SubCommandsList()}`), privPartRef);
            }

            return;
        }

        let shouldSaveState = false;

        const subCmdLowerCase = subCmd ? subCmd.toLowerCase() : '';
        const value = cStk.pop();

        switch (subCmdLowerCase) {
            case 'plcooldown':
                if (parseInt(value) >= 0) {
                    catRef.setPlayerRejoinCooldown(parseInt(value));
                    shouldSaveState = true;

                    operRef.sendMsg(channelKey, WordCo.cre().text(Catalog.SUBCOMMANDS[subCmd]['readable']).text(` has been set to: `).text(value, true), privPartRef);

                } else {
                    operRef.sendMsg(channelKey, WordCo.cre().text(Catalog.SUBCOMMANDS[subCmd]['readable']).text(` value must be a positive number.`), privPartRef);
                }
                break;

            case 'cptcooldown':
                if (parseInt(value) >= 0) {
                    catRef.setCaptainIdleCooldown(parseInt(value));
                    shouldSaveState = true;

                    operRef.sendMsg(channelKey, WordCo.cre().text(Catalog.SUBCOMMANDS[subCmd]['readable']).text(` has been set to: `).text(value, true), privPartRef);

                } else {
                    operRef.sendMsg(channelKey, WordCo.cre().text(Catalog.SUBCOMMANDS[subCmd]['readable']).text(` value must be a positive number.`), privPartRef);
                }
                break;

            case 'cptidle':
                if (parseInt(value) >= 0) {
                    catRef.setCaptainIdle(parseInt(value));
                    shouldSaveState = true;

                    operRef.sendMsg(channelKey, WordCo.cre().text(Catalog.SUBCOMMANDS[subCmd]['readable']).text(` has been set to: `).text(value, true), privPartRef);
                    
                } else {
                    operRef.sendMsg(channelKey, WordCo.cre().text(Catalog.SUBCOMMANDS[subCmd]['readable']).text(` value must be a positive number.`), privPartRef);
                }
                break;

            case 'votes' :
                if (parseInt(value) >= 0) {
                    catRef.setPossibleVotes(parseInt(value));
                    shouldSaveState = true;

                    operRef.sendMsg(channelKey, WordCo.cre().text(Catalog.SUBCOMMANDS[subCmd]['readable']).text(` has been set to: `).text(value, true), privPartRef);

                } else {
                    operRef.sendMsg(channelKey, WordCo.cre().text(Catalog.SUBCOMMANDS[subCmd]['readable']).text(` value must be a positive number.`), privPartRef);
                }
                break;

            default :
                operRef.sendMsg(channelKey, WordCo.cre().text(`You must supply a subcommand ${OpConfigPugSet.SubCommandsList()}`), privPartRef);
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
        return '[' + Object.keys(Catalog.SUBCOMMANDS).join(', ') + ']';
    }
}

export default OpConfigPugSet;