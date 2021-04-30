import WordCo from "./word_co";

class OpPm {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		operRef.getUser(
			cStk.pop(),
			(sPartRef) => {
				if (sPartRef != null) {
					sPartRef.personalMessage(operRef, cStk.pop());
				}
			},
			partRef.type
		);
	}
}

export default OpPm;
