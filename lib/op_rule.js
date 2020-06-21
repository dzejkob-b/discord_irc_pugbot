import WordCo from './word_co'
import Rules from './rules'

class OpRule {
    constructor(parent) {
        this.parent = parent
    }

    exec(channelKey) {
        let operRef = this.parent,
            ruleNumb,
            userName,
            cStk = this.parent.cStk,
            partRef = this.parent.partRef,
            privPartRef = this.parent.privPartRef

        ruleNumb = parseInt(cStk.pop())
        if (isNaN(ruleNumb)) ruleNumb = 0

        if (!ruleNumb) {
            partRef.noticeMessage(
                operRef,
                WordCo.cre().text('Please specify rule number!')
            )
        } else {
            let mList = new Rules(this.parent).getRules(channelKey, ruleNumb)

            if (mList) {
                if ((userName = cStk.pop()) != null) {
                    operRef.getUser(userName, (cPartRef) => {
                        if (cPartRef == null) {
                            partRef.noticeMessage(
                                operRef,
                                WordCo.cre()
                                    .text('No such user ')
                                    .texth(userName)
                                    .text('!')
                            )
                        } else {
                            var ntfList = []

                            ntfList.push(
                                WordCo.cre()
                                    .text('User ')
                                    .texth(partRef.nick)
                                    .text(' just reminded you the rule:')
                            )
                            ntfList.push(WordCo.cre())

                            mList.forEach((c) => {
                                ntfList.push(c)
                            })

                            operRef.sendMsgArrayPrep(
                                channelKey,
                                ntfList,
                                cPartRef
                            )
                        }
                    })
                } else {
                    operRef.sendMsgArrayPrep(channelKey, mList, privPartRef)
                }
            } else {
                operRef.sendMsg(
                    channelKey,
                    WordCo.cre()
                        .text('No such rule ')
                        .texth(ruleNumb, true)
                        .text('!'),
                    privPartRef
                )
            }
        }
    }
}

export default OpRule
