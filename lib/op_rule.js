import WordCo from './word_co';

class OpRule {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, ruleNumb, userName, tt, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        ruleNumb = parseInt(cStk.pop());
        if (isNaN(ruleNumb)) ruleNumb = 0;

        if (!ruleNumb) {
            operRef.sendMsg(channelKey, WordCo.cre().text('Please specify rule number!'), privPartRef);

        } else {
            var mList = operRef.getTextCommand(channelKey, "rule" + ruleNumb, !channelKey, function(idx, m, chk, data) {

                var wRef = WordCo.cre();

                if (idx == 0) {
                    wRef.text('rule' + data + ': ', true);

                    if ((tt = operRef.botRef.getChannelKeysReadable(chk)) != false) {
                        wRef.texth('[' + tt + '] ');
                    }

                    wRef.text(m);

                } else {
                    wRef.text(m);
                }

                return wRef;

            }, ruleNumb);

            if (mList) {
                if (userName = cStk.pop()) {
                    operRef.getUser(userName, (cPartRef) => {

                        if (cPartRef == null) {
                            partRef.noticeMessage(operRef, WordCo.cre().text('No such user ').texth(userName).text('!'));

                        } else {
                            var ntfList = [];

                            ntfList.push(WordCo.cre().text('User ').texth(partRef.nick).text(' just reminded you the rule:'));
                            ntfList.push(WordCo.cre());

                            mList.forEach((c) => {
                                ntfList.push(c);
                            });

                            operRef.sendMsgArrayPrep(channelKey, ntfList, cPartRef);
                        }

                    });

                } else {
                    operRef.sendMsgArrayPrep(channelKey, mList, privPartRef);
                }

            } else {
                operRef.sendMsg(channelKey, WordCo.cre().text('No such rule ').texth(ruleNumb, true).text('!'), privPartRef);
            }
        }
    }
}

export default OpRule;