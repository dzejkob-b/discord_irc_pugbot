import WordCo from './word_co';

class OpChannelList {
    constructor(parent) {
        this.parent = parent;
    }

    exec(channelKey) {
        let operRef = this.parent,
            isStart = true,
            chKey,
            cChan,
            wRef,
            privPartRef = this.parent.privPartRef;

        wRef = WordCo.cre();

        if (Object.keys(operRef.botRef.channels).length == 0) {
            wRef.text('No channels defined.');
        } else {
            for (chKey in operRef.botRef.channels) {
                cChan = operRef.botRef.channels[chKey];

                if (isStart) {
                    isStart = false;
                } else {
                    wRef.text(', ');
                }

                wRef.texth(chKey);

                wRef.text(' [');

                let any = false;

                if (channelKey == chKey) {
                    wRef.text('{THIS}');
                    any = true;
                }

                if (cChan['channelDiscord']) {
                    if (any) {
                        wRef.text(', ');
                    }

                    wRef.text('discord: ').texth(cChan['channelDiscord']);
                    any = true;
                }

                if (cChan['channelIrc']) {
                    if (any) {
                        wRef.text(', ');
                    }

                    wRef.text('irc: ').texth(cChan['channelIrc']);
                    any = true;
                }

                wRef.text(']');
            }
        }

        operRef.sendMsg(channelKey, wRef, privPartRef);
    }
}

export default OpChannelList;
