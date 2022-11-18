import WordCo from "./word_co.js";

class OpAbout {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		this.parent.msgRef.sendMsg(
			channelKey,
			WordCo.cre()
				.text(
					"This is PUGBOT for pickup games which processing multiple message sources (irc, discord). Project homepage: "
				)
				.text("https://github.com/dzejkob-b/discord_irc_pugbot"),
			this.parent.privPartRef
		);
	}
}

export default OpAbout;
