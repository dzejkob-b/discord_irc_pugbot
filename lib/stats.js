import WordCo from './word_co';
import SumStats from './sum_stats';
import {secsAgoFormat} from './helpers';
import logger from 'winston';
import TimeUtils from './utils/time';

class Stats {
    constructor(operRef) {
        
        this.operRef = operRef;
        this.sumRef = new SumStats(this);
        this.dbName = 'stats.db';
        this.sqlite3 = require('sqlite3').verbose();

    }

    getDb() {
        return new this.sqlite3.Database(this.dbName);
    }

    createStructure() {
        var db = this.getDb();
        
        db.serialize(() => {

            db.run("CREATE TABLE IF NOT EXISTS player (botIdent TEXT, nick TEXT, ircAuth TEXT, discordId TEXT, bans INTEGER)");

            db.run("CREATE TABLE IF NOT EXISTS stat (flag TEXT, captained INTEGER, starttime INTEGER, totalpugs INTEGER, last INTEGER, picks INTEGER, totalpicks INTEGER)");

            db.run("CREATE TABLE IF NOT EXISTS player_stat (player_id INTEGER, stat_id INTEGER)");
            
            db.run("CREATE TABLE IF NOT EXISTS ext_stat (channelKey TEXT, flag TEXT, isQuick INTEGER, starttime INTEGER)");

            db.run("CREATE TABLE IF NOT EXISTS ext_player_stat (player_id INTEGER, ext_stat_id INTEGER, tag TEXT, pickIndex INTEGER, isCaptain INTEGER, votes INTEGER, teamIndex INTEGER, teamName TEXT)");

            try {
                db.run("ALTER TABLE stat ADD COLUMN channelKey TEXT", function(err, row) {
                    return false;
                });

            } catch (err) {
                // ignore ...
            }

        });

        db.close();
    }

    flushStats(callback) {
        var db = this.getDb();

        db.serialize(() => {

            db.run("DELETE FROM player_stat");

            db.run("DELETE FROM stat");

            db.run("DELETE FROM player");
            
            db.run("DELETE FROM ext_stat");
            
            db.run("DELETE FROM ext_player_stat");

        });

        db.close(() => {
            callback(callback);
        });
    }

    saveGameToStats(gameRef, voteRef) {
        var parts = [], partsTotalPicks = 0, teamIndex = 0;

        gameRef.teams.forEach((teamRef) => {

            if (teamRef.captPartRef != null) {
                parts.push({
                    "partRef" : teamRef.captPartRef,
                    "teamRef" : teamRef,
                    "teamIndex" : teamIndex,
                    "captain" : true,
                    "pickIndex" : teamRef.captPartRef.pickIndex
                });
            }

            var sf;

            for (sf = 1; sf < teamRef.catRef.list.length; sf++) {
                parts.push({
                    "partRef" : teamRef.catRef.list[sf],
                    "teamRef" : teamRef,
                    "teamIndex" : teamIndex,
                    "captain" : false,
                    "pickIndex" : teamRef.catRef.list[sf].pickIndex
                });

                partsTotalPicks++;
            }

            teamIndex++;

        });

        gameRef.restCat.list.forEach((partRef) => {
            parts.push({
                "partRef" : partRef,
                "teamRef" : null,
                "teamIndex" : -1,
                "captain" : false,
                "pickIndex" : partRef.pickIndex
            });

            partsTotalPicks++;
        });

        var db = this.getDb();

        db.serialize(() => {

            var idx = 0;

            while (idx < parts.length) {

                var dt = {}, sql = "", pConds = [], c = parts[idx];

                if (c["partRef"].type == 0) {
                    pConds.push("p.discordId = $discordId");

                    dt["$discordId"] = c["partRef"].id;

                } else if (c["partRef"].whois && c["partRef"].whois["account"]) {
                    pConds.push("p.ircAuth = $ircAuth");
                    pConds.push("((p.ircAuth IS NULL OR LENGTH(p.ircAuth) = 0) AND p.nick = $ircAuth)");

                    dt["$ircAuth"] = c["partRef"].whois["account"];
                }

                pConds.push("p.nick LIKE $nick");

                dt["$nick"] = c["partRef"].nick;
                dt["$botIdent"] = this.operRef.ident;
                dt["$channelKey"] = gameRef.channelKey;
                dt["$flag"] = gameRef.restCat.flag;

                sql += "SELECT p.rowid AS 'player_id', st.rowid AS 'stat_id' FROM player p ";
                sql += "LEFT JOIN player_stat ps ON ps.player_id = p.rowid ";
                sql += "LEFT JOIN stat st ON st.rowid = ps.stat_id AND st.flag = $flag AND st.channelKey = $channelKey ";
                sql += "WHERE (" + pConds.join(' OR ') + ") AND p.botIdent = $botIdent ";
                sql += "ORDER BY p.discordId DESC, p.ircAuth DESC, p.rowid ASC, st.last DESC, st.rowid ASC";

                db.get(sql, dt, (function(tIdx) { return function(err, row) {

                    if (row) {
                        parts[tIdx]["player_id"] = row["player_id"];
                        parts[tIdx]["stat_id"] = row["stat_id"];
                    }

                }}(idx)));

                idx++;
            }

        });

        db.close(() => {

            var db = this.getDb();

            db.serialize(() => {

                var idx = 0;

                while (idx < parts.length) {

                    var dt, sql = "", c = parts[idx];

                    if (c["player_id"]) {
                        // players allready exists ...

                        if (c["partRef"].type == 0) {
                            db.run("UPDATE player SET discordId = $discordId, nick = $nick WHERE rowid = $player_id", dt = {

                                $discordId : c["partRef"].id,
                                $nick : c["partRef"].nick,
                                $player_id : c["player_id"]

                            });

                        } else if (c["partRef"].whois && c["partRef"].whois["account"]) {
                            db.run("UPDATE player SET ircAuth = $ircAuth WHERE rowid = $player_id", dt = {

                                $ircAuth : c["partRef"].whois["account"],
                                $player_id : c["player_id"]

                            });
                        }

                    } else {
                        switch (c["partRef"].type) {
                            case 0 :
                                db.run("INSERT INTO player (botIdent, nick, discordId, bans) VALUES ($botIdent, $name, $discordId, $bans)", {

                                    $botIdent : this.operRef.ident,
                                    $name : c["partRef"].nick,
                                    $discordId : c["partRef"].id,
                                    $bans : 0

                                }, (function(tIdx) { return function(err) {

                                    parts[tIdx]["player_id"] = this.lastID;

                                }})(idx));
                                break;

                            default :
                                if (c["partRef"].whois && c["partRef"].whois["account"]) {

                                    db.run("INSERT INTO player (botIdent, nick, ircAuth, bans) VALUES ($botIdent, $name, $ircAuth, $bans)", {

                                        $botIdent : this.operRef.ident,
                                        $name : c["partRef"].nick,
                                        $ircAuth : c["partRef"].whois["account"],
                                        $bans : 0

                                    }, (function(tIdx) { return function(err) {

                                        parts[tIdx]["player_id"] = this.lastID;

                                    }})(idx));

                                } else {

                                    db.run("INSERT INTO player (botIdent, nick, bans) VALUES ($botIdent, $name, $bans)", {

                                        $botIdent : this.operRef.ident,
                                        $name : c["partRef"].nick,
                                        $bans : 0

                                    }, (function(tIdx) { return function(err) {

                                        parts[tIdx]["player_id"] = this.lastID;

                                    }})(idx));

                                }
                                break;
                        }
                    }

                    idx++;

                } // while

            });

            db.close(() => {

                var db = this.getDb();

                db.serialize(() => {

                    var idx = 0;

                    while (idx < parts.length) {

                        if (parts[idx]['stat_id']) {
                            db.run("UPDATE stat SET captained = captained + $captained, totalpugs = totalpugs + $totalpugs, last = $last, picks = picks + $picks, totalpicks = totalpicks + $totalpicks WHERE rowid = $stat_id", {

                                $stat_id : parts[idx]['stat_id'],
                                $captained : parts[idx]["captain"] ? 1 : 0,
                                $totalpugs : 1,
                                $last : ((new Date()).getTime() / 1000),
                                $picks : parts[idx]["captain"] ? 0 : (parts[idx]['pickIndex'] + 1),
                                $totalpicks : parts[idx]["captain"] ? 0 :partsTotalPicks

                            });

                        } else {
                            db.run("INSERT INTO stat (channelKey, flag, captained, starttime, totalpugs, last, picks, totalpicks) VALUES ($channelKey, $flag, $captained, $starttime, $totalpugs, $last, $picks, $totalpicks)", {

                                $channelKey : gameRef.channelKey,
                                $flag : gameRef.restCat.flag,
                                $captained : parts[idx]["captain"] ? 1 : 0,
                                $starttime : ((new Date()).getTime() / 1000),
                                $totalpugs : 1,
                                $last : ((new Date()).getTime() / 1000),
                                $picks : parts[idx]["captain"] ? 0 : (parts[idx]['pickIndex'] + 1),
                                $totalpicks : parts[idx]["captain"] ? 0 : partsTotalPicks

                            }, (function(tIdx) { return function(err, row) {

                                parts[tIdx]["stat_id"] = this.lastID;
                                parts[tIdx]["stat_create_rel"] = true;

                            }}(idx)));
                        }

                        idx++;

                    }

                });

                db.close(() => {

                    var db = this.getDb();

                    db.serialize(() => {

                        var idx = 0;

                        while (idx < parts.length) {

                            if (parts[idx]["stat_create_rel"]) {

                                db.run("INSERT INTO player_stat (player_id, stat_id) VALUES ($player_id, $stat_id)", {

                                    $player_id : parts[idx]["player_id"],
                                    $stat_id : parts[idx]["stat_id"]

                                });

                            }

                            idx++;

                        } // while

                    });

                    db.close(() => {

                        // ext stats

                        var ext_statID = false;

                        db = this.getDb();

                        db.serialize(() => {

                            db.run("BEGIN TRANSACTION");

                            db.run("INSERT INTO ext_stat (channelKey, flag, isQuick, starttime) VALUES ($channelKey, $flag, $isQuick, $starttime)", {

                                $channelKey : gameRef.channelKey,
                                $flag : gameRef.restCat.flag,
                                $isQuick : gameRef.restCat.isQuick ? 1 : 0,
                                $starttime : ((new Date()).getTime() / 1000)

                            }, function(err, row) {

                                ext_statID = this.lastID;

                                var idx = 0;

                                while (idx < parts.length) {
                                    db.run("INSERT INTO ext_player_stat (player_id, ext_stat_id, tag, pickIndex, isCaptain, votes, teamIndex, teamName) VALUES ($player_id, $ext_stat_id, $tag, $pickIndex, $isCaptain, $votes, $teamIndex, $teamName)", {

                                        $player_id : parts[idx]["player_id"],
                                        $ext_stat_id : ext_statID,
                                        $tag : parts[idx]["partRef"].tag,
                                        $pickIndex : parts[idx]["pickIndex"],
                                        $isCaptain : parts[idx]["captain"] ? 1 : 0,
                                        $votes : voteRef != null ? voteRef.getTotalVotes(parts[idx]["partRef"]) : 0,
                                        $teamIndex : parts[idx]["teamIndex"],
                                        $teamName : parts[idx]["teamRef"] == null ? "" : parts[idx]["teamRef"].colorName

                                    });

                                    idx++;
                                }

                            });

                            db.run("END", () => {

                                db.close();

                            });

                        });

                    });

                });

            });

        });
    }

    addUserBan(partRef, callback) {

        this.sumRef.addUserBan(partRef, function() {
            
            if (callback) {
                callback();
            }

        });
    }

    parseAvgStatMethod(method) {
        var tt;

        method = method.toLowerCase();

        if (method == 'sumarize') {
            return {
                'type' : 'sumarize',
                'value' : 0
            }

        } else if (method.substr(0, 9) == 'pastpicks') {

            tt = parseInt(method.substr(9));

            if (!isNaN(tt) && tt > 0) {
                return {
                    'type' : 'pastpicks',
                    'value' : tt
                }
            }

        } else if (method.substr(0, 8) == 'pastdays') {

            tt = parseInt(method.substr(8));

            if (!isNaN(tt) && tt > 0) {
                return {
                    'type' : 'pastdays',
                    'value' : tt
                }
            }
        }

        return false;
    }

    getStatsMultiple(method, flag, partsList, callback) {
        if (method['type'] == 'sumarize') {

            this.sumRef.getStatsMultiple(flag, partsList, callback);

        } else {
            var db = this.getDb();

            db.serialize(() => {
                var dt = {}, sql = "", pConds = [], pIdx = 0;

                dt["$botIdent"] = this.operRef.ident;
                dt["$flag"] = flag;

                partsList.forEach((partRef) => {

                    if (partRef.type == 0) {
                        pConds.push("p.discordId = $discordId" + pIdx + "n");

                        dt["$discordId" + pIdx + "n"] = partRef.id;

                    } else if (partRef.whois && partRef.whois["account"]) {
                        pConds.push("( p.ircAuth = $ircAuth" + pIdx + "n OR ((p.ircAuth IS NULL OR LENGTH(p.ircAuth) = 0) AND p.nick = $ircAuth" + pIdx + "n) )");

                        dt["$ircAuth" + pIdx + "n"] = partRef.whois["account"];

                    } else {
                        pConds.push("p.nick LIKE $nick" + pIdx + "n");

                        dt["$nick" + pIdx + "n"] = partRef.nick;
                    }

                    pIdx++;

                });

                sql += "SELECT ps.*, s.flag, COUNT(p2.rowid) AS 'pickPlayers', p.*, p.rowid AS 'player_id', ";
                sql += "julianday('now') - julianday(s.starttime, 'unixepoch') AS 'past_days', datetime(s.starttime, 'unixepoch') AS 'date' ";
                sql += "FROM player p ";
                sql += "INNER JOIN ext_player_stat ps ON ps.player_id = p.rowid ";
                sql += "INNER JOIN ext_stat s ON ps.ext_stat_id = s.rowid AND s.flag = $flag ";
                sql += "INNER JOIN ext_player_stat p2 ON p2.ext_stat_id = s.rowid AND p2.isCaptain = 0 ";
                sql += "WHERE (" + pConds.join(' OR ') + ") AND p.botIdent = $botIdent ";

                if (method['type'] == 'pastdays') {
                    sql += " AND (julianday('now') - julianday(s.starttime, 'unixepoch')) <= $pastdays ";
                    dt["$pastdays"] = method['value'];
                }

                sql += "GROUP BY s.rowid ";
                sql += "ORDER BY p.rowid ASC, s.rowid DESC";

                db.all(sql, dt, function(err, rows) {

                    var pdt = {};

                    if (rows) {
                        rows.forEach((row) => {

                            var pid = parseInt(row["player_id"]);

                            if (typeof pdt[pid] == 'undefined') {
                                pdt[pid] = row;
                                pdt[pid]["st_recs"] = 0;
                                pdt[pid]["st_totalpugs"] = 0;
                                pdt[pid]["st_captained"] = 0;
                                pdt[pid]["st_totalpicks"] = 0;
                                pdt[pid]["st_picks"] = 0;
                                pdt[pid]["st_pickList"] = [];
                            }

                            if (method['type'] != 'pastpicks' || pdt[pid]["st_recs"] <= method['value']) {

                                pdt[pid]["st_recs"]++;
                                pdt[pid]["st_totalpugs"]++;

                                if (parseInt(row['isCaptain']) == 1) {
                                    pdt[pid]["st_captained"]++;

                                } else {
                                    pdt[pid]["st_totalpicks"] += parseInt(row['pickPlayers']);
                                    pdt[pid]["st_picks"] += parseInt(row['pickIndex']) + 1;
                                    pdt[pid]["st_pickList"].push(parseInt(row['pickIndex']));
                                }
                            }

                        });

                        var finalRows = [];

                        for (var pid in pdt) {
                            pdt[pid]['totalpugs'] = pdt[pid]['st_totalpugs'];
                            pdt[pid]['captained'] = pdt[pid]['st_captained'];
                            pdt[pid]['picks'] = pdt[pid]['st_picks'];
                            pdt[pid]['totalpicks'] = pdt[pid]['st_totalpicks'];

                            finalRows.push(pdt[pid]);
                        }

                        callback(finalRows);

                    } else {
                        callback(null);
                    }

                });
            });

            db.close();
        }
    }

    getUser(partRef) {
        var db = this.getDb();

        db.serialize(() => {
            var dt = {}, sql = "", pConds = [];

            if (partRef.type == 0) {
                pConds.push("p.discordId = $discordId");

                dt["$discordId"] = partRef.id;

            } else if (partRef.whois && partRef.whois["account"]) {
                pConds.push("p.ircAuth = $ircAuth");
                pConds.push("((p.ircAuth IS NULL OR LENGTH(p.ircAuth) = 0) AND p.nick = $ircAuth)");

                dt["$ircAuth"] = partRef.whois["account"];
            }

            pConds.push("p.nick LIKE $nick");

            dt["$nick"] = partRef.nick;
            dt["$botIdent"] = this.operRef.ident;
            dt["$flag"] = "ctf";

            sql += "SELECT p.rowid AS 'player_id', st.rowid AS 'stat_id' FROM player p ";
            sql += "LEFT JOIN player_stat ps ON ps.player_id = p.rowid ";
            sql += "LEFT JOIN stat st ON st.rowid = ps.stat_id AND st.flag = $flag ";
            sql += "WHERE (" + pConds.join(' OR ') + ") AND p.botIdent = $botIdent ";
            sql += "ORDER BY p.discordId DESC, p.ircAuth DESC, p.rowid ASC, st.last DESC, st.rowid ASC";

            db.get(sql, dt, (function(tIdx) { return function(err, row) {

            }}(0)));

        });

        db.close();
    }

    getGameStat(channelKey, flag, player_id, index, callback) {
        var db = this.getDb();

        db.serialize(() => {
            var dt = {}, sql = "", pConds = [], st_rows = null, pl_rows = null, tt;

            if (channelKey) {
                pConds.push("st.channelKey = $channelKey");
                dt["$channelKey"] = channelKey;
            }

            if (flag && Array.isArray(flag)) {
                var flagIdx = 1, flagConds = [];

                flag.forEach((c) => {

                    flagConds.push("st.flag = $flag" + flagIdx + "n");
                    dt["$flag" + flagIdx + "n"] = c;

                    flagIdx++;

                });

                pConds.push("(" + flagConds.join(" OR ") + ")")

            } else if (flag) {
                pConds.push("st.flag = $flag");
                dt["$flag"] = flag;
            }

            sql += "SELECT st.rowid AS 'ext_stat_id', st.*, ";
            sql += "( SELECT COUNT(DISTINCT st.rowid) FROM ext_stat st ";

            if (player_id && (tt = parseInt(player_id)) && !isNaN(player_id)) {
                sql += "INNER JOIN ext_player_stat x ON x.ext_stat_id = st.rowid AND x.player_id = " + player_id + " ";
            }

            sql += (pConds.length > 0 ? ("WHERE " + pConds.join(" AND ") + " ") : "") + " ) AS 'count' ";
            sql += "FROM ext_stat st ";

            if (player_id && (tt = parseInt(player_id)) && !isNaN(player_id)) {
                sql += "INNER JOIN ext_player_stat x ON x.ext_stat_id = st.rowid AND x.player_id = " + player_id + " ";
            }

            if (pConds.length > 0) {
                sql += "WHERE " + pConds.join(" AND ") + " ";
            }

            sql += "ORDER BY st.rowid DESC ";
            sql += "LIMIT " + parseInt(index) + ", 1";

            db.all(sql, dt, function(err, rows) {

                if (rows && rows.length > 0) {

                    st_rows = rows;
                    
                }

            });

            db.close(() => {

                if (st_rows) {
                    var db = this.getDb();

                    db.serialize(() => {

                        var sql = "";

                        sql += "SELECT ps.*, p.* FROM ext_player_stat ps ";
                        sql += "LEFT JOIN player p ON p.rowid = ps.player_id ";
                        sql += "WHERE ps.ext_stat_id = $extid ";
                        sql += "ORDER BY ps.teamIndex ASC, ps.pickIndex ASC, ps.ext_stat_id ASC";

                        dt = {
                            $extid : st_rows[0]['ext_stat_id']
                        };

                        db.all(sql, dt, function(err, rows) {

                            pl_rows = rows;

                            if (callback) {
                                callback(st_rows, pl_rows);
                            }

                        });

                    });

                    db.close();

                } else {
                    if (callback) {
                        callback(null, null);
                    }
                }

            })

        });
    }

    getPlayer(partRef, callback) {
        var db = this.getDb();

        db.serialize(() => {
            var dt = {}, sql = "", pConds = [], st_rows = null, pl_rows = null;

            if (typeof partRef == "object") {

                if (partRef.type == 0) {
                    pConds.push("p.discordId = $discordId");
                    dt["$discordId"] = partRef.id;

                } else if (partRef.whois && partRef.whois["account"]) {
                    pConds.push("p.ircAuth = $ircAuth");
                    dt["$ircAuth"] = partRef.whois["account"];

                } else {
                    pConds.push("p.nick LIKE $nick");
                    dt["$nick"] = partRef.nick;
                }

            } else {
                pConds.push("p.nick LIKE $nick");
                dt["$nick"] = partRef;
            }

            sql += "SELECT *, p.rowid AS 'player_id' FROM player p ";
            sql += "WHERE " + pConds.join(" AND ") + " ";
            sql += "LIMIT 1";

            db.all(sql, dt, function(err, rows) {

                if (rows && rows.length > 0) {

                    callback(rows[0]);

                } else {

                    callback(null);

                }

            });

        });
    }

    getTrendStats(catRef, days, callback) {
        var db = this.getDb();

        db.serialize(() => {
            var dt = {}, sql = "";

            sql += "SELECT *, s.rowid AS 'ext_stat_id', datetime(s.starttime, 'unixepoch') AS 'date', ";
            sql += "strftime('%Y', datetime(s.starttime, 'unixepoch')) AS 'year', ";
            sql += "strftime('%m', datetime(s.starttime, 'unixepoch')) AS 'month', ";
            sql += "strftime('%d', datetime(s.starttime, 'unixepoch')) AS 'day', ";
            sql += "COUNT(DISTINCT s.rowid) AS 'pugCount' ";
            sql += "FROM ext_stat s ";
            sql += "WHERE datetime(s.starttime, 'unixepoch') >= datetime($startDate) AND datetime(s.starttime, 'unixepoch') <= datetime($endDate) ";
            sql += " AND s.channelKey = $channelKey AND s.flag = $flag ";
            sql += "GROUP BY date(s.starttime, 'unixepoch') ";
            sql += "ORDER BY date(s.starttime, 'unixepoch') DESC";

            dt["$channelKey"] = catRef.channelKey;
            dt["$flag"] = catRef.flag;
            dt["$startDate"] = TimeUtils.dateToSql(days[days.length - 1]);
            dt["$endDate"] = TimeUtils.dateToSql(days[0]);

            db.all(sql, dt, function(err, rows) {
                
                var result = [], idx = 0;

                for (var cd of days) {
                    result.push({
                        'day' : cd,
                        'count' : 0,
                        'count_trend' : 0
                    });
                }
                
                if (rows && rows.length > 0) {
                    rows.forEach((row) => {

                        while (idx < result.length) {
                            const c_year = parseInt(result[idx]['day'].getFullYear());
                            const c_month = parseInt(result[idx]['day'].getMonth()) + 1;
                            const c_day = parseInt(result[idx]['day'].getDate());

                            if (c_year == parseInt(row['year']) && c_month == parseInt(row['month']) && c_day == parseInt(row['day'])) {
                                result[idx]['count'] += parseInt(row['pugCount']);
                                break;

                            } else {
                                idx++;
                            }
                        }

                    });
                }
                
                callback(result);

            });

        });
    }
}

export default Stats;
