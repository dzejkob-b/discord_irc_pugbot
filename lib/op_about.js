import WordCo from './word_co';

class OpAbout {
    constructor(parent) {

        this.parent = parent;

    }

    exec() {
        this.parent.sendMsg(false, WordCo.cre().text('This is PUGBOT for pickup games which processing multiple message sources (irc, discord). Project homepage: ').text('https://github.com/dzejkob-b/discord_irc_pugbot'), this.parent.privPartRef);
    }
}

export default OpAbout;