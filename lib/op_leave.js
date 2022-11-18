import WordCo from "./word_co.js";

class OpLeave {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			catRef,
			tt,
			result,
			reason,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		const nextWord = cStk.first();
		if (nextWord) {
			const catalogRef = operRef.getCatRef(false, nextWord);
			if (catalogRef) {
				catRef = catalogRef;
			}
		} else {
			catRef = operRef.getCatRef(channelKey, cStk.popMod(channelKey));
		}

		if (!operRef.anyCats(channelKey)) {
			partRef.noticeMessage(
				operRef,
				WordCo.cre().text("No available pugs in this channel!")
			);
		} else if (catRef == null) {
			partRef.noticeMessage(
				operRef,
				cStk.first()
					? WordCo.cre().text("No such pug ").texth(nextWord).text("!")
					: WordCo.cre().text("Please specify pug!")
			);
		} else {
			var acRef = operRef.getAction(channelKey);

			result = catRef.leaveParticipantCooldown(acRef.gameRef, partRef);
			reason = cStk.pop();

			if (result == -1) {
				// not contained ...
			} else if (
				acRef.logicState != 0 &&
				acRef.gameRef.restCat.flag == catRef.flag
			) {
				// msg to all

				operRef.msgRef.sendMsg(
					catRef.channelKey,
					WordCo.cre()
						.text("The ")
						.texth(catRef.flag)
						.text(" pug stopped because player ")
						.texth(partRef.nick)
						.text(" left."),
					privPartRef
				);

				acRef.clearSelectCaptains();

				// const isCaptain = acRef.gameRef.getTeamByCaptain(partRef) != null;
				//catRef.addParticipantTimeout(operRef, partRef, false, isCaptain);
			} else {
				operRef.msgRef.sendMsg(
					catRef.channelKey,
					partRef.getPartMessage(catRef, reason),
					privPartRef
				);
				//catRef.addParticipantTimeout(operRef, partRef, false, false);
			}

			tt = acRef.voteRef.findJoinedParticipant(channelKey, partRef);

			if (tt["partRef"] == null) {
				acRef.voteRef.removeVoteSelf(partRef);
				acRef.voteRef.removeVoteTrg(partRef);
			}
		}
	}
}

export default OpLeave;
