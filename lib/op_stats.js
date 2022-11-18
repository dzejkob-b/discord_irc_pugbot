import WordCo from "./word_co.js";

class OpStats {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			catRef,
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
			partRef.noticeMessage(
				operRef,
				cStk.first()
					? WordCo.cre().text("No such pug ").texth(cStk.first()).text("!")
					: WordCo.cre().text("Please specify pug!")
			);
		} else {
			operRef.getUser(
				cStk.pop(),
				(cPartRef) => {
					operRef.statsRef.sumRef.getStatsMessages(
						catRef.flag,
						cPartRef == null ? cStk.last() : cPartRef,
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
				},
				partRef.type,
				true
			);
		}
	}
}

export default OpStats;
