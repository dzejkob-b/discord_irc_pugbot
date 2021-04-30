import WordCo from "./word_co";

class OpMyStats {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			catRef,
			md,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		if (!operRef.anyCats(channelKey)) {
			partRef.noticeMessage(
				operRef,
				WordCo.cre().text("No available pugs in this channel!")
			);
		} else if (
			(catRef = operRef.getCatRef(channelKey, cStk.popMod(channelKey))) == null
		) {
			if (cStk.first()) {
				partRef.noticeMessage(
					operRef,
					WordCo.cre().text("No such pug ").texth(cStk.first()).text("!")
				);
			} else {
				partRef.noticeMessage(
					operRef,
					WordCo.cre().text("Specify pug for stats!")
				);
			}
		} else {
			operRef.statsRef.sumRef.getStatsMessages(
				catRef.flag,
				partRef,
				cStk.pop(),
				(msgs) => {
					if (msgs.length > 0) {
						operRef.msgRef.sendMsgArrayPrep(channelKey, msgs, privPartRef);
					} else {
						partRef.noticeMessage(
							operRef,
							WordCo.cre().text("No stats found.")
						);
					}
				}
			);
		}
	}
}

export default OpMyStats;
