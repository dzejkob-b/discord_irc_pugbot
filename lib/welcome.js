import WordCo from "./word_co";
import Participant from "./participant";

class Welcome {
	constructor(operRef) {
		this.operRef = operRef;
		this.welcomeList = [];

		this.enabled = false;
		this.enableTm = false;
	}

	doEnable() {
		if (!this.enabled && !this.enableTm) {
			this.enableTm = setTimeout(() => {
				this.enabled = true;
			}, 2000);
		}
	}

	toJSON_welcome() {
		var result = {
			welcomeList: [],
		};

		this.welcomeList.forEach((c) => {
			result["welcomeList"].push({
				time: c["time"],
				partRef: c["partRef"].toJSON(),
			});
		});

		return result;
	}

	fromJSON_welcome(input) {
		if (input["welcomeList"] && Array.isArray(input["welcomeList"])) {
			input["welcomeList"].forEach((c) => {
				this.welcomeList.push({
					time: c["time"],
					partRef: Participant.fromJSON(c["partRef"]),
				});
			});
		}
	}

	getMessage(cPartRef) {
		let sf, msg, nMsg;

		if (cPartRef.type == 1 && this.operRef.options.welcomeMessageIrc) {
			msg = this.operRef.options.welcomeMessageIrc;
			nMsg = [];

			for (sf = 0; sf < msg.length; sf++) {
				nMsg.push(msg[sf].replace("$@1", cPartRef.nick));
			}

			return nMsg;
		} else if (
			cPartRef.type == 0 &&
			this.operRef.options.welcomeMessageDiscord
		) {
			msg = this.operRef.options.welcomeMessageDiscord;
			nMsg = [];

			for (sf = 0; sf < msg.length; sf++) {
				nMsg.push(msg[sf].replace("$@1", cPartRef.nick));
			}

			return nMsg;
		} else {
			return false;
		}
	}

	sendWelcomeMessage(cPartRef, force) {
		let msg,
			idx,
			self = this;

		if (!this.enabled || cPartRef.nick == this.operRef.botRef.nickname) {
			return false;
		}

		if (
			((idx = this.getEntry(cPartRef)) == -1 || force) &&
			(msg = this.getMessage(cPartRef))
		) {
			if (idx == -1) {
				this.addEntry(cPartRef);
			}

			msg.forEach((c) => {
				cPartRef.noticeMessage(this.operRef, WordCo.cre().text(c));
			});
		} else {
			return false;
		}
	}

	getEntry(partRef) {
		let idx = 0;

		while (idx < this.welcomeList.length) {
			if (this.welcomeList[idx]["partRef"].compareEqual(partRef)) {
				return idx;
			}

			idx++;
		}

		return -1;
	}

	addEntry(partRef) {
		this.welcomeList.push({
			time: new Date().getTime() / 1000,
			partRef: partRef.getClone(),
		});

		this.saveState();
	}

	saveState() {
		var fs = require("fs");
		var jsonStr = JSON.stringify(this.toJSON_welcome(), null, 2);

		fs.writeFileSync("welcome.json", jsonStr);
	}

	loadState() {
		var fs = require("fs"),
			data,
			dt;

		if (
			fs.existsSync("welcome.json") &&
			(data = fs.readFileSync("welcome.json", "utf8")) != false &&
			(dt = JSON.parse(data))
		) {
			this.fromJSON_welcome(dt);
		}
	}
}

export default Welcome;
