import WordCo from "./word_co";
import Catalog from "./catalog";
import { secsAgoFormat } from "./helpers";

class OpNewStats {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			nick,
			lastPop = false,
			catRef,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef;

		if (
			(lastPop = cStk.pop()) != false &&
			(catRef = operRef.getCatRef(false, lastPop)) == null
		) {
			cStk.add(lastPop);
		}

		if (operRef.currentCmd == "mystats") {
			this.displayStats(channelKey, partRef, catRef);
		} else if ((nick = cStk.pop()) == false) {
			partRef.noticeMessage(operRef, WordCo.cre().text("Specify player nick!"));
		} else {
			operRef.getUser(
				nick,
				(cPartRef) => {
					if (cPartRef == null) {
						partRef.noticeMessage(
							operRef,
							WordCo.cre().text("No player entry for ").texth(nick).text("!")
						);
					} else {
						this.displayStats(channelKey, cPartRef, catRef);
					}
				},
				partRef.type,
				true
			);
		}
	}

	displayStats(channelKey, cPartRef, catRef) {
		var operRef = this.parent,
			pList = [],
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		pList.push(cPartRef);

		operRef.statsRef.getStatsMultiple(
			operRef.statsRef.parseAvgStatMethod("unlimited"),
			catRef ? catRef.flag : null,
			pList,
			(rows) => {
				var msgs = [],
					wRef;

				if (rows.length > 0) {
					wRef = WordCo.cre();
					wRef.text("Stats of player ").text(cPartRef.nick, true).text(":");

					msgs.push(wRef);
				}

				rows.forEach((row) => {
					var tPugs = row["totalpugs"] - row["captained"];
					var tAvgPick = 0;
					var tAvgTotPick = 0;

					if (tPugs > 0) {
						tAvgPick = Math.round((row["picks"] / tPugs) * 100.0) / 100.0;
						tAvgTotPick =
							Math.round((row["totalpicks"] / tPugs) * 100.0) / 100.0;
					}

					msgs.push(WordCo.cre());

					var cTm = new Date().getTime() / 1000;
					var dailyStat =
						Math.round(
							(row["totalpugs"] / ((cTm - row["min_starttime"]) / 86400)) *
								100.0
						) / 100.0;

					wRef = WordCo.cre();

					wRef.text(("" + row["flag"]).toUpperCase(), true);

					wRef.sep();

					wRef.text("Tot.: ");
					wRef.texth("[").text(row["st_totalpugs"]).texth("]");

					wRef.sep();

					wRef.text("Cpt.: ");
					wRef.texth("[").text(row["st_captained"]).texth("]");

					wRef.sep();

					wRef.text("Pick: ");
					wRef
						.texth("[")
						.text(tAvgPick)
						.texth("/")
						.text(tAvgTotPick)
						.texth("]");

					wRef.sep();

					wRef.text("Daily: ");
					wRef
						.texth("[")
						.text(dailyStat >= 10 ? "10+" : dailyStat)
						.texth("]");

					msgs.push(wRef);

					wRef = WordCo.cre();
					wRef.text("Last: ");

					var lastDiff = Math.round(cTm - row["starttime"]);

					if (lastDiff > 0) {
						wRef
							.texth("[")
							.text(secsAgoFormat(lastDiff) + " ago")
							.texth("]");
					} else {
						wRef.texth("[").text("unknown").texth("]");
					}

					msgs.push(wRef);
				});

				if (msgs.length > 0) {
					operRef.msgRef.sendMsgArrayPrep(channelKey, msgs, privPartRef);
				} else {
					partRef.noticeMessage(operRef, WordCo.cre().text("No stats found."));
				}
			}
		);
	}
}

export default OpNewStats;
