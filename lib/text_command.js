import Bot from "./bot";
import WordCo from "./word_co";

class TextCommand {
	constructor(operRef) {
		this.operRef = operRef;
		this.botRef = operRef.botRef;
	}

	isCommandExist(channelKey, cmdKey, allowDelete = true) {
		for (let ck of [channelKey + "::" + cmdKey, cmdKey]) {
			if (
				this.operRef.textCommands[ck] &&
				Array.isArray(this.operRef.textCommands[ck])
			) {
				if (allowDelete && this.operRef.textCommands[ck][0] == "::DELETE") {
					break;
				} else {
					return true;
				}
			}
		}

		return false;
	}

	getTextCommand(
		channelKey,
		cmdKey,
		getAll = false,
		callback = false,
		callbackData = false
	) {
		let mList = false,
			wRef,
			idx,
			chKeys = this.botRef.getChannelKeys(),
			useChKeys,
			lst = [];

		if (getAll) {
			chKeys.forEach((c) => {
				lst.push({
					toFnd: c + "::" + cmdKey,
					channelKey: c,
				});
			});
		} else {
			lst.push({
				toFnd: channelKey + "::" + cmdKey,
				channelKey: channelKey,
			});
		}

		lst.push({
			toFnd: cmdKey,
			channelKey: false,
		});

		for (let ck of lst) {
			if (
				this.operRef.textCommands[ck["toFnd"]] &&
				Array.isArray(this.operRef.textCommands[ck["toFnd"]])
			) {
				if (this.operRef.textCommands[ck["toFnd"]][0] == "::DELETE") {
					if (getAll) {
						// this is blank - but keep searching next
						useChKeys = [];
					} else {
						break;
					}
				} else if (ck["channelKey"]) {
					useChKeys = [];
					useChKeys.push(ck["channelKey"]);
				} else {
					useChKeys = [];

					chKeys.forEach((c) => {
						if (
							this.operRef.textCommands[c + "::" + cmdKey] &&
							Array.isArray(this.operRef.textCommands[c + "::" + cmdKey])
						) {
							// command defined before
						} else {
							useChKeys.push(c);
						}
					});
				}

				if (useChKeys.length > 0) {
					if (mList === false) {
						mList = [];
					} else {
						mList.push(WordCo.cre());
					}

					idx = 0;

					this.operRef.textCommands[ck["toFnd"]].forEach((m) => {
						if (callback) {
							wRef = callback(idx, m, useChKeys, callbackData);
						} else {
							wRef = WordCo.cre();
							wRef.text(m);
						}

						mList.push(wRef);

						idx++;
					});

					if (getAll) {
						// keep searching
					} else {
						break;
					}
				}
			}
		}

		return mList;
	}
}

export default TextCommand;
