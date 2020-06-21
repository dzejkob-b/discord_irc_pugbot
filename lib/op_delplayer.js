import WordCo from './word_co'

class OpDelPlayer {
    constructor(parent) {
        this.parent = parent
    }

    exec(channelKey) {
        let operRef = this.parent,
            tt,
            catRef,
            cRef,
            result,
            cStk = this.parent.cStk,
            partRef = this.parent.partRef,
            privPartRef = this.parent.privPartRef

        if (!operRef.anyCats(channelKey)) {
            partRef.noticeMessage(
                operRef,
                WordCo.cre().text('No available pugs in this channel!')
            )
        } else if (
            (catRef = operRef.getCatRef(channelKey, cStk.popMod(channelKey))) ==
            null
        ) {
            partRef.noticeMessage(
                operRef,
                cStk.first()
                    ? WordCo.cre()
                          .text('No such pug ')
                          .texth(cStk.first())
                          .text('!')
                    : WordCo.cre().text('Please specify pug!')
            )
        } else if (
            (cRef = catRef.getParticipantNickOrForceIndex(cStk.pop())) != null
        ) {
            result = catRef.leaveParticipantCooldown(operRef.gameRef, cRef)

            if ((tt = cStk.pop()) && !isNaN(parseInt(tt)) && parseInt(tt) > 0) {
                catRef.addParticipantTimeout(operRef, cRef, parseInt(tt))
            } else {
                catRef.addParticipantTimeout(operRef, cRef)
            }

            if (result == -1) {
                // not contained ...
            } else if (operRef.logicState == 0) {
                // msg to all
                operRef.sendMsg(
                    channelKey,
                    WordCo.cre()
                        .text('Player ')
                        .texth(cRef.nick)
                        .text(' was removed from ')
                        .texth(catRef.flag)
                        .text(' pug.'),
                    privPartRef
                )
            } else {
                // msg to all
                operRef.sendMsg(
                    channelKey,
                    WordCo.cre()
                        .text('The ')
                        .texth(catRef.flag)
                        .text(' pug stopped because player ')
                        .texth(cRef.nick)
                        .text(' was removed.'),
                    privPartRef
                )
                operRef.gameRef.clearCaptainIdle()
                operRef.logicState = 0
            }
        } else {
            partRef.noticeMessage(
                operRef,
                WordCo.cre()
                    .text('No such player ')
                    .texth(cStk.last())
                    .text(' in ')
                    .texth(catRef.flag)
                    .texth(' pug!')
            )
        }
    }
}

export default OpDelPlayer
