import WordCo from './word_co'
import Game from './game'

class OpLast {
    constructor(parent) {
        this.parent = parent
    }

    exec(channelKey) {
        let operRef = this.parent,
            currentCmd = operRef.currentCmd,
            playerNick,
            cStk = this.parent.cStk,
            self = this

        if (currentCmd.substr(0, 2) == 'my') {
            currentCmd = currentCmd.substr(2)

            operRef.statsRef.getPlayer(this.parent.partRef, function (p_row) {
                if (p_row) {
                    self.doExec(channelKey, currentCmd, p_row)
                } else {
                    self.parent.partRef.noticeMessage(
                        operRef,
                        WordCo.cre()
                            .text('No player entry for ')
                            .texth(self.parent.partRef.nick)
                            .text('!')
                    )
                }
            })
        } else if (currentCmd.substr(0, 1) == 'p') {
            currentCmd = currentCmd.substr(1)

            operRef.getUser((playerNick = cStk.pop()), (cPartRef) => {
                operRef.statsRef.getPlayer(
                    cPartRef ? cPartRef : playerNick,
                    function (p_row) {
                        if (p_row) {
                            self.doExec(channelKey, currentCmd, p_row)
                        } else {
                            self.parent.partRef.noticeMessage(
                                operRef,
                                WordCo.cre()
                                    .text('No player entry for ')
                                    .texth(playerNick)
                                    .text('!')
                            )
                        }
                    }
                )
            })
        } else {
            this.doExec(channelKey, currentCmd)
        }
    }

    doExec(channelKey, currentCmd, p_row) {
        let operRef = this.parent,
            tt,
            hSteps = 0,
            useChan,
            hFlag = false,
            hCnt = false,
            cStk = this.parent.cStk,
            privPartRef = this.parent.privPartRef

        if (currentCmd == 'lastall') {
            useChan = false
        } else {
            useChan = channelKey
        }

        /*
        if ((chCats = operRef.getCatsInChannel(useChan)) != false && chCats.length == 1) {
            hFlag = [];

            chCats.forEach((c) => {
                hFlag.push(c.flag);
            });
        }
        */

        if ((tt = cStk.pop()) && isNaN(parseInt(tt))) {
            hFlag = []
            hFlag.push(tt)

            hCnt = cStk.pop()
        } else {
            hCnt = tt
        }

        if (currentCmd == 'last' || currentCmd == 'lastall') {
            hSteps = isNaN(parseInt(hCnt)) ? 1 : parseInt(hCnt)
            if (hSteps < 1) hSteps = 1
        } else if (currentCmd == 'lastt') {
            hSteps = 2
        } else if (currentCmd == 'lasttt') {
            hSteps = 3
        } else if (currentCmd == 'lastttt') {
            hSteps = 4
        }

        operRef.statsRef.getGameStat(
            useChan,
            hFlag,
            p_row ? p_row['player_id'] : null,
            hSteps - 1,
            function (st_rows, pl_rows) {
                if (st_rows && pl_rows) {
                    var gRef = Game.fromStatData(st_rows[0], pl_rows)

                    operRef.sendMsg(
                        channelKey,
                        gRef.addStatusReadable(WordCo.cre(), true, {
                            index: hSteps,
                            count: st_rows[0]['count'],
                        }),
                        privPartRef
                    )
                } else {
                    operRef.sendMsg(
                        channelKey,
                        WordCo.cre().text('No such game history.'),
                        privPartRef
                    )
                }
            }
        )

        /*
        for (sf = 0; sf < operRef.historyRef.gameHistory.length; sf++) {
            if (
                (!useChan || operRef.historyRef.gameHistory[sf].channelKey == useChan || hFlag) &&
                (!hFlag || operRef.historyRef.gameHistory[sf].restCat.flag == hFlag)
            ) {
                hList.push(operRef.historyRef.gameHistory[sf]);
            }
        }

        if (currentCmd == 'last' || currentCmd == 'lastall') {
            hSteps = isNaN(parseInt(hCnt)) ? 1 : parseInt(hCnt);
            if (hSteps < 1) hSteps = 1;

        } else if (currentCmd == 'lastt') {
            hSteps = 2;

        } else if (currentCmd == 'lasttt') {
            hSteps = 3;

        } else if (currentCmd == 'lastttt') {
            hSteps = 4;
        }

        hSteps--;

        if (hSteps >= 0 && hSteps < hList.length) {

            var hGameRef = hList[hSteps];

            // msg to all
            operRef.sendMsg(channelKey, hGameRef.addStatusReadable(WordCo.cre(), true), privPartRef);

        } else {
            operRef.sendMsg(channelKey, WordCo.cre().text('No such game history.'), privPartRef);
        }
        */
    }
}

export default OpLast
