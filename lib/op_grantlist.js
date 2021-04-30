import WordCo from "./word_co";

class OpGrantList {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			isStart = true,
			userKey,
			cUser,
			wRef,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		wRef = WordCo.cre();

		if (Object.keys(operRef.authUsers).length == 0) {
			wRef.text("No authed users.");
		} else {
			for (userKey in operRef.authUsers) {
				cUser = operRef.authUsers[userKey];

				if (isStart) {
					isStart = false;
				} else {
					wRef.text(", ");
				}

				if (cUser["partRef"]) {
					wRef.texth(cUser["partRef"].readableInfo_b());
				} else {
					wRef.texth(userKey);
				}

				wRef.text(" auth level: ").texth(operRef.authUsers[userKey]);
			}
		}

		operRef.msgRef.sendMsg(channelKey, wRef, privPartRef);
	}
}

export default OpGrantList;
