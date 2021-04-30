import WordCo from "./word_co";

class OpFullReset {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			acRef = operRef.getAction(channelKey),
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
			catRef.flushParticipants();

			acRef.clearSelectCaptains();

			// msg to all
			operRef.msgRef.sendMsg(
				channelKey,
				WordCo.cre().text("The ").texth(catRef.flag).text(" pug was reset."),
				privPartRef
			);
		}
	}
}

export default OpFullReset;
