import WordCo from './word_co'

class OpLimitNoCapt {
    static minNoCaptTag = 0
    static maxNoCaptTag = 8

    constructor(parent) {
        this.parent = parent
    }

    exec() {
        let operRef = this.parent,
            cStk = this.parent.cStk,
            partRef = this.parent.partRef

        const maxAmount = cStk.pop() ? parseInt(cStk.last()) : -1

        if (
            maxAmount < OpLimitNoCapt.minNoCaptTag ||
            maxAmount > OpLimitNoCapt.maxNoCaptTag
        ) {
            partRef.noticeMessage(
                operRef,
                WordCo.cre().text(
                    'The nocapt limit possible  values are between ' +
                        this.minNoCaptTag +
                        ' and ' +
                        this.maxNoCaptTag
                )
            )
            return
        }

        operRef.setLimitNoCaptTag(maxAmount)
        partRef.noticeMessage(
            operRef,
            WordCo.cre().text('The nocapt limit has been set to ' + maxAmount)
        )
    }
}

export default OpLimitNoCapt
