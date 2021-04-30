import WordCo from "./word_co";

class OpJoin {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			catRef,
			wRef,
			result,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		if (operRef.getAction(channelKey).logicState != 0) {
			partRef.noticeMessage(
				operRef,
				WordCo.cre().text("Cannot join - pug starting!")
			);
		} else {
			catRef = null;

			const next = cStk.first();
			if (cStk.pts.length > 0 && next && !next.startsWith("-")) {
				catRef = operRef.getCatRef(false, cStk.popMod(false));

				if (!catRef) {
					partRef.noticeMessage(
						operRef,
						WordCo.cre().text("No such pug ").texth(cStk.last()).text("!")
					);
				}
			} else {
				catRef = operRef.getCatRef(channelKey);

				if (!catRef) {
					partRef.noticeMessage(
						operRef,
						WordCo.cre().text("No available pugs in this channel!")
					);
				}
			}

			if (!catRef) {
				// skip ...
			} else if (catRef.channelKey != channelKey) {
				partRef.noticeMessage(
					operRef,
					WordCo.cre()
						.text("Please join channel ")
						.channelLink(operRef.botRef.channels[catRef.channelKey], "", "")
						.text(" first to join ")
						.texth(catRef.flag)
						.text(" pug!")
				);
			} else if ((wRef = catRef.testParticipantTimeout(partRef)) != null) {
				partRef.noticeMessage(operRef, wRef);
			} else if (
				operRef.botRef.ircAuthUserOnly &&
				!partRef.getAuthKeyRelevant()
			) {
				partRef.noticeMessage(
					operRef,
					WordCo.cre()
						.text("Only authed users are allowed to join ")
						.texth(catRef.flag)
						.text(" pug!")
				);
			} else {
				result = catRef.joinParticipant(partRef);

				if (result == -1) {
					partRef.noticeMessage(
						operRef,
						WordCo.cre()
							.text("You allready joined to ")
							.texth(catRef.flag)
							.text(" pug!")
					);
				} else if (result == -2) {
					partRef.noticeMessage(
						operRef,
						WordCo.cre()
							.text("You cannot join to ")
							.texth(catRef.flag)
							.text(" pug - capacity is full! (")
							.texth(catRef.playerLimit)
							.text(")")
					);
				} else if (result == 0 || result == 1) {
					operRef.msgRef.sendMsg(
						channelKey,
						WordCo.cre()
							.text("Player ")
							.texth(partRef.nick)
							.text(" joined to ")
							.texth(catRef.flag)
							.text(" pug.")
					);

					const cmd = cStk.pop();
					if (cmd && cmd[0] == "-") {
						const cmdStripped = cmd.substr(1).toLowerCase();

						if (["tag", "join", "j"].includes(cmdStripped)) {
							const text = `${cmdStripped} ${cStk.getRestString()}`;
							operRef.supplyCommandAny(
								catRef.channelKey,
								partRef,
								text,
								privPartRef
							);
						} else {
							partRef.noticeMessage(
								operRef,
								WordCo.cre().text(
									`Subcommand ${cmdStripped} is unknown or invalid.`
								)
							);
						}
					}
				}

				if (result == 1) {
					operRef.getAction(channelKey).startSelectCaptains(catRef);
				}
			}
		}
	}
}

export default OpJoin;
