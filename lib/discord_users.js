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

        this.refreshKnownUsers();

        while (idx < this.list.length) {
            if (this.list[idx].nick.toLowerCase() == nick.toLowerCase()) return this.list[idx];
            else idx++;
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

    refreshKnownUsers() {
        this.botRef.discord.users.array().forEach((ref) => {

            var idx;

            if ((idx = this.getUserIdx(ref.id)) == -1) {
                var partRef = new Participant({ "author" : ref });

                partRef.presence = ref.presence.status;

                this.list.push(partRef);

            } else {
                var befPres = this.list[idx].presence;

                this.list[idx].nick = ref.username;
                this.list[idx].presence = ref.presence.status;

                if (befPres != ref.presence.status && ref.presence.status != 'offline') {
                    // is online now

                } else if (befPres != ref.presence.status && ref.presence.status == 'offline') {
                    // went offline

                    this.botRef.operRef.leaveEvent(this.list[idx]);

                }
            }

        });
    }
}

export default DiscordUsers;
