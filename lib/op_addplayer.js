import WordCo from "./word_co";

class OpAddPlayer {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			catRef,
			result,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		if (!operRef.anyCats(channelKey)) {
			partRef.noticeMessage(
				operRef,
				WordCo.cre().text("No available pugs in this channel!")
			);
		} else if (
			(catRef = operRef.getCatRef(channelKey, cStk.popMod(channelKey))) == null
		) {
			partRef.noticeMessage(
				operRef,
				cStk.first()
					? WordCo.cre().text("No such pug ").texth(cStk.first()).text("!")
					: WordCo.cre().text("Please specify pug!")
			);
		} else {
			operRef.getUser(
				cStk.pop(),
				(cPartRef) => {
					if (cPartRef == null) {
						partRef.noticeMessage(
							operRef,
							WordCo.cre().text("No such player ").texth(cStk.last()).text("!")
						);
					} else {
						result = catRef.joinParticipant(cPartRef);

						if (result == -1) {
							partRef.noticeMessage(
								operRef,
								WordCo.cre()
									.text("User ")
									.texth(cPartRef.nick)
									.text(" allready joined to ")
									.texth(catRef.flag)
									.text(" pug!")
							);
						} else if (result == -2) {
							partRef.noticeMessage(
								operRef,
								WordCo.cre()
									.text("Cannot add player ")
									.texth(cPartRef.nick)
									.text(" - ")
									.texth(catRef.flag)
									.text(" pug capacity is full! (")
									.texth(catRef.playerLimit)
									.text(")")
							);
						} else if (result == 0 || result == 1) {
							// msg to all
							operRef.msgRef.sendMsg(
								channelKey,
								WordCo.cre()
									.text("Player ")
									.texth(cPartRef.nick)
									.text(" was added to ")
									.texth(catRef.flag)
									.text(" pug."),
								privPartRef
							);
						}

						if (result == 1) {
							operRef.getAction(channelKey).startSelectCaptains(catRef);
						}
					}
				},
				partRef.type
			);
		}
	}
}

export default OpAddPlayer;
