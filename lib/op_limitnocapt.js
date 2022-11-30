import WordCo from "./word_co.js";

class OpLimitNoCapt {
	minNoCaptTag = 0;
	maxNoCaptTag = 8;

	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			cRef,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		const maxAmount = cStk.pop() ? parseInt(cStk.last()) : -1;

		if (maxAmount < this.minNoCaptTag || maxAmount > this.maxNoCaptTag) {
			partRef.noticeMessage(
				operRef,
				WordCo.cre().text(
					"The nocapt limit possible  values are between " +
						this.minNoCaptTag +
						" and " +
						this.maxNoCaptTag
				)
			);
			return;
		}

		operRef.setLimitNoCaptTag(maxAmount);
		partRef.noticeMessage(
			operRef,
			WordCo.cre().text("The nocapt limit has been set to " + maxAmount)
		);
	}
}

export default OpLimitNoCapt;
