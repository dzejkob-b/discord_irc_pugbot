import Participant from './participant';
import logger from 'winston';

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

    getUser(nick, callback) {
        if (typeof callback != 'undefined' && callback !== false) {

            this.userQuerySearch(nick, (member) => {

                callback(this.getUser(nick, false), member);

            });

            return null;
        }

        var idx = 0, found = null;

        while (idx < this.list.length) {
            if (this.list[idx].nick.toLowerCase() == nick.toLowerCase()) {
                found = this.list[idx];
                break;

            } else {
                idx++;
            }
        }

        return found;
    }

    getUserId(id, callback) {
        if (typeof callback != 'undefined' && callback !== false) {

            this.userIdSearch(id, (member) => {

                callback(this.getUserId(id, false), member);

            });

            return null;
        }

        var idx = 0, found = null;

        while (idx < this.list.length) {
            if (this.list[idx].id == id) {
                found = this.list[idx];
                break;
                
            } else {
                idx++;
            }
        }

        return found;
    }

    getUserDirect(nick) {
        if (this.botRef.getDiscordStatus() != 0) return false;

        var cPartRef = this.getUser(nick), ref;

        if (cPartRef != null && (ref = this.botRef.discord.users.cache.find(us => { return us.id == cPartRef.id; }))) {
            return ref;
        }

        return null;
    }

    joinUser(struct) {
        if (this.getUserIdx(struct.username) == -1) {

            this.list.push(new Participant({ "author" : struct }));

        }
    }

    userQuerySearch(nick, callback) {
        this.botRef.discord.guilds.cache.array().forEach((gRef) => {
            gRef.members.fetch({ query: nick, limit: 5 }).
            then(members => {

                var inputList = [], member = null;

                members.forEach((uRef) => {
                    var nk = uRef.nickname ? uRef.nickname : uRef.user.username;

                    if (nk == nick) {
                        member = uRef;
                    }

                    inputList.push(uRef);
                });

                this.refreshKnownUsers(inputList);

                callback(member);
            }).
            catch(error => {
                logger.error('User query (`' + nick + '`) search error', error);
            });
        });
    }

    userIdSearch(id, callback) {
        this.botRef.discord.guilds.cache.array().forEach((gRef) => {
            gRef.members.fetch(id).
            then(member => {

                var inputList = [];

                inputList.push(member);

                this.refreshKnownUsers(inputList);

                callback(member);
            }).
            catch(error => {
                logger.error('User id (`' + id + '`) search error', error);
            });
        });
    }

    refreshKnownUsers(inputList) {
        if (this.botRef.getDiscordStatus() != 0) return false;

        var loopList = [];

        if (typeof inputList != 'undefined' && inputList !== false) {
            loopList = inputList;

        } else {
            this.botRef.discord.guilds.cache.array().forEach((gRef) => {
                gRef.members.cache.array().forEach((uRef) => {
                    loopList.push(uRef);
                });
            });
        }

        loopList.forEach((uRef) => {

            var idx, ref = uRef.user;

            if ((idx = this.getUserIdx(ref.id)) == -1) {
                var partRef = new Participant({ "author" : ref });

                partRef.nick = uRef.nickname ? uRef.nickname : ref.username;
                partRef.presence = ref.presence.status;

                this.botRef.operRef.joinEvent(partRef);

                this.list.push(partRef);

            } else {
                var befPres = this.list[idx].presence, befNick = this.list[idx].nick;

                this.list[idx].nick = uRef.nickname ? uRef.nickname : ref.username;

                if (ref.presence.status == 'offline' && this.list[idx].presence != 'offline') {

                    var cTime = (new Date()).getTime() / 1000;

                    if (!this.list[idx].offlineTime) {
                        this.list[idx].offlineTime = cTime;

                    } else if (cTime - this.list[idx].offlineTime > 60) {
                        this.list[idx].presence = ref.presence.status;
                        this.list[idx].offlineTime = false;
                    }

                } else {
                    this.list[idx].presence = ref.presence.status;
                    this.list[idx].offlineTime = false;
                }

                if (befNick != this.list[idx].nick) {
                    // nick change

                    this.botRef.operRef.nickChange(0, this.list[idx].id, this.list[idx].nick);
                }

                if (befPres != this.list[idx].presence && this.list[idx].presence != 'offline') {
                    // is online now

                    this.botRef.operRef.joinEvent(this.list[idx]);

                } else if (befPres != this.list[idx].presence && this.list[idx].presence == 'offline') {
                    // went offline

                    this.botRef.operRef.leaveEvent(false, this.list[idx], "offline");

                }
            }
        });

        // console.log(this.list);
        // !! this.botRef.discord.users.cache.array().forEach((ref) => { });
    }
}

export default DiscordUsers;
