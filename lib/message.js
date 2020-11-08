import Bot from './bot';
import discord from 'discord.js';
import WordCo from './word_co';
import {formatFromIRCToDiscord} from './formatting';


class Message {
    constructor(botRef) {

        this.botRef = botRef;

    }

    static CreateDiscordRichEmbed(message) {
        const msgStr = new discord.MessageEmbed();

        msgStr.setDescription(message);
        msgStr.setColor([255, 0, 0]);
        msgStr.setTimestamp(new Date());

        return msgStr;
    }

    sendMsg(channelKey, text, privPartRef = null, asStandardMessage = false) {
        if (privPartRef != null) {

            privPartRef.noticeMessage(this.botRef.operRef, text);

        } else {
            let ircMsg;
            let discordMsgFormat;

            if (typeof text == 'object') {
                ircMsg = text.getIrc();
                discordMsgFormat = text.getDiscord();

            } else {
                ircMsg = text;
                discordMsgFormat = formatFromIRCToDiscord(text);
            }

            const discordMsg = asStandardMessage ? text : Message.CreateDiscordRichEmbed(discordMsgFormat);

            this.botRef.getChannelKeysFilter(channelKey).forEach(cChannelKey => {
                this.botRef.sendExactToIRC(cChannelKey, ircMsg);
                this.botRef.sendExactToDiscord(cChannelKey, discordMsg);
            });
        }
    }

    sendMsgArray(channelKey, list, idx, privPartRef = null, flags = false) {
        if (idx < list.length && list[idx] == "::DELETE") {
            // nothing ...

        } else if (privPartRef != null) {
            privPartRef.noticeMessage(this.botRef.operRef, list[idx]);

        } else {
            if (typeof list[idx] != 'object') {
                list[idx] = WordCo.cre().text(list[idx]);
            }

            const msgIrc = list[idx].getIrc();
            const msgStr = new discord.MessageEmbed();

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
                    const msgStr = new discord.MessageEmbed();

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