import WordCo from "./word_co";
import Rules from "./rules";
import Catalog from "./catalog";
import Team from "./team";
import Game from "./game";

class PageView {
	constructor(operRef) {
		this.operRef = operRef;
	}

	doCompose() {
		if (this.operRef.htmlPagePath) {
			var cont,
				fs = require("fs");

			if (
				fs.existsSync("page.html") &&
				(cont = fs.readFileSync("page.html", "utf8")) != false
			) {
				var dt = {
					pugCurrent: "",
					pugHistory: "",
					pugRules: "",
					pugBans: "",
				};

				this.doComposeLoop(0, cont, dt);
			} // if
		} // if
	}

	doComposeLoop(idx, cont, dt) {
		var self = this;

		this.operRef.statsRef.getGameStat(
			false,
			false,
			false,
			idx,
			function (st_rows, pl_rows) {
				if (st_rows && pl_rows) {
					var gRef = Game.fromStatData(st_rows[0], pl_rows);
					var wRef = gRef.addStatusReadable(WordCo.cre(), true);

					dt["pugHistory"] += "<p>" + wRef.getHtml() + "</p>";

					if (idx > 6) {
						self.doComposeFinal(cont, dt);
					} else {
						self.doComposeLoop(idx + 1, cont, dt);
					}
				} else {
					self.doComposeFinal(cont, dt);
				}
			}
		);
	}

	doComposeFinal(cont, dt) {
		var wRef,
			sf,
			fs = require("fs");

		this.operRef.cats.forEach((catRef) => {
			wRef = catRef.addStatusReadable(
				WordCo.cre(),
				false,
				this.operRef.getAction(catRef.channelKey).voteRef
			);

			dt["pugCurrent"] += "<p>" + wRef.getHtml() + "</p>";
		});

		var mList = new Rules(this.operRef).getRules(false);

		if (mList.length > 0) {
			var rStart = true;

			dt["pugRules"] += "<p>";
			sf = 0;

			while (sf < mList.length) {
				if (mList[sf].isBlank()) {
					dt["pugRules"] += "</p><p>";
					rStart = true;
				} else {
					if (rStart) {
						rStart = false;
					} else {
						dt["pugRules"] += "<br/>";
					}

					dt["pugRules"] += mList[sf].getHtml(true);
				}

				sf++;
			}

			dt["pugRules"] += "</p>";
		}

		var banKey, cBan;

		for (banKey in this.operRef.banUsers) {
			cBan = this.operRef.banUsers[banKey];

			wRef = WordCo.cre();

			if (cBan["partRef"]) {
				wRef.texth(cBan["partRef"].readableInfo_b());
			} else {
				wRef.texth(banKey);
			}

			if (cBan["duration"] == 0) {
				wRef
					.text(" permanently banned by ")
					.texth(cBan["by"].nick)
					.text(" for: ")
					.texth(cBan["reason"]);
			} else {
				wRef
					.text(" banned by ")
					.texth(cBan["by"].nick)
					.text(" for ")
					.texth(cBan["duration"])
					.text(" hours: ")
					.texth(cBan["reason"]);
			}

			if (
				cBan["mask"] &&
				Array.isArray(cBan["mask"]) &&
				cBan["mask"].length > 0
			) {
				wRef.text(" (masks: ").texth(cBan["mask"].join(", ")).text(")");
			}

			dt["pugBans"] += "<p>" + wRef.getHtml() + "</p>";
		}

		if (!dt["pugBans"]) {
			dt["pugBans"] += "<p>Nobody was banned.</p>";
		}

		cont = cont.replace("{$seconds$}", new Date().getTime() / 1000);
		cont = cont.replace("{$pugCurrent$}", dt["pugCurrent"]);
		cont = cont.replace("{$pugHistory$}", dt["pugHistory"]);
		cont = cont.replace("{$pugRules$}", dt["pugRules"]);
		cont = cont.replace("{$pugBans$}", dt["pugBans"]);

		fs.writeFile(this.operRef.htmlPagePath, cont, function (err) {
			// may be async
		});
	}
}

export default PageView;
