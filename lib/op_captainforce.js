class OpCaptainForce {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		if (operRef.getAction(channelKey).logicState == 1) {
			operRef.getAction(channelKey).captainForce = true;
		}
	}
}

export default OpCaptainForce;
