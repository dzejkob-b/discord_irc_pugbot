
class CmdStack {
    constructor(operRef, text) {

        this.operRef = operRef;
        this.pts = [];
        this.lastPoped = false;

        text = text.trim();

        for (var sf = 1; sf < 20; sf++) {
            if (text == "p" + sf) {
                text = "p " + sf;
                sf = 20;
            }
        }

        var idx = 0, len = text.length, word = '';

        while (idx <= len) {
            if (idx == len || text[idx] == ' ') {
                word = word.trim();

                if (word.length > 0) {
                    this.pts.push(word);
                }

                word = '';

            } else {
                word += text[idx];
            }

            idx++;
        }
    }

    popMod() {
        if (this.pts.length == 0) {
            return false;

        } else if (this.operRef.getCatRefByFlag(this.pts[0]) != null) {
            return this.pop();

        } else {
            return false;
        }
    }

    pop() {
        if (this.pts.length == 0) {
            return false;

        } else {
            var sf;

            this.lastPoped = this.pts[0];

            for (sf = 0; sf < this.pts.length - 1; sf++) {
                this.pts[sf] = this.pts[sf + 1];
            }

            this.pts.pop();

            return this.lastPoped;
        }
    }

    getRestString() {
        var sf, result = '';

        for (sf = 0; sf < this.pts.length; sf++) {
            result += (result == false ? '' : ' ') + this.pts[sf];
        }

        return result;
    }

    last() {
        return this.lastPoped;
    }
}


export default CmdStack;