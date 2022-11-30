import WordCo from "./word_co.js";

class OpTurn {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			acRef = operRef.getAction(channelKey),
			teamRef,
			tmList = [],
			wRef,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		if (acRef.logicState == 2) {
			teamRef = acRef.gameRef.getTeamByTurn();

			// msg to all
			wRef = WordCo.cre();

			wRef.text("Captain");
			teamRef.addTextFormatted(
				wRef,
				" " + teamRef.captPartRef.nick + " ",
				false,
				true
			);
			wRef.text("now picks: ");

			wRef = acRef.gameRef.restCat.addStatusReadable(
				wRef,
				true,
				acRef.voteRef,
				channelKey,
				operRef
			);

			tmList.push(wRef);
			tmList.push(WordCo.cre());

			acRef.gameRef.teams.forEach((teamRef) => {
				tmList.push(teamRef.addStatusReadable(WordCo.cre()));
			});

			operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
		}
	}
}

export default OpTurn;
