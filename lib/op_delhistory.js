import WordCo from "./word_co.js";

class OpDelHistory {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			hIdx,
			sf,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		hIdx = parseInt(cStk.pop());
		if (isNaN(hIdx)) hIdx = 0;

		partRef.noticeMessage(operRef, WordCo.cre().text("Deprecated!"));
	}
}

export default OpDelHistory;
