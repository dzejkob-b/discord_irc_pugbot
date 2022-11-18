import WordCo from "./word_co.js";

class OpSetCaptain {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			acRef = operRef.getAction(channelKey),
			cRef,
			teamRef,
			teamColor,
			wRef,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		if (acRef.logicState == 1 || acRef.logicState == 2) {
			var cPartRef;

			if (
				(cPartRef = acRef.gameCatRef.getParticipantNickOrForceIndex(
					cStk.pop()
				)) == null
			) {
				partRef.noticeMessage(
					operRef,
					WordCo.cre()
						.text("No user ")
						.texth(cStk.last())
						.text(" in the ")
						.texth(acRef.gameRef.restCat.flag)
						.text(" pug!")
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
							WordCo.cre()
								.text("All captains is set. Please use command with color ")
								.texth("!setcaptain playerName color")
						);
					}
				}

				if (teamRef != null) {
					var befNocaptCount = acRef.gameRef.getNonCaptainCount();

					acRef.gameRef.resetPickings();
					acRef.gameRef.setCaptainToTeam(teamRef, cPartRef, "enforced");

					if (acRef.gameRef.getNonCaptainCount() > 0) {
						acRef.logicState = 1;
						acRef.captainTick = 3;
						acRef.captainForce = false;
						acRef.captainForcePicked = false;
					}

					operRef.saveState();

					// msg to all
					wRef = WordCo.cre();

					wRef.text("Player");
					teamRef.addTextFormatted(
						wRef,
						" " + cPartRef.nick + " ",
						false,
						true
					);
					wRef.text("was set as captain for ");
					wRef.textDiscord(teamRef.getDiscordIcon());
					teamRef.addTextFormatted(wRef, teamRef.colorName + " Team");
					wRef.text(".");

					if (befNocaptCount == 0 && acRef.gameRef.getNonCaptainCount() > 0) {
						wRef.text(" (Captain on one team was removed)");
					}

					operRef.msgRef.sendMsg(channelKey, wRef, privPartRef);

					// msg to specific
					wRef = WordCo.cre();

					wRef.text("You were set as captain for ");
					wRef.textDiscord(teamRef.getDiscordIcon());
					teamRef.addTextFormatted(wRef, teamRef.colorName + " Team");
					wRef.text(" by ");
					wRef.texth(partRef.nick);
					wRef.text(".");

					cPartRef.personalMessage(operRef, wRef);

					operRef.logicLoopTick();

					if (acRef.gameRef.getNonCaptainCount() == 0) {
						acRef.captainForce = true;
						acRef.captainForcePicked = true;
					}
				} // if
			}
		} // if
	}
}

export default OpSetCaptain;
