import Participant from "./participant.js";

class IrcUsers {
	constructor(botRef) {
		this.botRef = botRef;
		this.list = [];
	}

	getUserIdx(nick) {
		var idx = 0;

		while (idx < this.list.length) {
			if (this.list[idx].nick.toLowerCase() == nick.toLowerCase()) return idx;
			else idx++;
		}

		return -1;
	}

	getUser(nick, callback) {
		var idx = 0,
			found = null;

		while (idx < this.list.length) {
			if (this.list[idx].nick.toLowerCase() == nick.toLowerCase()) {
				found = this.list[idx];
				break;
			} else {
				idx++;
			}
		}

		if (typeof callback != "undefined" && callback !== false) {
			callback(found);
		} else {
			return found;
		}
	}

	joinUser(channel, nick) {
		let idx, partRef;

		if ((idx = this.getUserIdx(nick)) == -1) {
			partRef = new Participant({ author: nick, channel: channel });
			this.list.push(partRef);
		} else {
			partRef = this.list[idx];
		}

		return partRef;
	}

	joinUserList(channel, nicks) {
		nicks.forEach((n) => {
			this.joinUser(channel, n);
		});
	}

	leaveUser(channel, nick) {
		var idx;

		if ((idx = this.getUserIdx(nick)) == -1) {
			this.list.splice(idx, 1);
		}
	}

	changeUserNick(channel, oldNick, newNick) {
		var idx;

		if ((idx = this.getUserIdx(oldNick)) != -1) {
			this.list[idx].nick = newNick;
		} else {
			this.joinUser(channel, newNick);
		}

		this.botRef.operRef.nickChange(1, oldNick, newNick);
	}

	getWhois(nick, callback) {
		if (!this.botRef.ircClient) return false;

		var idx;

		if ((idx = this.getUserIdx(nick)) != -1) {
			if (this.list[idx].isValidWhois()) {
				callback(this.list[idx].whois);

				return true;
			} else {
				this.botRef.ircClient.whois(this.list[idx].nick, (dt) => {
					this.list[idx].setWhois(dt);
					callback(this.list[idx].whois);
				});

				return true;
			}
		}

		return false;
	}
}

export default IrcUsers;
