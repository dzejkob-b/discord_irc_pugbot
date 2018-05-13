import WordCo from './word_co';
import {secsAgoFormat} from './helpers';

class Stats {
    constructor(operRef) {

        this.operRef = operRef;
        this.dbName = 'stats.db';

    }

    eatIni(path, callback) {
        try {
            this.eatIniProcess(path, callback);

        } catch (err) {
            callback("Error: " + err.message);
        }
    }

    eatIniProcess(path, callback) {
        var fs = require('fs'), data;

        if (fs.existsSync(path) && (data = fs.readFileSync(path, 'utf8')) != false) {

            var selector = false, dt = {};

            data.split("\r").forEach((line) => {

                line = line.trim();

                if (line.length > 0) {

                    if (line[0] == '[' && line[line.length - 1] == ']') {
                        selector = line.substr(1, line.length - 2);

                    } else if (selector != false) {
                        if (typeof dt[selector] == 'undefined') {
                            dt[selector] = {};
                        }

                        var idxEq = line.indexOf('=');

                        if (idxEq >= 0) {
                            var partKey = line.substr(0, idxEq);
                            var partValue = line.substr(idxEq + 1);

                            if (partKey[partKey.length - 1] == '+') {
                                partKey = partKey.substr(0, partKey.length - 1);
                            }

                            var idx = partKey.lastIndexOf('_'), pref = false;

                            if (idx >= 0) {
                                pref = partKey.substr(idx + 1);
                                partKey = partKey.substr(0, idx);
                            }

                            var useObj;

                            if (pref == false) {
                                useObj = dt[selector];

                            } else if (typeof dt[selector][pref] == 'undefined') {
                                dt[selector][pref] = {};
                                useObj = dt[selector][pref];

                            } else {
                                useObj = dt[selector][pref];
                            }

                            if (typeof useObj[partKey] == 'undefined') {
                                useObj[partKey] = partValue;
                            } else {
                                useObj[partKey] += partValue;
                            }

                        } // if

                    }

                }

            });

            var sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database(this.dbName), key, subKey;

            db.serialize(() => {

                db.run("BEGIN TRANSACTION");

                for (key in dt) {

                    var idx = key.indexOf('.playerstats.');

                    if (idx >= 0) {
                        dt[key]["nick"] = key.substr(idx + 13);

                        db.run("INSERT INTO player (botIdent, nick, bans) VALUES ($botIdent, $name, $bans)", {

                            $botIdent : this.operRef.ident,
                            $name : dt[key]["nick"],
                            $bans : dt[key]["bans"] ? dt[key]["bans"] : 0

                        }, (function(tKey) { return function(err) {

                            dt[tKey]["player_id"] = this.lastID;

                        }})(key));
                    }
                }

                db.run("END");

                db.run("BEGIN TRANSACTION");

                for (key in dt) {
                    if (dt[key]["nick"]) {

                        for (subKey in dt[key]) {
                            if (typeof dt[key][subKey] == 'object') {

                                db.run("INSERT INTO stat (flag, captained, starttime, totalpugs, last, picks, totalpicks) VALUES ($flag, $captained, $starttime, $totalpugs, $last, $picks, $totalpicks)", {

                                    $flag : subKey,
                                    $captained : dt[key][subKey]["captained"],
                                    $starttime : dt[key][subKey]["starttime"],
                                    $totalpugs : dt[key][subKey]["totalpugs"],
                                    $last : dt[key][subKey]["last"],
                                    $picks : dt[key][subKey]["picks"],
                                    $totalpicks : dt[key][subKey]["totalpicks"]

                                }, (function(tKey, tSubKey) { return function(err) {

                                    dt[tKey][tSubKey]["stat_id"] = this.lastID;

                                }})(key, subKey));

                            } // if
                        }

                    }
                }

                db.run("END");

            });

            db.close(() => {

                db = new sqlite3.Database(this.dbName);

                db.serialize(() => {

                    db.run("BEGIN TRANSACTION");

                    for (key in dt) {
                        if (dt[key]["nick"]) {

                            for (subKey in dt[key]) {
                                if (typeof dt[key][subKey] == 'object') {

                                    db.run("INSERT INTO player_stat (player_id, stat_id) VALUES ($player_id, $stat_id)", {

                                        $player_id : dt[key]["player_id"],
                                        $stat_id : dt[key][subKey]["stat_id"]

                                    });

                                } // if
                            }

                        }
                    }

                    db.run("END");

                });

                db.close(() => {

                    callback("Stats was updated from file `" + path + "`!");

                });

            });

        } else {
            callback("Invalid file!");
        }
    }

    createStructure() {
        var sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database(this.dbName);

        db.serialize(() => {

            db.run("CREATE TABLE IF NOT EXISTS player (botIdent TEXT, nick TEXT, ircAuth TEXT, discordId TEXT, bans INTEGER)");

            db.run("CREATE TABLE IF NOT EXISTS stat (flag TEXT, captained INTEGER, starttime INTEGER, totalpugs INTEGER, last INTEGER, picks INTEGER, totalpicks INTEGER)");

            db.run("CREATE TABLE IF NOT EXISTS player_stat (player_id INTEGER, stat_id INTEGER)");

        });

        db.close();
    }

    flushStats(callback) {
        var sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database(this.dbName);

        db.serialize(() => {

            db.run("DELETE FROM player_stat");

            db.run("DELETE FROM stat");

            db.run("DELETE FROM player");

        });

        db.close(() => {
            callback(callback);
        });
    }

    saveGameToStats(gameRef) {
        var parts = [], partsTotalPicks = 0;

        gameRef.teams.forEach((teamRef) => {

            if (teamRef.captPartRef != null) {
                parts.push({
                    "partRef" : teamRef.captPartRef,
                    "captain" : true,
                    "pickIndex" : teamRef.captPartRef.pickIndex
                });
            }

            var sf;

            for (sf = 1; sf < teamRef.catRef.list.length; sf++) {
                parts.push({
                    "partRef" : teamRef.catRef.list[sf],
                    "captain" : false,
                    "pickIndex" : teamRef.catRef.list[sf].pickIndex
                });

                partsTotalPicks++;
            }

        });

        gameRef.restCat.list.forEach((partRef) => {
            parts.push({
                "partRef" : partRef,
                "captain" : false,
                "pickIndex" : partRef.pickIndex
            });

            partsTotalPicks++;
        });

        var sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database(this.dbName);

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
                dt["$flag"] = gameRef.restCat.flag;

                sql += "SELECT p.rowid AS 'player_id', st.rowid AS 'stat_id' FROM player p ";
                sql += "LEFT JOIN player_stat ps ON ps.player_id = p.rowid ";
                sql += "LEFT JOIN stat st ON st.rowid = ps.stat_id AND st.flag = $flag ";
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

            var sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database(this.dbName);

            db.serialize(() => {

                var idx = 0;

                while (idx < parts.length) {

                    var dt, sql = "", c = parts[idx];

                    if (c["player_id"]) {
                        // players allready exists ...

                        if (c["partRef"].type == 0) {
                            db.run("UPDATE player SET discordId = $discordId WHERE rowid = $player_id", dt = {

                                $discordId : c["partRef"].id,
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

                var sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database(this.dbName);

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
                            db.run("INSERT INTO stat (flag, captained, starttime, totalpugs, last, picks, totalpicks) VALUES ($flag, $captained, $starttime, $totalpugs, $last, $picks, $totalpicks)", {

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

                    var sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database(this.dbName);

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

                    db.close();

                });

            });

        });
    }

    addUserBan(partRef) {
        var sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database(this.dbName), final_row = null;

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

            sql += "SELECT p.rowid AS 'player_id' FROM player p ";
            sql += "WHERE (" + pConds.join(' OR ') + ") AND p.botIdent = $botIdent ";
            sql += "ORDER BY p.discordId DESC, p.ircAuth DESC, p.rowid ASC";

            db.get(sql, dt, (function(tPartRef) { return function(err, row) {

                final_row = row;

            }}(partRef)));

        });

        db.close(() => {
            if (final_row) {
                var sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database(this.dbName);

                db.serialize(() => {
                    db.run("UPDATE player SET bans = bans + 1 WHERE rowid = $player_id", {
                        $player_id : final_row["player_id"]
                    });
                });

                db.close();
            }
        });
    }

    getUser(partRef) {
        var sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database(this.dbName);

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

    getStats(flag, partRef, callback) {
        var sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database(this.dbName);

        db.serialize(() => {
            var dt = {}, sql = "", pConds = [];

            if (typeof partRef == 'object') {
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
                dt["$flag"] = flag;
                dt["$limit"] = 30;

                sql += "SELECT p.rowid AS 'player_id', st.rowid AS 'stat_id', p.*, st.* FROM player p ";
                sql += "LEFT JOIN player_stat ps ON ps.player_id = p.rowid ";
                sql += "LEFT JOIN stat st ON st.rowid = ps.stat_id AND st.flag = $flag ";
                sql += "WHERE (" + pConds.join(' OR ') + ") AND p.botIdent = $botIdent ";
                sql += "ORDER BY p.discordId DESC, p.ircAuth DESC, p.rowid ASC, st.last DESC, st.rowid ASC ";
                sql += "LIMIT $limit";

                db.all(sql, dt, function(err, rows) {

                    callback(rows);

                });

            } else {
                sql += "SELECT p.rowid AS 'player_id', st.rowid AS 'stat_id', p.*, st.* FROM player p ";
                sql += "INNER JOIN player_stat ps ON ps.player_id = p.rowid ";
                sql += "INNER JOIN stat st ON ps.stat_id = st.rowid AND st.flag = $flag ";
                sql += "WHERE p.nick LIKE $nick AND p.botIdent = $botIdent ";
                sql += "ORDER BY p.discordId DESC, p.ircAuth DESC, p.rowid ASC, st.last DESC, st.rowid ASC ";
                sql += "LIMIT $limit";

                db.all(sql, {

                    $flag : flag,
                    $nick : '%' + partRef + '%',
                    $limit : 30,
                    $botIdent : this.operRef.ident

                }, function(err, rows) {

                    callback(rows);

                });
            }
        });

        db.close();
    }

    getStatsMessages(flag, partRef, index, callback) {
        this.getStats(flag, partRef, (rows) => {

            var msgs = [], wRef, uIndex = parseInt(index);

            if (isNaN(uIndex)) uIndex = 1;

            if (uIndex < 1) uIndex = 1;
            else if (uIndex > rows.length) uIndex = rows.length;

            if (rows.length > 0) {
                var sf = uIndex - 1;

                wRef = WordCo.cre();

                wRef.texth('[').text(rows[sf]['nick']).texth(']');

                wRef.sep();

                wRef.text('Total ').texth(rows[sf]['flag']).text(' pugs: ');
                wRef.texth('[').text(rows[sf]['totalpugs']).texth(']');

                wRef.sep();

                var cTm = (new Date()).getTime() / 1000;
                var dailyStat = Math.round((rows[sf]['totalpugs'] / ((cTm - rows[sf]['starttime']) / 86400)) * 100.0) / 100.0;

                wRef.text('Daily: ');
                wRef.texth('[').text(dailyStat >= 10 ? ('10+') : dailyStat).texth(']');

                wRef.sep();

                var tPugs = rows[sf]['totalpugs'] - rows[sf]['captained'];

                if (tPugs > 0) {
                    var avgPick = Math.round((rows[sf]['picks'] / tPugs) * 100.0) / 100.0;
                    var avgTotPick = Math.round((rows[sf]['totalpicks'] / tPugs) * 100.0) / 100.0;

                    wRef.text('Avg Pick: ');
                    wRef.texth('[').text(avgPick).texth('/').text(avgTotPick).texth(']');

                    wRef.sep();
                }

                wRef.text('Capt: ');
                wRef.texth('[').text(rows[sf]['captained']).texth(']');

                wRef.sep();

                wRef.text('Bans: ');
                wRef.texth('[').text(rows[sf]['bans']).texth(']');

                wRef.sep();

                wRef.text('Last: ');
                wRef.texth('[').text(secsAgoFormat(cTm - rows[sf]['last']) + ' ago').texth(']');

                if (rows.length > 1) {
                    wRef.sep();

                    wRef.texth('[').text((sf + 1) + ' / ' + rows.length).texth(']');
                }

                msgs.push(wRef);
            }

            callback(msgs);

        });
    }
}

export default Stats;
