import WordCo from './word_co';
import Catalog from './catalog';

class OpCreatePug {
    constructor(parent) {

        this.parent = parent;

    }
    
    exec(channelKey) {
        let operRef = this.parent, catRef, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        var is_quick = operRef.currentCmd == 'quickpug';
        var in_flag = cStk.pop();
        var in_players = parseInt(cStk.pop());
        var in_teams = parseInt(cStk.pop());

        if (isNaN(in_players)) in_players = 0;
        if (isNaN(in_teams)) in_teams = 2;

        if ((new RegExp("^[a-z0-9]{1}[a-z0-9]{0,9}$", 'i')).test(in_flag) == false) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Invalid pug name! Use only characters and numbers (max 10 characters).'));

        } else if (in_players < 1 || in_players > 20) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Player count must be between 1-20!'));

        } else if ((in_teams == 0 || (in_teams >= 2 && in_teams <= 4)) == false) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Team count must be between 2-4 or 0!'));

        } else if (in_teams != 0 && in_players % in_teams != 0) {
            partRef.noticeMessage(operRef, WordCo.cre().text('Player count must be divisible by team count!'));

        } else if (operRef.getCatRef(false, in_flag) != null) {
            // pug name must be unique across all channels

            partRef.noticeMessage(operRef, WordCo.cre().text('Pug ').texth(in_flag).text(' allready exists!'));

        } else if (is_quick && partRef.authLevel < 10 && operRef.getCatRefByCreator(partRef) != null) {
            partRef.noticeMessage(operRef, WordCo.cre().text('You allready have created one quick pug!'));

        } else {
            catRef = new Catalog(channelKey, in_flag, in_players, in_teams);

            catRef.creatorPartRef = partRef;

            if (is_quick) {
                catRef.isQuick = true;
                catRef.touchTime = (new Date()).getTime() / 1000;
            }

            operRef.cats.push(catRef);

            // msg to all
            operRef.sendMsg(channelKey, WordCo.cre().text('Pug ').texth(in_flag).text(' with ').texth(in_players).text(' players and ').texth(in_teams).text(' teams was created!'), privPartRef);
            operRef.sendMsg(channelKey, WordCo.cre().text('Type .j ').texth(in_flag).text(' to join this pug.'), privPartRef);

        }
    }
}

export default OpCreatePug;