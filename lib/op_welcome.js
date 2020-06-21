import WordCo from './word_co';

class OpWelcome {
    constructor(parent) {
        this.parent = parent;
    }

    exec() {
        let operRef = this.parent,
            cStk = this.parent.cStk,
            partRef = this.parent.partRef;

        operRef.getUser(cStk.pop(), (cPartRef) => {
            if (cPartRef == null) {
                partRef.noticeMessage(
                    operRef,
                    WordCo.cre()
                        .text('No such user ')
                        .texth(cStk.last())
                        .text('!')
                );
            } else {
                operRef.welcomeRef.sendWelcomeMessage(cPartRef, true);
            }
        });
    }
}

export default OpWelcome;
