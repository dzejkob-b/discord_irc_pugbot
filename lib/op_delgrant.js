import WordCo from './word_co'

class OpDelGrant {
    constructor(parent) {
        this.parent = parent
    }

    exec() {
        let operRef = this.parent,
            cStk = this.parent.cStk,
            partRef = this.parent.partRef

        operRef.getUser(
            cStk.pop(),
            (cPartRef) => {
                if (cPartRef == null) {
                    partRef.noticeMessage(
                        operRef,
                        WordCo.cre()
                            .text('No such user ')
                            .texth(cStk.last())
                            .text('!')
                    )
                } else if (
                    cPartRef.getAuthKey() == false ||
                    typeof operRef.authUsers[cPartRef.getAuthKey()] ==
                        'undefined'
                ) {
                    partRef.noticeMessage(
                        operRef,
                        WordCo.cre()
                            .text('User ')
                            .texth(cPartRef.nick)
                            .text(' is not in grant table!')
                    )
                } else {
                    delete operRef.authUsers[cPartRef.getAuthKey()]
                    operRef.saveState()

                    partRef.noticeMessage(
                        operRef,
                        WordCo.cre()
                            .text('User ')
                            .texth(cPartRef.nick)
                            .text(' was removed from grant table.')
                    )
                }
            },
            partRef.type
        )
    }
}

export default OpDelGrant
