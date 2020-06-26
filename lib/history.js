import WordCo from './word_co';
import Game from './game';

class History {
    // deprecated
    
    constructor(operRef) {

        this.operRef = operRef;
        this.gameHistory = [];

    }

    toJSON_history() {
        var result = {
            "gameHistory" : []
        };

        this.gameHistory.forEach((gameRef) => {
            result["gameHistory"].push(gameRef.toJSON());
        });

        return result;
    }

    fromJSON_history(input) {
        if (input["gameHistory"] && Array.isArray(input["gameHistory"])) {
            input["gameHistory"].forEach((c) => {
                this.gameHistory.push(Game.fromJSON(c));
            });
        }
    }

    historyFindFlag(flag) {
        for (var sf = 0; sf < this.gameHistory.length; sf++) {
            if (this.gameHistory[sf].restCat.flag == flag) return true;
        }

        return false;
    }

    historyAddGame(addGameRef) {
        this.gameHistory.push(null);

        for (var sf = this.gameHistory.length - 1; sf > 0; sf--) {
            this.gameHistory[sf] = this.gameHistory[sf - 1];
        }

        this.gameHistory[0] = addGameRef;

        while (this.gameHistory.length > 20) {
            this.gameHistory.pop();
        }

        this.saveState();
    }

    historyDelete(hIdx) {
        if (hIdx >= 0 && hIdx < this.gameHistory.length) {

            var sf;

            for (sf = 0; sf < this.gameHistory.length - 1; sf++) {
                this.gameHistory[sf] = this.gameHistory[sf + 1];
            }

            this.gameHistory.pop();
            this.saveState();

            return true;

        } else {
            return false;
        }
    }

    getFirst(channelKey) {
        var idx = 0;

        while (idx < this.gameHistory.length) {
            if (!channelKey || this.gameHistory[idx].channelKey == channelKey) {
                return this.gameHistory[idx];
            }

            idx++;
        }
        
        return null;
    }

    saveState() {
        var fs = require('fs');
        var jsonStr = JSON.stringify(this.toJSON_history(), null, 2);

        fs.writeFileSync("history.json", jsonStr);
    }

    loadState() {
        var fs = require('fs'), data, dt;

        if (fs.existsSync("history.json") && (data = fs.readFileSync('history.json', 'utf8')) != false && (dt = JSON.parse(data))) {

            this.fromJSON_history(dt);

        }
    }
}

export default History;