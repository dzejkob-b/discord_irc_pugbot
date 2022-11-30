import WordCo from "./word_co.js";

class OpDelGrant {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		const first = cStk.pop();
		if (first && first.endsWith(":raw")) {
			const entryValue = first.substring(0, first.lastIndexOf(":raw"));
			if (entryValue && operRef.authUsers[entryValue]) {
				const entryValueAccess = operRef.authUsers[entryValue];
				delete operRef.authUsers[entryValue];
				operRef.saveState();
				partRef.noticeMessage(
					operRef,
					WordCo.cre().text(
						`Entry ${entryValue}[${entryValueAccess}] was removed from grant table.`
					)
				);
			} else {
				partRef.noticeMessage(
					operRef,
					WordCo.cre()
						.text("No such raw entry value: ")
						.texth(entryValue)
						.text("!")
				);
			}
			return;
		}

		operRef.getUser(
			first,
			(cPartRef) => {
				if (cPartRef == null) {
					partRef.noticeMessage(
						operRef,
						WordCo.cre().text("No such user ").texth(cStk.last()).text("!")
					);
				} else if (
					cPartRef.getAuthKey() == false ||
					typeof operRef.authUsers[cPartRef.getAuthKey()] == "undefined"
				) {
					partRef.noticeMessage(
						operRef,
						WordCo.cre()
							.text("User ")
							.texth(cPartRef.nick)
							.text(" is not in grant table!")
					);
				} else {
					delete operRef.authUsers[cPartRef.getAuthKey()];
					operRef.saveState();

					partRef.noticeMessage(
						operRef,
						WordCo.cre()
							.text("User ")
							.texth(cPartRef.nick)
							.text(" was removed from grant table.")
					);
				}
			},
			partRef.type
		);
	}
}

export default OpDelGrant;
