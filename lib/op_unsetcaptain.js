import WordCo from "./word_co.js";

class OpUnsetCaptain {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			acRef = operRef.getAction(channelKey),
			teamRef,
			teamColor,
			wRef,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		if (acRef.logicState == 1 || acRef.logicState == 2) {
			teamColor = cStk.pop();
			teamRef = null;

			if ((teamRef = acRef.gameRef.getTeamByColor(teamColor)) == null) {
				partRef.noticeMessage(
					operRef,
					WordCo.cre().text("No such team ").texth(teamColor).text("!")
				);
			} else if (teamRef.captPartRef == null) {
				partRef.noticeMessage(
					operRef,
					WordCo.cre()
						.text("Team ")
						.texth(teamRef.colorName)
						.text(" dont have captain!")
				);
			} else {
				let befCaptPartRef = teamRef.captPartRef;

				acRef.gameRef.resetPickings();

				teamRef.unsetCaptParticipant(acRef.gameRef, teamRef);
				acRef.gameRef.restCat.joinParticipantSorted(befCaptPartRef);

				acRef.logicState = 1;
				acRef.captainTick = 3;
				acRef.captainForce = false;
				acRef.captainForcePicked = false;

				operRef.saveState();

				wRef = WordCo.cre();

				wRef.text("Captain");
				teamRef.addTextFormatted(
					wRef,
					" " + befCaptPartRef.nick + " ",
					false,
					true
				);
				wRef.text("of ");
				wRef.textDiscord(teamRef.getDiscordIcon());
				teamRef.addTextFormatted(wRef, teamRef.colorName + " Team");
				wRef.text(" was removed.");

				operRef.msgRef.sendMsg(channelKey, wRef, privPartRef);

				operRef.logicLoopTick();
			}
		} // if
	}
}

export default OpUnsetCaptain;
