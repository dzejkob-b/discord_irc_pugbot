import WordCo from './word_co';
import Catalog from './catalog';

class OpConfigPugSet {

    constructor(parent) {
        this.parent = parent;
    }

    exec(channelKey) {
        let operRef = this.parent, cStk = this.parent.cStk, privPartRef = this.parent.privPartRef;

        const popMod = cStk.popMod(channelKey);
        const catRef = operRef.getCatRef(channelKey, popMod);
        const subCmd = cStk.pop();

        if (!catRef) {
            operRef.sendMsg(channelKey, WordCo.cre().text(`pug name doesn't exists.`), privPartRef);
            return;

        } else if (!subCmd || !Catalog.SUBCOMMANDS[subCmd] || !Catalog.SUBCOMMANDS[subCmd]['settable']) {

            if (!subCmd) {
                operRef.sendMsg(channelKey, WordCo.cre().text(`Please specify subcommand to set: ${Catalog.SubCommandsList()}`), privPartRef);

            } else {
                operRef.sendMsg(channelKey, WordCo.cre().text(`Unknown subcommand "${subCmd}", SubCommands: ${Catalog.SubCommandsList()}`), privPartRef);
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

            case 'picksteps' :
                var invalidMsg = false, finSteps = [];

                if (value && typeof value == 'string') {
                    for (var c of value.split(',')) {
                        var tt = parseInt(c);

                        if (isNaN(tt) || tt <= 0) {
                            invalidMsg = 'Invalid value "' + c + '"!';
                            break;

                        } else {
                            finSteps.push(tt);
                        }
                    }
                }

                if (invalidMsg) {
                    operRef.sendMsg(channelKey, WordCo.cre().text(invalidMsg), privPartRef);

                } else if (finSteps.length == 0) {
                    operRef.sendMsg(channelKey, WordCo.cre().text('No picking steps specified!'), privPartRef);

                } else {
                    catRef.setPickSteps(finSteps);
                    shouldSaveState = true;

                    operRef.sendMsg(channelKey, WordCo.cre().text(Catalog.SUBCOMMANDS[subCmd]['readable']).text(` has been set to: `).text(finSteps.join(', '), true), privPartRef);
                }
                break;

            default :
                operRef.sendMsg(channelKey, WordCo.cre().text(`You must supply a subcommand ${Catalog.SubCommandsList()}`), privPartRef);
                break;
        }

        if (shouldSaveState) {
            operRef.saveState();
        }
    }

    static inRange(value, min, max) {
        return min <= value && value <= max;
    }
}

export default OpConfigPugSet;