import WordCo from "./word_co";

class Rules {
	constructor(parent) {
		this.parent = parent;
	}

	getRules(channelKey, singleRuleNumb = false) {
		let tt,
			operRef = this.parent,
			partRef = operRef.partRef,
			mList = [],
			tmpList = false;

		if (
			partRef != null &&
			partRef.type == 1 &&
			(tmpList = operRef.txtRef.getTextCommand(channelKey, "ircRulesShow")) !=
				false &&
			tmpList.length > 0
		) {
			// irc user specific rules message

			mList = tmpList;
		} else {
			var ruleNumb = singleRuleNumb ? singleRuleNumb : 1;

			do {
				tmpList = operRef.txtRef.getTextCommand(
					channelKey,
					"rule" + ruleNumb,
					!channelKey,
					function (idx, m, chk, data) {
						var wRef = WordCo.cre();

						if (idx == 0) {
							wRef.text("rule" + data + ": ", true);

							if ((tt = operRef.botRef.getChannelKeysReadable(chk)) != false) {
								wRef.texth("[" + tt + "] ");
							}

							wRef.text(m);
						} else {
							wRef.text(m);
						}

						return wRef;
					},
					ruleNumb
				);

				if (tmpList) {
					if (mList.length != 0) {
						mList.push(WordCo.cre());
					}

					tmpList.forEach((c) => {
						mList.push(c);
					});
				}

				if (singleRuleNumb) {
					break;
				} else {
					ruleNumb++;
				}
			} while (
				tmpList ||
				operRef.txtRef.isCommandExist(
					channelKey,
					"rule" + (ruleNumb - 1),
					false
				)
			);
		}

		return mList;
	}
}

export default Rules;
