import WordCo from './word_co';

class OpRules {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, tt, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;
        
        var mList = [], tmpList = false;

        if (partRef.type == 1 && (tmpList = operRef.getTextCommand(channelKey, "ircRulesShow")) != false && tmpList.length > 0) {
            // irc user specific rules message

            mList = tmpList;

        } else {
            var ruleNumb = 1;

            do {
                tmpList = operRef.getTextCommand(channelKey, "rule" + ruleNumb, !channelKey, function(idx, m, chk, data) {

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

                if (tmpList) {
                    if (mList.length != 0) {
                        mList.push(WordCo.cre());
                    }

                    tmpList.forEach((c) => {
                        mList.push(c);
                    })
                }

                ruleNumb++;

            } while (tmpList);
        }

        if (mList.length > 0) {
            operRef.sendMsgArrayPrep(channelKey, mList, partRef);

        } else {
            operRef.sendMsg(channelKey, WordCo.cre().text('No rules defined!'), privPartRef);
        }
    }
}

export default OpRules;