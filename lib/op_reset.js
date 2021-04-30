import WordCo from "./word_co";

class OpReset {
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

		if (acRef.logicState == 0) {
			operRef.msgRef.sendMsg(
				channelKey,
				WordCo.cre().text("Cannot reset - no picking started!"),
				privPartRef
			);
		} else if (!operRef.anyCats(channelKey)) {
			partRef.noticeMessage(
				operRef,
				WordCo.cre().text("No available pugs in this channel!")
			);
		} else if (
			(catRef = operRef.getCatRef(channelKey, acRef.gameRef.restCat.flag)) ==
			null
		) {
			operRef.msgRef.sendMsg(
				channelKey,
				WordCo.cre()
					.text("No such pug ")
					.texth(acRef.gameRef.restCat.flag)
					.text("!"),
				privPartRef
			);
		} else {
			acRef.startSelectCaptains(catRef, -5);

			// msg to all
			operRef.msgRef.sendMsg(
				channelKey,
				WordCo.cre()
					.text("The picking in ")
					.texth(catRef.flag)
					.text(" pug was reset."),
				privPartRef
			);
		}
	}
}

export default OpReset;
