import WordCo from "./word_co";
import Catalog from "./catalog";

class OpHere {
    constructor(parent) {
        this.parent = parent;
    }

    exec(channelKey) {
        let operRef = this.parent, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        operRef.getCatsInChannel(channelKey).forEach((catRef) => {

            if (!catRef.captainIdleInSecs) {
                // ...
                
            } else if (operRef.logicState == 2) {
                const cRef = catRef.getParticipant(partRef);

                if (cRef != null) {

                    const teamRef = operRef.gameRef.getTeamByTurn();
                    const captPartRef = teamRef.captPartRef;

                    if (captPartRef.id != cRef.id) {
                        operRef.sendMsg(channelKey, WordCo.cre().text(`Don't worry, it isn't your turn. ${captPartRef.nick} has to pick first.`), privPartRef);
                        return;
                    }

                    if (teamRef.requestTimeExtension()) {
                        operRef.gameRef.setCaptainIdleTimeout(captPartRef);
                        operRef.sendMsg(channelKey, WordCo.cre().text(`You have been granted a time extension of ${catRef.captainIdleInSecs} seconds.`), privPartRef);

                    } else {
                        operRef.sendMsg(channelKey, WordCo.cre().text(`You have already used your time extension.`), privPartRef);
                    }

                    cRef.refreshTime();
                }

            } else {
                operRef.sendMsg(channelKey, WordCo.cre().text(`Pickup did not start or captain are not set yet.`), privPartRef);
            }
        });
    }
}

export default OpHere;