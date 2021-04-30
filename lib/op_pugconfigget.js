import WordCo from "./word_co";
import Catalog from "./catalog";

class OpConfigPugGet {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			cRef,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		const popMod = cStk.popMod(channelKey);
		const catRef = operRef.getCatRef(channelKey, popMod);
		const subCmd = cStk.pop();

		if (!catRef) {
			operRef.msgRef.sendMsg(
				channelKey,
				WordCo.cre().text(`pug name doesn't exists.`),
				privPartRef
			);
			return;
		} else if (
			subCmd &&
			(!Catalog.SUBCOMMANDS[subCmd] || !Catalog.SUBCOMMANDS[subCmd]["settable"])
		) {
			operRef.msgRef.sendMsg(
				channelKey,
				WordCo.cre().text(
					`Unknown subcommand "${subCmd}", SubCommands: ${Catalog.SubCommandsList()}`
				),
				privPartRef
			);

			return;
		}

		let shouldSaveState = false;

		const subCmdLowerCase = subCmd ? subCmd.toLowerCase() : "";

		switch (subCmdLowerCase) {
			case "plcooldown":
				operRef.msgRef.sendMsg(
					channelKey,
					WordCo.cre()
						.text(Catalog.SUBCOMMANDS[subCmd]["readable"])
						.text(" is set to: ")
						.text(catRef.playerRejoinCooldownInSecs, true)
						.text(" seconds."),
					privPartRef
				);
				break;

			case "cptcooldown":
				operRef.msgRef.sendMsg(
					channelKey,
					WordCo.cre()
						.text(Catalog.SUBCOMMANDS[subCmd]["readable"])
						.text(" is set to: ")
						.text(catRef.captainIdleCooldownInSecs, true)
						.text(" seconds."),
					privPartRef
				);
				break;

			case "cptidle":
				operRef.msgRef.sendMsg(
					channelKey,
					WordCo.cre()
						.text(Catalog.SUBCOMMANDS[subCmd]["readable"])
						.text(" is set to: ")
						.text(catRef.captainIdleInSecs, true)
						.text(" seconds."),
					privPartRef
				);
				break;

			case "votes":
				operRef.msgRef.sendMsg(
					channelKey,
					WordCo.cre()
						.text(Catalog.SUBCOMMANDS[subCmd]["readable"])
						.text(" is set to: ")
						.text(catRef.possibleVotes)
						.text("."),
					privPartRef
				);
				break;

			case "picksteps":
				operRef.msgRef.sendMsg(
					channelKey,
					WordCo.cre()
						.text(Catalog.SUBCOMMANDS[subCmd]["readable"])
						.text(" is set to: ")
						.text(catRef.pickSteps)
						.text("."),
					privPartRef
				);
				break;

			case "limitnocapttag":
				operRef.msgRef.sendMsg(
					channelKey,
					WordCo.cre()
						.text(Catalog.SUBCOMMANDS[subCmd]["readable"])
						.text(" is set to: ")
						.text(catRef.limitNoCaptTag)
						.text("."),
					privPartRef
				);
				break;

			case "avgpickmth":
				operRef.msgRef.sendMsg(
					channelKey,
					WordCo.cre()
						.text(Catalog.SUBCOMMANDS[subCmd]["readable"])
						.text(" is set to: ")
						.text(catRef.avgPickStatsMethod)
						.text("."),
					privPartRef
				);
				break;

			default:
				var wc = WordCo.cre();

				wc.text("Pug: ").text(catRef.flag, true).text(", ");
				wc.text("Is quick: ")
					.text(catRef.isQuick ? "yes" : "no", true)
					.text(", ");
				wc.text("Player limit: ").text(catRef.playerLimit, true).text(", ");
				wc.text("Team count: ").text(catRef.teamCount, true);

				for (var key in Catalog.SUBCOMMANDS) {
					wc.text(", ");
					wc.text(Catalog.SUBCOMMANDS[key]["readable"] + " [" + key + "]: ");

					if (Array.isArray(catRef[Catalog.SUBCOMMANDS[key]["key"]])) {
						wc.text(catRef[Catalog.SUBCOMMANDS[key]["key"]].join(", "), true);
					} else {
						wc.text(catRef[Catalog.SUBCOMMANDS[key]["key"]], true);
					}
				}

				operRef.msgRef.sendMsg(channelKey, wc, privPartRef);
				break;
		}

		if (shouldSaveState) {
			operRef.saveState();
		}
	}
}

export default OpConfigPugGet;
