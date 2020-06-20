class OpPm {
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
                    sPartRef.personalMessage(operRef, cStk.pop())
                }
            },
            partRef.type
        )
    }
}

export default OpPm
