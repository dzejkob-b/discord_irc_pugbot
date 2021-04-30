import WordCo from "./word_co";

class OpNoun {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		operRef.msgRef.sendMsg(
			channelKey,
			WordCo.cre().text(operRef.nounRef.getNoun()),
			privPartRef
		);
	}
}

export default OpNoun;
