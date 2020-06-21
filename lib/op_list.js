import WordCo from './word_co';
import Game from './game';

class OpList {
    constructor(parent) {
        this.parent = parent;
    }

    exec(channelKey) {
        let operRef = this.parent,
            catRef,
            wRef,
            teamRef,
            chCats,
            tmList = [],
            useChan,
            cStk = this.parent.cStk,
            partRef = this.parent.partRef,
            privPartRef = this.parent.privPartRef;

        if (
            operRef.currentCmd == 'listall' ||
            operRef.currentCmd == 'liastall' ||
            operRef.currentCmd == 'lsall'
        ) {
            useChan = false;
        } else {
            useChan = channelKey;
        }

        if (operRef.logicState == 2 || operRef.logicState == 1) {
            wRef = WordCo.cre();

            if (
                operRef.logicState == 2 &&
                (teamRef = operRef.gameRef.getTeamByTurn()) != null
            ) {
                wRef.text('Captain');
                teamRef.addTextFormatted(
                    wRef,
                    ' ' + teamRef.captPartRef.nick + ' ',
                    false,
                    true
                );
                wRef.text('now picks: ');
            }

            wRef = operRef.gameRef.restCat.addStatusReadable(
                wRef,
                true,
                operRef.voteRef,
                channelKey,
                operRef
            );

            tmList.push(wRef);

            operRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
        } else if (cStk.pop() != false) {
            if ((catRef = operRef.getCatRef(false, cStk.last())) == null) {
                partRef.noticeMessage(
                    operRef,
                    WordCo.cre()
                        .text('No such pug ')
                        .texth(cStk.last())
                        .text('!')
                );
            } else {
                tmList.push(
                    catRef.addStatusReadable(
                        WordCo.cre(),
                        false,
                        operRef.voteRef,
                        channelKey,
                        operRef
                    )
                );
            }

            operRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
        } else if (
            (chCats = operRef.getCatsInChannel(useChan)) != false &&
            chCats.length > 1
        ) {
            var sf;

            wRef = WordCo.cre();

            for (sf = 0; sf < chCats.length; sf++) {
                if (sf != 0) wRef.sep();
                chCats[sf].addStatusReadableShort(wRef, channelKey, operRef);
            }

            if (
                operRef.currentCmd == 'liast' ||
                operRef.currentCmd == 'liastall'
            ) {
                operRef.statsRef.getGameStat(useChan, false, null, 0, function (
                    st_rows,
                    pl_rows
                ) {
                    if (st_rows && pl_rows) {
                        var gRef = Game.fromStatData(st_rows[0], pl_rows);

                        tmList.push(gRef.addStatusReadable(WordCo.cre(), true));
                    } else {
                        tmList.push(WordCo.cre().text('No game history.'));
                    }

                    tmList.push(WordCo.cre());
                    tmList.push(wRef);

                    operRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
                });

                /*
                if (hist = operRef.historyRef.getFirst(useChan)) {
                    tmList.push(hist.addStatusReadable(WordCo.cre(), true));

                } else {
                    tmList.push(WordCo.cre().text('No game history.'));
                }
                */
            } else {
                if (tmList.length > 0) {
                    tmList.push(WordCo.cre());
                }

                tmList.push(wRef);

                operRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
            }
        } else if ((catRef = operRef.getCatRef(channelKey, false)) != null) {
            if (
                operRef.currentCmd == 'liast' ||
                operRef.currentCmd == 'liastall'
            ) {
                operRef.statsRef.getGameStat(useChan, false, null, 0, function (
                    st_rows,
                    pl_rows
                ) {
                    if (st_rows && pl_rows) {
                        var gRef = Game.fromStatData(st_rows[0], pl_rows);

                        tmList.push(gRef.addStatusReadable(WordCo.cre(), true));
                    } else {
                        tmList.push(WordCo.cre().text('No game history.'));
                    }

                    tmList.push(WordCo.cre());
                    tmList.push(
                        catRef.addStatusReadable(
                            WordCo.cre(),
                            false,
                            operRef.voteRef,
                            channelKey,
                            operRef
                        )
                    );

                    operRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
                });

                /*
                if (hist = operRef.historyRef.getFirst(useChan)) {
                    tmList.push(hist.addStatusReadable(WordCo.cre(), true));

                } else {
                    tmList.push(WordCo.cre().text('No game history.'));
                }
                */
            } else {
                if (tmList.length > 0) {
                    tmList.push(WordCo.cre());
                }

                tmList.push(
                    catRef.addStatusReadable(
                        WordCo.cre(),
                        false,
                        operRef.voteRef,
                        channelKey,
                        operRef
                    )
                );

                operRef.sendMsgArrayPrep(channelKey, tmList, privPartRef);
            }
        }
    }
}

export default OpList;
