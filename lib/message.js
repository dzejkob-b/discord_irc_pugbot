import Bot from './bot';
import discord from 'discord.js';
import WordCo from './word_co';

class Message {
    constructor(botRef) {

        this.botRef = botRef;

    }

    sendMsg(channelKey, text, privPartRef = null) {
        if (privPartRef != null) {

            if (typeof text == 'object') {
                privPartRef.noticeMessage(this.botRef.operRef, text.getIrc());
            } else {
                privPartRef.noticeMessage(this.botRef.operRef, text);
            }

        } else if (typeof text == 'object') {

            const msgIrc = text.getIrc();
            const msgStr = new discord.RichEmbed();

            msgStr.setDescription(text.getDiscord());
            msgStr.setColor([255, 0, 0]);
            msgStr.setTimestamp(new Date());

            this.botRef.getChannelKeysFilter(channelKey).forEach((cChannelKey) => {

                this.botRef.sendExactToIRC(cChannelKey, msgIrc);
                this.botRef.sendExactToDiscord(cChannelKey, msgStr);

            });

        } else {

            const msgStr = new discord.RichEmbed();

            msgStr.setDescription(formatFromIRCToDiscord(text));
            msgStr.setColor([255, 0, 0]);
            msgStr.setTimestamp(new Date());

            this.botRef.getChannelKeysFilter(channelKey).forEach((cChannelKey) => {

                this.botRef.sendExactToIRC(cChannelKey, text);
                this.botRef.sendExactToDiscord(cChannelKey, msgStr);

            });
        }
    }

    sendMsgArray(channelKey, list, idx, privPartRef = null, flags = false) {
        if (idx < list.length && list[idx] == "::DELETE") {
            // nothing ...

        } else if (privPartRef != null) {
            privPartRef.noticeMessage(this.botRef.operRef, list[idx]);

        } else {

            const msgIrc = list[idx].getIrc();
            const msgStr = new discord.RichEmbed();

            msgStr.setDescription(list[idx].getDiscord());
            msgStr.setColor([255, 0, 0]);
            msgStr.setTimestamp(new Date());

            this.botRef.getChannelKeysFilter(channelKey).forEach((cChannelKey) => {

                if ((!flags || flags['allowIrc']) && !list[idx].isBlank()) {
                    this.botRef.sendExactToIRC(cChannelKey, msgIrc);
                }

                if (!flags || flags['allowDiscord']) {
                    this.botRef.sendExactToDiscord(cChannelKey, msgStr);
                }

            });
        }

        if (idx + 1 < list.length) {
            setTimeout(() => {

                this.sendMsgArray(channelKey, list, idx + 1, privPartRef, flags);

            }, 1000);
        }
    }

    sendMsgArrayPrep(channelKey, list, privPartRef = null) {
        var cChan = channelKey ? this.botRef.channels[channelKey] : false;

        if ((cChan && cChan['channelIrc'] && !privPartRef) || (privPartRef && privPartRef.type == 1)) {
            this.sendMsgArray(channelKey, list, 0, privPartRef, { 'allowIrc' : true });
        }

        if ((cChan && cChan['channelDiscord'] && !privPartRef) || (privPartRef && privPartRef.type == 0)) {
            var disMsg = '', disTmp, disList = [];

            for (var idx = 0; idx < list.length; idx++) {
                disTmp = list[idx].getDiscord();

                if (disMsg.length + disTmp.length > 1300) {
                    disList.push(disMsg);
                    disMsg = '';
                }

                if (disMsg.length > 0) {
                    disMsg += '\n';
                }

                disMsg += disTmp;
            }

            disList.push(disMsg);

            disList.forEach((dm) => {

                if (privPartRef) {
                    privPartRef.noticeMessage(this.botRef.operRef, dm);

                } else {
                    const msgStr = new discord.RichEmbed();

                    msgStr.setDescription(dm);
                    msgStr.setColor([255, 0, 0]);
                    msgStr.setTimestamp(new Date());

                    this.botRef.sendExactToDiscord(channelKey, msgStr);
                }

            });
        }
    }
}

export default Message;