import WordCo from './word_co'

class OpSay {
    constructor(parent) {
        this.parent = parent
    }

    exec(channelKey) {
        let operRef = this.parent,
            cStk = this.parent.cStk

        operRef.sendMsg(channelKey, WordCo.cre().text(cStk.getRestString()))
    }
}

export default OpSay
