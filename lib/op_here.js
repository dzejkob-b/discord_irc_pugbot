import WordCo from "./word_co.js";

class OpHere {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			acRef,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		operRef.getCatsInChannel(channelKey).forEach((catRef) => {
			if (!catRef.captainIdleInSecs) {
				return;
			}

			if (
				(acRef = operRef.getAction(channelKey)) != null &&
				acRef.logicState == 2
			) {
				const cRef = catRef.getParticipant(partRef);

				if (cRef != null) {
					const teamRef = acRef.gameRef.getTeamByTurn();
					const captPartRef = teamRef.captPartRef;

					if (captPartRef.id != cRef.id) {
						operRef.msgRef.sendMsg(
							channelKey,
							WordCo.cre().text(
								`Don't worry, it isn't your turn. ${captPartRef.nick} has to pick first.`
							),
							privPartRef
						);
						return;
					}

					if (teamRef.requestTimeExtension()) {
						acRef.gameRef.setCaptainIdleTimeout(captPartRef);
						operRef.msgRef.sendMsg(
							channelKey,
							WordCo.cre().text(
								`You have been granted a time extension of ${catRef.captainIdleInSecs} seconds.`
							),
							privPartRef
						);
					} else {
						operRef.msgRef.sendMsg(
							channelKey,
							WordCo.cre().text(`You have already used your time extension.`),
							privPartRef
						);
					}

					cRef.refreshTime();
				}
			} else {
				operRef.msgRef.sendMsg(
					channelKey,
					WordCo.cre().text(
						`Pickup did not start or captain are not yet set or captainidle feature is off.`
					),
					privPartRef
				);
			}
		});
	}
}

export default OpHere;
