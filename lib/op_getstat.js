import WordCo from "./word_co";

class OpGetStat {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		/*
        var hGameRef = operRef.gameHistory[0];
        operRef.statsRef.saveGameToStats(hGameRef);
        //operRef.statsRef.getUser(partRef);
        */
	}
}

export default OpGetStat;
