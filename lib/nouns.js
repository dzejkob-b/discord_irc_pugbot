class Nouns {
	constructor() {
		this.nouns = false;
	}

	loadNouns() {
		var fs = require("fs"),
			data = fs.readFileSync("nounlist.txt", "utf8");

		if (data) {
			this.nouns = data.split("\n");
		}
	}

	getNoun() {
		if (this.nouns == false) {
			this.loadNouns();
		}

		if (this.nouns != false && this.nouns.length > 0) {
			return this.nouns[
				Math.floor(Math.random() * (this.nouns.length - 1))
			].trim();
		} else {
			return this.getRandomNick();
		}
	}

	getRandomNick() {
		var randNick = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

		for (var i = 0; i < 10; i++) {
			randNick += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return randNick;
	}
}

export default Nouns;
