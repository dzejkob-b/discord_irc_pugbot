import WordCo from "./word_co.js";
import Game from "./game.js";

class OpList {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			catRef,
			wRef,
			acRef,
			teamRef,
			hist,
			chCats,
			tmList = [],
			useChan,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		if (
			operRef.currentCmd == "listall" ||
			operRef.currentCmd == "liastall" ||
			operRef.currentCmd == "lsall"
		) {
			useChan = false;
		} else {
			useChan = channelKey;
		}

		if (
			(acRef = operRef.getAction(channelKey)) != null &&
			(acRef.logicState == 2 || acRef.logicState == 1)
		) {
			wRef = WordCo.cre();

			if (
				operRef.getAction(channelKey).logicState == 2 &&
				(teamRef = acRef.gameRef.getTeamByTurn()) != null
			) {
				wRef.text("Captain");
				teamRef.addTextFormatted(
					wRef,
					" " + teamRef.captPartRef.nick + " ",
					false,
					true
				);
				wRef.text("now picks: ");
			}

			acRef.gameRef.restCat.loadAvgPick(
				operRef.statsRef,
				false,
				function (aMth) {
					wRef = acRef.gameRef.restCat.addStatusReadableAvgPick(
						aMth,
						wRef,
						true,
						acRef.voteRef,
						channelKey,
						operRef
					);
					tmList.push(wRef);
					operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
				}
			);

			//wRef = acRef.gameRef.restCat.addStatusReadable(wRef, true, acRef.voteRef, channelKey, operRef);
			// tmList.push(wRef);
			// operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
		} else if (cStk.pop() != false) {
			if ((catRef = operRef.getCatRef(false, cStk.last())) == null) {
				partRef.noticeMessage(
					operRef,
					WordCo.cre().text("No such pug ").texth(cStk.last()).text("!")
				);
			} else {
				tmList.push(
					catRef.addStatusReadable(
						WordCo.cre(),
						false,
						acRef.voteRef,
						channelKey,
						operRef
					)
				);
			}

			operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
		} else if (
			(chCats = operRef.getCatsInChannel(useChan)) != false &&
			chCats.length > 1
		) {
			var sf;

			wRef = WordCo.cre();

			for (sf = 0; sf < chCats.length; sf++) {
				if (sf != 0) wRef.newLineSep();
				//chCats[sf].addStatusReadableShort(wRef, channelKey, operRef);
				chCats[sf].addStatusReadable(
					wRef,
					false,
					acRef.voteRef,
					channelKey,
					operRef
				);
			}

			if (operRef.currentCmd == "liast" || operRef.currentCmd == "liastall") {
				operRef.statsRef.getGameStat(
					useChan,
					false,
					null,
					0,
					function (st_rows, pl_rows) {
						if (st_rows && pl_rows) {
							var gRef = Game.fromStatData(st_rows[0], pl_rows);

							tmList.push(gRef.addStatusReadable(WordCo.cre(), true));
						} else {
							tmList.push(WordCo.cre().text("No game history."));
						}

						tmList.push(WordCo.cre());
						tmList.push(wRef);

						operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
					}
				);
			} else {
				if (tmList.length > 0) {
					tmList.push(WordCo.cre());
				}

				tmList.push(wRef);

				operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
			}
		} else if ((catRef = operRef.getCatRef(channelKey, false)) != null) {
			if (operRef.currentCmd == "liast" || operRef.currentCmd == "liastall") {
				operRef.statsRef.getGameStat(
					useChan,
					false,
					null,
					0,
					function (st_rows, pl_rows) {
						if (st_rows && pl_rows) {
							var gRef = Game.fromStatData(st_rows[0], pl_rows);

							tmList.push(gRef.addStatusReadable(WordCo.cre(), true));
						} else {
							tmList.push(WordCo.cre().text("No game history."));
						}

						tmList.push(WordCo.cre());
						tmList.push(
							catRef.addStatusReadable(
								WordCo.cre(),
								false,
								acRef.voteRef,
								channelKey,
								operRef
							)
						);

						operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
					}
				);
			} else {
				if (tmList.length > 0) {
					tmList.push(WordCo.cre());
				}

				tmList.push(
					catRef.addStatusReadable(
						WordCo.cre(),
						false,
						acRef.voteRef,
						channelKey,
						operRef
					)
				);

				operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
			}
		}
	}
}

export default OpList;
