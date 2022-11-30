import WordCo from "./word_co.js";

class OpDiscord {
	constructor(parent) {
		this.parent = parent;
	}

	exec(channelKey) {
		let operRef = this.parent,
			wRef,
			isStart,
			cStk = this.parent.cStk,
			partRef = this.parent.partRef,
			privPartRef = this.parent.privPartRef;

		if (!operRef.botRef.discord || operRef.currentCmd == "discord_auth") {
			var authLink =
				"https://discordapp.com/oauth2/authorize?client_id=" +
				(operRef.botRef.discordClientId
					? operRef.botRef.discordClientId
					: "[YOUR_CLIENT_ID]") +
				"&scope=bot";

			wRef = WordCo.cre();

			wRef.text("Use this link to connect bot to discord channel: ");
			wRef.text(authLink);

			operRef.msgRef.sendMsg(channelKey, wRef, privPartRef);
		} else {
			let activeUsers = [],
				filterFlag = cStk.pop();

			wRef = WordCo.cre();

			if (filterFlag != "all") {
				operRef.botRef.channelDisUsers.list.forEach((c) => {
					if (c.presence == "online" || c.presence == "idle") {
						activeUsers.push(c);
					}
				});
			}

			if (activeUsers.length == 0) {
				wRef.text("No active users on discord.");
			} else {
				wRef
					.text("Listing active users. Use ")
					.texth("!mention user [msg]")
					.text(" for higlight: ");

				isStart = true;

				activeUsers.forEach((c) => {
					if (isStart) {
						isStart = false;
					} else {
						wRef.text(", ");
					}

					wRef.text(c.nick);
					wRef.texth("[" + c.presence + "]");
				});
			}

			operRef.msgRef.sendMsg(channelKey, wRef, privPartRef);
		}
	}
}

export default OpDiscord;
