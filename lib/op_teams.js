import WordCo from "./word_co.js";

class OpTeams {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			acRef = operRef.getAction(channelKey),
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		if (acRef.logicState == 2) {
			acRef.gameRef.teams.forEach((teamRef) => {
				operRef.msgRef.sendMsg(
					channelKey,
					teamRef.addStatusReadable(WordCo.cre()),
					privPartRef
				);
			});
		}
	}
}

export default OpTeams;
