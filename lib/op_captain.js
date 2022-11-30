import WordCo from "./word_co.js";

class OpCaptain {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			acRef,
			cRef,
			teamRef,
			teamColor,
			wRef,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		if (
			(acRef = operRef.getAction(channelKey)) == null ||
			acRef.logicState != 1
		) {
			// ...
		} else if (!acRef.gameRef.partInGame(partRef)) {
			partRef.noticeMessage(
				operRef,
				WordCo.cre()
					.text("You not in the ")
					.texth(acRef.gameRef.restCat.flag)
					.text(" pug!")
			);
		} else if (acRef.gameRef.getTeamByCaptain(partRef) != null) {
			partRef.noticeMessage(
				operRef,
				WordCo.cre().text("You allready are captain!")
			);
		} else {
			teamColor = cStk.pop();
			teamRef = null;

			if (teamColor) {
				if ((teamRef = acRef.gameRef.getTeamByColor(teamColor)) == null) {
					partRef.noticeMessage(
						operRef,
						WordCo.cre().text("No such team ").texth(teamColor).text("!")
					);
				}
			} else {
				if ((teamRef = acRef.gameRef.getFirstNocaptTeam()) == null) {
					partRef.noticeMessage(
						operRef,
						WordCo.cre().text("All teams allready have captains!")
					);
				}
			}

			if (teamRef != null) {
				acRef.gameRef.setCaptainToTeam(teamRef, partRef, "wanted");

				operRef.saveState();

				// msg to all
				wRef = WordCo.cre();

				wRef.text("Player");
				teamRef.addTextFormatted(wRef, " " + partRef.nick + " ", false, true);
				wRef.text("became captain for ");
				wRef.textDiscord(teamRef.getDiscordIcon());
				teamRef.addTextFormatted(wRef, teamRef.colorName + " Team");
				wRef.text(".");

				operRef.msgRef.sendMsg(channelKey, wRef, privPartRef);
				operRef.logicLoopTick();

				if (acRef.gameRef.getNonCaptainCount() == 0) {
					acRef.captainForce = true;
					acRef.captainForcePicked = true;
				}
			}
		}
	}
}

export default OpCaptain;
