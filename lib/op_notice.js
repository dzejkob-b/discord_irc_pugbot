class OpNotice {
    constructor(parent) {
        this.parent = parent
    }

    exec() {
        let operRef = this.parent,
            cStk = this.parent.cStk,
            partRef = this.parent.partRef

        operRef.getUser(
            cStk.pop(),
            (sPartRef) => {
                if (sPartRef != null) {
                    sPartRef.noticeMessage(operRef, cStk.pop())
                }
            },
            partRef.type
        )
    }
}

export default OpNotice
