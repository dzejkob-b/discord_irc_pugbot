import WordCo from "./word_co";

class OpBanDef {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			banNick,
			banKey,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		operRef.getUser(
			(banNick = cStk.pop()),
			(cPartRef) => {
				banKey = banNick;

				if (
					cPartRef != null &&
					typeof operRef.banUsers[cPartRef.getAuthKey()] != "undefined"
				) {
					banKey = cPartRef.getAuthKey();
				}

				if (typeof operRef.banUsers[banKey] == "undefined") {
					partRef.noticeMessage(
						operRef,
						WordCo.cre().text("Ban ").texth(banNick).text(" not found!")
					);
				} else {
					var c = operRef.banUsers[banKey],
						cmd = ".ban ";

					if (c["partRef"]) {
						cmd += c["partRef"].nick;
					} else {
						cmd += banKey;
					}

					cmd += " reason:" + c["reason"];

					if (c["duration"]) {
						cmd += " duration:" + c["duration"];
					}

					if (c["mask"] && Array.isArray(c["mask"]) && c["mask"].length > 0) {
						c["mask"].forEach((mask) => {
							cmd += " mask:" + mask;
						});
					}

					partRef.noticeMessage(
						operRef,
						WordCo.cre().text("Ban command: ").texth(cmd)
					);
				}
			},
			partRef.type
		);
	}
}

export default OpBanDef;
