import Participant from './participant';

class DiscordUsers {
    constructor(botRef) {

        this.botRef = botRef;
        this.list = [];

    }

    getUserIdx(id) {
        var idx = 0;

        while (idx < this.list.length) {
            if (this.list[idx].id == id) return idx;
            else idx++;
        }

        return -1;
    }

    getUser(nick) {
        var idx = 0;

        while (idx < this.list.length) {
            if (this.list[idx].nick.toLowerCase() == nick.toLowerCase()) {
                return this.list[idx];

            } else {
                idx++;
            }
        }

        return null;
    }

    getUserId(id) {
        var idx = 0;

        while (idx < this.list.length) {
            if (this.list[idx].id == id) {
                return this.list[idx];
                
            } else {
                idx++;
            }
        }

        return null;
    }

    getUserDirect(nick) {
        var cPartRef = this.getUser(nick), ref;

        if (cPartRef != null && (ref = this.botRef.discord.users.get(cPartRef.id))) {
            return ref;
        }

        return null;
    }

    joinUser(struct) {
        if (this.getUserIdx(struct.username) == -1) {

            this.list.push(new Participant({ "author" : struct }));

        }
    }

    getDiscordUserNick(disUserRef) {
        let nickname = false;

        this.botRef.discord.guilds.forEach((gRef) => {

            const userDetails = gRef.members.get(disUserRef.id);

            if (userDetails && userDetails.nickname) {
                nickname = userDetails.nickname;
            }
        });

        return nickname ? nickname : disUserRef.username;
    }

    refreshKnownUsers() {
        this.botRef.discord.users.array().forEach((ref) => {

            var idx;

            if ((idx = this.getUserIdx(ref.id)) == -1) {
                var partRef = new Participant({ "author" : ref });

                partRef.nick = this.getDiscordUserNick(ref);
                partRef.presence = ref.presence.status;

                this.list.push(partRef);

            } else {
                var befPres = this.list[idx].presence, befNick = this.list[idx].nick;

                this.list[idx].nick = this.getDiscordUserNick(ref);
                this.list[idx].presence = ref.presence.status;
                
                if (befNick != this.list[idx].nick) {
                    // nick change
                    
                    this.botRef.operRef.nickChange(0, this.list[idx].id, this.list[idx].nick);
                }

                if (befPres != ref.presence.status && ref.presence.status != 'offline') {
                    // is online now

                } else if (befPres != ref.presence.status && ref.presence.status == 'offline') {
                    // went offline

                    this.botRef.operRef.leaveEvent(this.list[idx], "offline");

                }
            }

        });
    }
}

export default DiscordUsers;
