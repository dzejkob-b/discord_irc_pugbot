import Participant from './participant'

class DiscordUsers {
    constructor(botRef) {
        this.botRef = botRef
        this.list = []
    }

    getUserIdx(id) {
        var idx = 0

        while (idx < this.list.length) {
            if (this.list[idx].id == id) return idx
            else idx++
        }

        return -1
    }

    getUser(nick) {
        var idx = 0

        while (idx < this.list.length) {
            if (this.list[idx].nick.toLowerCase() == nick.toLowerCase()) {
                return this.list[idx]
            } else {
                idx++
            }
        }

        return null
    }

    getUserId(id) {
        var idx = 0

        while (idx < this.list.length) {
            if (this.list[idx].id == id) {
                return this.list[idx]
            } else {
                idx++
            }
        }

        return null
    }

    getUserDirect(nick) {
        if (!this.botRef.discord) return null

        var cPartRef = this.getUser(nick),
            ref

        if (
            cPartRef != null &&
            (ref = this.botRef.discord.users.get(cPartRef.id))
        ) {
            return ref
        }

        return null
    }

    joinUser(struct) {
        if (this.getUserIdx(struct.username) == -1) {
            this.list.push(new Participant({ author: struct }))
        }
    }

    getDiscordUserNick(disUserRef) {
        if (!this.botRef.discord) return null

        let nickname = false

        this.botRef.discord.guilds.forEach((gRef) => {
            const userDetails = gRef.members.get(disUserRef.id)

            if (userDetails && userDetails.nickname) {
                nickname = userDetails.nickname
            }
        })

        return nickname ? nickname : disUserRef.username
    }

    refreshKnownUsers() {
        if (!this.botRef.discord) return false

        this.botRef.discord.users.array().forEach((ref) => {
            var idx

            if ((idx = this.getUserIdx(ref.id)) == -1) {
                var partRef = new Participant({ author: ref })

                partRef.nick = this.getDiscordUserNick(ref)
                partRef.presence = ref.presence.status

                this.botRef.operRef.joinEvent(partRef)

                this.list.push(partRef)
            } else {
                var befPres = this.list[idx].presence,
                    befNick = this.list[idx].nick

                this.list[idx].nick = this.getDiscordUserNick(ref)

                if (
                    ref.presence.status == 'offline' &&
                    this.list[idx].presence != 'offline'
                ) {
                    var cTime = new Date().getTime() / 1000

                    if (!this.list[idx].offlineTime) {
                        this.list[idx].offlineTime = cTime
                    } else if (cTime - this.list[idx].offlineTime > 60) {
                        this.list[idx].presence = ref.presence.status
                        this.list[idx].offlineTime = false
                    }
                } else {
                    this.list[idx].presence = ref.presence.status
                    this.list[idx].offlineTime = false
                }

                if (befNick != this.list[idx].nick) {
                    // nick change

                    this.botRef.operRef.nickChange(
                        0,
                        this.list[idx].id,
                        this.list[idx].nick
                    )
                }

                if (
                    befPres != this.list[idx].presence &&
                    this.list[idx].presence != 'offline'
                ) {
                    // is online now

                    this.botRef.operRef.joinEvent(this.list[idx])
                } else if (
                    befPres != this.list[idx].presence &&
                    this.list[idx].presence == 'offline'
                ) {
                    // went offline

                    this.botRef.operRef.leaveEvent(
                        false,
                        this.list[idx],
                        'offline'
                    )
                }
            }
        })
    }
}

export default DiscordUsers
