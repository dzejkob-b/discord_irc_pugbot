class CmdStack {
	constructor(operRef, text) {
		this.operRef = operRef;
		this.pts = [];
		this.lastPoped = false;

		text = text.trim();

		for (var sf = 1; sf < 20; sf++) {
			if (text == "p" + sf) {
				text = "p " + sf;
				sf = 20;
			}
		}

		var idx = 0,
			len = text.length,
			word = "",
			ch = false;

		while (idx <= len) {
			if (idx == len || (!ch && text[idx] == " ")) {
				word = word.trim();

				if (word.length > 0) {
					this.pts.push(word);
				}

				word = "";
			} else if (ch) {
				if (text[idx] == "\\" && idx + 1 < len) {
					idx++;
					word += text[idx];
				} else if (ch == text[idx]) {
					ch = false;
				} else {
					word += text[idx];
				}
			} else if (text[idx] == '"' || text[idx] == "'") {
				ch = text[idx];
			} else {
				word += text[idx];
			}

			idx++;
		}
	}

	popMod(channelKey) {
		if (this.pts.length == 0) {
			return false;
		} else if (this.operRef.getCatRefByFlag(channelKey, this.pts[0]) != null) {
			return this.pop();
		} else {
			return false;
		}
	}

	add(value) {
		this.pts.splice(0, 0, value);
		this.lastPoped = false;
	}

	pop() {
		if (this.pts.length == 0) {
			return false;
		} else {
			var sf;

			this.lastPoped = this.pts[0];

			for (sf = 0; sf < this.pts.length - 1; sf++) {
				this.pts[sf] = this.pts[sf + 1];
			}

			this.pts.pop();

			return this.lastPoped;
		}
	}

	getRestString() {
		var sf,
			result = "";

		for (sf = 0; sf < this.pts.length; sf++) {
			result += (result == false ? "" : " ") + this.pts[sf];
		}

		return result;
	}

	last() {
		return this.lastPoped;
	}

	first() {
		return this.pts.length > 0 ? this.pts[0] : false;
	}
}

export default CmdStack;
