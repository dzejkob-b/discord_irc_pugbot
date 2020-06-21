import WordCo from './word_co'

class OpNoun {
    constructor(parent) {
        this.parent = parent
    }

    exec(channelKey) {
        let operRef = this.parent,
            privPartRef = this.parent.privPartRef

        operRef.sendMsg(
            channelKey,
            WordCo.cre().text(operRef.nounRef.getNoun()),
            privPartRef
        )
    }
}

export default OpNoun
