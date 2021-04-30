import discord from "discord.js";
import WordCo from "./word_co";
import { formatFromDiscordToIRC, formatFromIRCToDiscord } from "./formatting";

class Participant {
	constructor(struct) {
		if (typeof struct == "undefined") {
			// unset

			this.type = false;
			this.id = false;
			this.nick = false;
			this.channel = false;
			this.tag = false;
			this.presence = false;
		} else if (struct.author && struct.author.id) {
			// discord user

			this.type = 0;
			this.id = struct.author.id;
			this.nick = struct.author.username;
			this.channel = false;
			this.tag = false;
			this.presence = false; // online|offline|idle|dnd
		} else if (struct.channel) {
			// irc user

			this.type = 1;
			this.id = struct.author.trim().toLowerCase();
			this.nick = struct.author;
			this.channel = struct.channel.trim().toLowerCase();
			this.tag = false;
			this.presence = false;
		} else if (struct.nick) {
			// irc nick (pm)

			this.type = 1;
			this.id = struct.nick.trim().toLowerCase();
			this.nick = struct.nick;
			this.channel = false;
			this.tag = false;
			this.presence = false;
		} else {
			// other

			this.type = 2;
			this.id = "unknown_" + struct.author.trim().toLowerCase();
			this.nick = struct.author;
			this.channel = false;
			this.tag = false;
			this.presence = false;
		}

		this.time = new Date().getTime() / 1000;
		this.forceIndex = false;
		this.whois = false;
		this.whoisTime = false;
		this.offlineTime = false;

		this.authLevel = 0;
		this.pickIndex = false;

		this.tPugs = false;
		this.avgPick = false;
		this.avgTotPick = false;
	}

	toJSON() {
		var result = {
			type: this.type,
			id: this.id,
			nick: this.nick,
			channel: this.channel,
			tag: this.tag,
			forceIndex: this.forceIndex,
			whois: this.whois,
			whoisTime: this.whoisTime,
			offlineTime: this.offlineTime,
			authLevel: this.authLevel,
			avgPick: this.avgPick,
			avgTotPick: this.avgTotPick,
		};

		return result;
	}

	static fromJSON(input) {
		var ref = new Participant();

		[
			"type",
			"id",
			"nick",
			"channel",
			"tag",
			"forceIndex",
			"whois",
			"whoisTime",
			"offlineTime",
			"authLevel",
			"avgPick",
			"avgTotPick",
		].forEach((c) => {
			if (typeof input[c] != "undefined") {
				ref[c] = input[c];
			}
		});

		return ref;
	}

	static fromStatData(row) {
		var ref = new Participant();

		ref.type = 2;
		ref.nick = row["nick"];
		ref.tag = row["tag"];

		if (!ref.nick) {
			ref.nick = "unknown";
		}

		if (row["discordId"]) {
			ref.type = 0;
			ref.id = row["discordId"];
		} else if (row["ircAuth"]) {
			ref.type = 1;
			ref.id = row["nick"];
			ref.whois = {
				account: row["ircAuth"],
			};
		}

		return ref;
	}

	getClone() {
		var partRef = new Participant();

		partRef.type = this.type;
		partRef.id = this.id;
		partRef.nick = this.nick;
		partRef.channel = this.channel;
		partRef.tag = this.tag;
		partRef.presence = this.presence;
		partRef.forceIndex = this.forceIndex;
		partRef.whois = this.whois;
		partRef.whoisTime = this.whoisTime;
		partRef.offlineTime = this.offlineTime;
		partRef.authLevel = this.authLevel;
		partRef.avgPick = this.avgPick;
		partRef.avgTotPick = this.avgTotPick;

		return partRef;
	}

	readableInfo() {
		if (this.type == 0) {
			return (
				"discord user: " +
				this.nick +
				" (#" +
				this.id +
				"), presence: " +
				this.presence +
				", authLevel: " +
				this.authLevel
			);
		} else if (this.type == 1) {
			return (
				"irc user: " +
				this.nick +
				" (channel: " +
				this.channel +
				"), account: " +
				(this.whois && this.whois["account"] ? this.whois["account"] : "n/a") +
				", authLevel: " +
				this.authLevel
			);
		} else {
			return "unknown user: " + this.nick;
		}
	}

	readableInfo_b() {
		if (this.type == 0) {
			return "discord:" + this.nick + " (#" + this.id + ")";
		} else if (this.type == 1) {
			return "irc:" + this.nick + " (" + this.getAuthKey() + ")";
		} else {
			return "unknown:" + this.nick;
		}
	}

	setTag(input) {
		if (input) {
			this.tag = input;

			if (this.tag.length > 15) {
				this.tag = this.tag.substr(this.tag, 15);
			}
		} else {
			this.tag = false;
		}
	}

	refreshTime() {
		this.time = new Date().getTime() / 1000;
	}

	nickChange(type, oldNick, newNick) {
		if (type == 1 && this.type == type && oldNick == this.nick) {
			// irc change

			this.nick = newNick;
			this.id = newNick.trim().toLowerCase();
		} else if (type == 0 && this.id == oldNick) {
			// discord change

			this.nick = newNick;
		}
	}

	compareEqual(partRef) {
		if (this.type == 0) {
			// discord
			return this.type == partRef.type && this.id == partRef.id;
		} else if (this.type == 1) {
			// irc

			if (
				this.whois &&
				this.whois["account"] &&
				partRef.whois &&
				partRef.whois["account"]
			) {
				return (
					this.type == partRef.type &&
					this.whois["account"] == partRef.whois["account"]
				);
			} else {
				return (
					this.type == partRef.type &&
					this.id == partRef.id &&
					this.channel == partRef.channel
				);
			}
		} else if (this.type == 2) {
			// other
			return this.type == partRef.type && this.id == partRef.id;
		} else {
			return false;
		}
	}

	isInArray(tArray) {
		var idx = 0;

		while (idx < tArray.length) {
			if (this.compareEqual(tArray[idx])) return true;
			else idx++;
		}

		return false;
	}

	setWhois(whois) {
		this.whois = whois;
		this.whoisTime = new Date().getTime() / 1000;
	}

	isValidWhois() {
		var cTime = new Date().getTime() / 1000;

		return this.whois && cTime - this.whoisTime < 1800;
	}

	isNocapt() {
		return this.tag == "nocapt";
	}

	getAuthKey() {
		if (this.type == 0) {
			// discord check id
			return this.id;
		} else if (this.type == 1 && this.whois && this.whois["account"]) {
			// irc check whois
			return this.whois["account"];
		} else if (this.type == 1 && this.whois && this.whois["host"]) {
			// by host
			return this.whois["host"];
		}

		return false;
	}

	getAuthKeyRelevant() {
		if (this.type == 0) {
			// discord check id
			return this.id;
		} else if (this.type == 1 && this.whois && this.whois["account"]) {
			// irc check whois (only authed info)
			return this.whois["account"];
		}

		return false;
	}

	getDiscordId() {
		return this.type == 0 ? this.id : false;
	}

	mapAuth(operRef) {
		this.authLevel = 0;

		if (
			this.getAuthKey() != false &&
			typeof operRef.authUsers[this.getAuthKey()] != "undefined"
		) {
			this.authLevel = parseInt(operRef.authUsers[this.getAuthKey()]);
		}

		if (isNaN(this.authLevel)) {
			this.authLevel = 0;
		}
	}

	isOnline() {
		if (this.type == 0) {
			return this.presence != "offline";
		} else if (this.type == 1) {
			return true;
		} else {
			return false;
		}
	}

	getCompleted(operRef, callback, force) {
		if (this.type == 0) {
			// discord

			this.mapAuth(operRef);

			callback(this);
		} else if (this.type == 1) {
			// irc

			if (this.isValidWhois() && !force) {
				this.mapAuth(operRef);

				callback(this);
			} else {
				// query whois and auth

				operRef.botRef.channelIrcUsers.getWhois(this.nick, (dt) => {
					this.setWhois(dt);
					this.mapAuth(operRef);

					callback(this);
				});
			}
		} else if (this.type == 2) {
			// other

			this.mapAuth(operRef);

			callback(this);
		}
	}

	personalMessage(operRef, input, floodSafe) {
		if (typeof input != "object") {
			input = WordCo.cre().text(input);
		}

		if (this.type == 0) {
			// discord

			operRef.botRef.channelDisUsers.getUser(this.nick, (dPartRef, member) => {
				if (member) {
					const msgStr = new discord.MessageEmbed();

					if (typeof input == "object") {
						msgStr.setDescription(input.getDiscord());
					} else {
						msgStr.setDescription(formatFromIRCToDiscord(input));
					}

					msgStr.setColor([255, 0, 0]);

					member.send(msgStr);
				}
			});

			/*
            var dPartRef = operRef.botRef.channelDisUsers.getUserDirect(this.nick);

            if (dPartRef != null) {
                const msgStr = new discord.MessageEmbed();

                if (typeof input == 'object') {
                    msgStr.setDescription(input.getDiscord());
                } else {
                    msgStr.setDescription(formatFromIRCToDiscord(input));
                }

                msgStr.setColor([255, 0, 0]);

                dPartRef.send(msgStr);
            }
            */
		} else if (this.type == 1) {
			// irc

			if (!operRef.botRef.ircClient) {
				// nothing ...
			} else if (floodSafe) {
				// skip message ...
			} else if (typeof input == "object") {
				operRef.botRef.ircClient.send("PRIVMSG", this.nick, input.getIrc());
			} else {
				operRef.botRef.ircClient.send("PRIVMSG", this.nick, input);
			}
		}
	}

	noticeMessage(operRef, input) {
		if (typeof input != "object") {
			input = WordCo.cre().text(input);
		}

		if (this.type == 0) {
			// discord

			operRef.botRef.channelDisUsers.getUserId(this.id, (dPartRef, member) => {
				if (member) {
					const msgStr = new discord.MessageEmbed();

					if (typeof input == "object") {
						msgStr.setDescription(input.getDiscord());
					} else {
						msgStr.setDescription(formatFromIRCToDiscord(input));
					}

					member.user.send(msgStr);
				}
			});

			/*
            var dPartRef = operRef.botRef.channelDisUsers.getUserDirect(this.nick);

            if (dPartRef != null) {
                const msgStr = new discord.MessageEmbed();

                if (typeof input == 'object') {
                    msgStr.setDescription(input.getDiscord());
                } else {
                    msgStr.setDescription(formatFromIRCToDiscord(input));
                }

                dPartRef.send(msgStr);
            }
            */
		} else if (this.type == 1) {
			// irc

			if (!operRef.botRef.ircClient) {
				// nothing ...
			} else if (typeof input == "object") {
				if (!input.isBlank()) {
					operRef.botRef.ircClient.send("NOTICE", this.nick, input.getIrc());
				}
			} else {
				operRef.botRef.ircClient.send("NOTICE", this.nick, input);
			}
		}
	}

	getPartMessage(catRef, reason) {
		if (reason == "part") {
			return WordCo.cre()
				.text("Player ")
				.texth(this.nick)
				.text(" left the ")
				.texth(catRef.flag)
				.text(" pug, because of channel leave.");
		} else if (reason == "kick") {
			return WordCo.cre()
				.text("Player ")
				.texth(this.nick)
				.text(" left the ")
				.texth(catRef.flag)
				.text(" pug, because got kicked.");
		} else if (reason == "quit") {
			return WordCo.cre()
				.text("Player ")
				.texth(this.nick)
				.text(" left the ")
				.texth(catRef.flag)
				.text(" pug, because client quit.");
		} else if (reason == "offline") {
			return WordCo.cre()
				.text("Player ")
				.texth(this.nick)
				.text(" left the ")
				.texth(catRef.flag)
				.text(" pug, because went offline.");
		} else {
			return WordCo.cre()
				.text("Player ")
				.texth(this.nick)
				.text(" left the ")
				.texth(catRef.flag)
				.text(" pug.");
		}
	}

	matchStatsRow(row) {
		if (this.type == 0 && this.id == row["discordId"]) {
			return true;
		} else if (
			this.type == 1 &&
			this.whois &&
			this.whois["account"] == row["ircAuth"]
		) {
			return true;
		} else if (this.nick == row["nick"]) {
			return true;
		} else {
			return false;
		}
	}

	unsetAvgPick() {
		if (this.avgPick) {
			this.avgPick = false;
		}

		if (this.avgTotPick) {
			this.avgTotPick = false;
		}
	}
}

export default Participant;
