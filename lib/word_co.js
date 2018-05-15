
class WordCo {
    constructor() {

        this.phrase = [];

    }

    static cre() {
        var ref = new WordCo();

        ref.prefix();
        
        return ref;
    }

    prefix() {
        this.phrase.push({ 't' : 'prefix' });

        return this;
    }

    suffix() {
        this.phrase.push({ 't' : 'suffix' });

        return this;
    }

    sep() {
        this.phrase.push({ 't' : 'sep' });

        return this;
    }

    color(input, color, bold, is_nick) {
        let col = '15';
        
        switch (color) {
            case 'red' :
            case '04' :
                col = '04'; break;
            case 'blue' :
            case '02' :
            case '12' :
                col = '12'; break;
            case 'green' :
            case '03' :
                col = '03'; break;
            case 'yellow' :
            case '08' :
                col = '08'; break;
        }

        this.phrase.push({
            't' : 'color',
            'input' : input,
            'color' : col,
            'bold' : bold,
            'is_nick' : is_nick
        });

        return this;
    }

    text(input, bold, is_nick) {
        this.phrase.push({
            't' : 'text',
            'input' : input,
            'bold' : bold,
            'is_nick' : is_nick
        });

        return this;
    }

    texth(input, bold, is_nick) {
        this.phrase.push({
            't' : 'texth',
            'input' : input,
            'bold' : bold,
            'is_nick' : is_nick
        });

        return this;
    }

    updateHashes() {
        var idx = 0, c, key;

        while (idx < this.phrase.length) {
            c = this.phrase[idx];

            var hash = '';

            for (key in c) {
                if (typeof c[key] != 'undefined' && key != 'input') {
                    if (c[key] === true) {
                        hash += (hash == '' ? '' : '~') + key;
                    } else if (c[key] === false) {
                        // nothing
                    } else {
                        hash += (hash == '' ? '' : '~') + c[key];
                    }
                }
            }

            this.phrase[idx]['hash'] = hash;

            idx++;
        }
    }

    getIrc() {
        var out = '', idx = 0, c, key;

        this.suffix();

        out += "\x0315,01";

        this.updateHashes();

        while (idx < this.phrase.length) {
            c = this.phrase[idx];

            var wasSameHash = idx > 0 && this.phrase[idx - 1]['hash'] == c['hash'];
            var willBeBold = idx + 1 < this.phrase.length && this.phrase[idx + 1]['bold'];

            switch (c['t']) {
                case 'prefix' :
                    out += "\x0304" + "\x02" + 'ø ' + "\x02";// + "\x0F";
                    break;

                case 'suffix' :
                    out += "\x0304" + "\x02" + ' ø' + "\x02";// + "\x0F";
                    break;

                case 'sep' :
                    out += "\x0304" + "\x02" + ' ø ' + "\x02";// + "\x0F";
                    break;

                case 'color' :
                    if (wasSameHash) {
                        out += c['input'];
                    } else {
                        out += "\x03" + c['color'] + (c['bold'] ? "\x02" : "") + c['input'];// + "\x0F";
                    }

                    if (c['bold'] && !willBeBold) out += "\x02";
                    break;

                case 'text' :
                    out += "\x0315" + (c['bold'] ? "\x02" : "") + c['input'];// + "\x0F";
                    if (c['bold'] && !willBeBold) out += "\x02";
                    break;

                case 'texth' :
                    out += "\x0314" + (c['bold'] ? "\x02" : "") + c['input'];// + "\x0F";
                    if (c['bold'] && !willBeBold) out += "\x02";
                    break;
            }

            idx++;
        }
        
        return out;
    }

    getDiscord() {
        var out = '';

        this.suffix();

        this.phrase.forEach((c) => {
            switch (c['t']) {
                case 'prefix' :
                case 'suffix' :
                    // skip those ..
                    break;

                case 'sep' :
                    out += ' ** ø ** ';
                    break;

                case 'color' :
                    // bold allways
                    out += '__' + (c['is_nick'] ? '@' : '') + c['input'] + '__';
                    break;

                case 'text' :
                    if (c['bold']) {
                        out += '**' + (c['is_nick'] ? '@' : '') + c['input'] + '**';
                    } else {
                        out += (c['is_nick'] ? '@' : '') + c['input'];
                    }
                    break;

                case 'texth' :
                    if (c['is_nick']) {
                        out += '__' + (c['is_nick'] ? '@' : '') + c['input'] + '__';
                    } else {
                        out += '' + c['input'] + '';
                    }
                    break;
            }
        });

        //out = out.replace(new RegExp('\\*\\*\\*\\*', 'g'), '**');

        return out;
    }

    get() {
        return this.getIrc();
    }
}

export default WordCo;
