import WordCo from "./word_co";
import { OPEN_PRIVATECACHE } from "sqlite3";

class OpPick {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			acRef = operRef.getAction(channelKey),
			catRef,
			result,
			tmList = [],
			tt,
			teamRef,
			wRef,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		if (
			acRef.logicState == 0 &&
			(cStk.last() == "p" ||
				cStk.last() == "pall" ||
				cStk.last() == "promote" ||
				cStk.last() == "promoteall")
		) {
			var isAll = cStk.last() == "pall" || cStk.last() == "promoteall";

			if (
				(catRef = operRef.getCatRef(false, cStk.popMod(false), channelKey)) ==
				null
			) {
				partRef.noticeMessage(
					operRef,
					WordCo.cre().text("No such pug ").texth(cStk.last()).text("!")
				);
			} else if (!catRef.isFull()) {
				if (!catRef.canPromote()) {
					return;
				}

				operRef.botRef
					.getChannelKeysFilter(isAll ? false : channelKey)
					.forEach((cChannelKey) => {
						operRef.msgRef.sendMsg(channelKey, "@here", null, true);

						var wo = WordCo.cre();
						wo.text("Only ")
							.texth(catRef.playerLimit - catRef.list.length, true)
							.text(" needed for the ")
							.texth(catRef.flag)
							.text(" pug!");
						wo.text(" Type ")
							.texth(".j " + catRef.flag)
							.text(" to join.");

						if (
							catRef.channelKey != cChannelKey &&
							(tt = operRef.botRef.channels[catRef.channelKey]) &&
							tt["channelDiscord"]
						) {
							wo.channelLink(tt, " (", ")");
						}

						operRef.msgRef.sendMsg(cChannelKey, wo);
					});
				catRef.setPromote();
				operRef.saveState();
			}
		} else if (acRef.logicState == 2) {
			while ((tt = cStk.pop()) != false) {
				result = acRef.gameRef.doPickPlayer(partRef, tt);

				if (result == -2) {
					partRef.noticeMessage(
						operRef,
						WordCo.cre().text("Player ").texth(tt).text(" not found!")
					);
					break;
				} else if (result == -1) {
					partRef.noticeMessage(
						operRef,
						WordCo.cre()
							.text(`It is `)
							.texth(acRef.gameRef.getTeamByTurn().captPartRef.nick)
							.text("'s turn to pick.")
					);
					break;
				} else if (result == -3) {
				} else if (result >= 0) {
					operRef.msgRef.sendMsg(
						channelKey,
						WordCo.cre()
							.text("Captain ")
							.texth(partRef.nick)
							.text(" picked player ")
							.texth(acRef.gameRef.lastPickPartRef.nick)
							.text("."),
						privPartRef
					);

					if (result == 1) {
						// pick turn

						acRef.gameRef.teams.forEach((teamRef) => {
							tmList.push(teamRef.addStatusReadable(WordCo.cre()));
						});

						teamRef = acRef.gameRef.getTeamByTurn();

						// msg to all
						tmList.push(WordCo.cre());

						wRef = WordCo.cre();
						wRef.text("Captain");
						teamRef.addTextFormatted(
							wRef,
							" " + teamRef.captPartRef.nick + " ",
							false,
							true
						);
						wRef.text("now picks: ");

						acRef.gameRef.restCat.loadAvgPick(
							operRef.statsRef,
							false,
							function (aMth) {
								tmList.push(
									acRef.gameRef.restCat.addStatusReadableAvgPick(
										aMth,
										wRef,
										true,
										acRef.voteRef,
										channelKey,
										operRef
									)
								);
								operRef.msgRef.sendMsgArrayPrep(
									channelKey,
									tmList,
									privPartRef
								);
							}
						);

						//wRef = acRef.gameRef.restCat.addStatusReadable(wRef, true, acRef.voteRef, channelKey, operRef);
						break;
					} else if (result == 2) {
						// picking finished

						var finList = acRef.pickingHasFinished();

						if (finList.length > 0 && tmList.length > 0) {
							tmList.push(WordCo.cre());
						}

						finList.forEach((c) => {
							tmList.push(c);
						});

						operRef.msgRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
						break;
					}
				}
			} // while
		}
	}
}

export default OpPick;
