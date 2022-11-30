import WordCo from "./word_co.js";

class OpUnvote {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			acRef = operRef.getAction(channelKey),
			wRef,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		if (operRef.getAction(channelKey).logicState > 0) {
			partRef.noticeMessage(
				operRef,
				WordCo.cre().text("Your cannot remove vote when pug starting!")
			);
		} else if (acRef.voteRef.removeVoteSelf(partRef)) {
			partRef.noticeMessage(
				operRef,
				WordCo.cre().text("Your votes was removed.")
			);
		} else {
			partRef.noticeMessage(
				operRef,
				WordCo.cre().text("You did not vote for anyone.")
			);
		}

		if (operRef.getAction(channelKey).logicState == 1) {
			operRef.getAction(channelKey).captainTick = 3;

			wRef = WordCo.cre();

			wRef.text("Captain candidates: ");
			acRef.voteRef.addStatusReadable(wRef);

			operRef.msgRef.sendMsg(channelKey, wRef, privPartRef);

			operRef.logicLoopTick();
		}
	}
}

export default OpUnvote;
