import WordCo from "./word_co";

class OpWelcome {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			cRef,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		operRef.getUser(cStk.pop(), (cPartRef) => {
			if (cPartRef == null) {
				partRef.noticeMessage(
					operRef,
					WordCo.cre().text("No such user ").texth(cStk.last()).text("!")
				);
			} else {
				operRef.welcomeRef.sendWelcomeMessage(cPartRef, true);
			}
		});
	}
}

export default OpWelcome;
