class WordCo {
    constructor() {
        this.phrase = []
        this.haveSuffix = false
    }

    static cre() {
        var ref = new WordCo()

        ref.prefix()

        return ref
    }

    isBlank() {
        var idx = 0,
            cnt = 0

        while (idx < this.phrase.length) {
            if (
                this.phrase[idx]['t'] == 'prefix' ||
                this.phrase[idx]['t'] == 'suffix' ||
                this.phrase[idx]['t'] == 'sep'
            ) {
                // blank
            } else {
                cnt++
                break
            }

            idx++
        }

        return cnt == 0
    }

    prefix() {
        this.phrase.push({ t: 'prefix' })

        return this
    }

    suffix() {
        if (!this.haveSuffix) {
            this.phrase.push({ t: 'suffix' })
            this.haveSuffix = true
        }

        return this
    }

    sep() {
        this.phrase.push({ t: 'sep' })

        return this
    }

    discordSep() {
        this.phrase.push({ t: 'discordSep' })

        return this
    }

    color(input, color, bold, is_nick) {
        let col = '15'

        switch (color) {
            case 'red':
            case '04':
                col = '04'
                break
            case 'blue':
            case '02':
            case '12':
                col = '12'
                break
            case 'green':
            case '03':
                col = '03'
                break
            case 'yellow':
            case '08':
                col = '08'
                break
        }

        this.phrase.push({
            t: 'color',
            input: input,
            color: col,
            bold: bold,
            is_nick: is_nick,
        })

        return this
    }

    getHtmlColor(input) {
        switch (input) {
            case '00':
            case '0':
                return 'white'

            case '01':
            case '1':
                return 'black'

            case '03':
            case '3':
                return '#1E90FF'

            case '04':
            case '4':
            case 'red':
                return 'red'

            case '05':
            case '5':
                return 'brown'

            case '06':
            case '6':
                return 'purple'

            case '07':
            case '7':
                return 'orange'

            case '08':
            case '8':
            case 'yellow':
                return 'yellow'

            case '09':
            case '9':
            case 'green':
                return 'green'

            case '10':
                return 'teal'

            case '11':
                return 'cyan'

            case '12':
            case 'blue':
                return 'lightblue'

            case '13':
                return 'pink'

            case '14':
                return 'grey'

            case '15':
                return 'lightgrey'
        }

        return ''
    }

    text(input, bold, is_nick) {
        this.phrase.push({
            t: 'text',
            input: input,
            bold: bold,
            is_nick: is_nick,
        })

        return this
    }

    textDiscord(input, bold, is_nick) {
        this.phrase.push({
            t: 'textDiscord',
            input: input,
            bold: bold,
            is_nick: is_nick,
        })

        return this
    }

    texth(input, bold, is_nick) {
        this.phrase.push({
            t: 'texth',
            input: input,
            bold: bold,
            is_nick: is_nick,
        })

        return this
    }

    textNick(input, bold, discordId) {
        this.phrase.push({
            t: 'textNick',
            input: input,
            bold: bold,
            discordId: discordId,
        })

        return this
    }

    channelLink(struct, prefix, suffix) {
        this.phrase.push({
            t: 'channelLink',
            input: struct,
            prefix: prefix,
            suffix: suffix,
        })

        return this
    }

    updateHashes() {
        var idx = 0,
            c,
            key

        while (idx < this.phrase.length) {
            c = this.phrase[idx]

            var hash = ''

            for (key in c) {
                if (
                    typeof c[key] != 'undefined' &&
                    key != 'input' &&
                    key != 'discordId'
                ) {
                    if (c[key] === true) {
                        hash += (hash == '' ? '' : '~') + key
                    } else if (c[key] === false) {
                        // nothing
                    } else {
                        hash += (hash == '' ? '' : '~') + c[key]
                    }
                }
            }

            this.phrase[idx]['hash'] = hash

            idx++
        }
    }

    getIrc() {
        var out = '',
            idx = 0,
            c

        this.suffix()

        out += '\x0315,01'

        this.updateHashes()

        while (idx < this.phrase.length) {
            c = this.phrase[idx]

            var wasSameHash =
                idx > 0 && this.phrase[idx - 1]['hash'] == c['hash']
            var willBeBold =
                idx + 1 < this.phrase.length && this.phrase[idx + 1]['bold']

            switch (c['t']) {
                case 'prefix':
                    out += '\x0304' + '\x02' + 'ø ' + '\x02' // + "\x0F";
                    break

                case 'suffix':
                    out += '\x0304' + '\x02' + ' ø' + '\x02' // + "\x0F";
                    break

                case 'sep':
                    out += '\x0304' + '\x02' + ' ø ' + '\x02' // + "\x0F";
                    break

                case 'discordSep':
                    // nothing ...
                    break

                case 'color':
                    if (wasSameHash) {
                        out += c['input']
                    } else {
                        out +=
                            '\x03' +
                            c['color'] +
                            (c['bold'] ? '\x02' : '') +
                            c['input'] // + "\x0F";
                    }

                    if (c['bold'] && !willBeBold) out += '\x02'
                    break

                case 'channelLink':
                    if (c['input']['channelIrc']) {
                        out +=
                            c['prefix'] + c['input']['channelIrc'] + c['suffix']
                    } else {
                        out += c['prefix'] + 'discord only' + c['suffix']
                    }
                    break

                case 'text':
                    out += '\x0315' + (c['bold'] ? '\x02' : '') + c['input'] // + "\x0F";
                    if (c['bold'] && !willBeBold) out += '\x02'
                    break

                case 'textNick':
                    out += '\x0315' + (c['bold'] ? '\x02' : '') + c['input'] // + "\x0F";
                    if (c['bold'] && !willBeBold) out += '\x02'
                    break

                case 'textDiscord':
                    // nothing ...
                    break

                case 'texth':
                    out += '\x0314' + (c['bold'] ? '\x02' : '') + c['input'] // + "\x0F";
                    if (c['bold'] && !willBeBold) out += '\x02'
                    break
            }

            idx++
        }

        return out
    }

    normalizeDiscord(value) {
        // the type might be 'number'
        return typeof value == 'string'
            ? value
                  .replace(/`/g, '\\`')
                  .replace(/\*/g, '\\*')
                  .replace(/_/g, '\\_')
                  .replace(/~/g, '\\~')
            : value
    }

    removeSpecialCharacters(value) {
        return typeof value == 'string' ? value.replace(/\\/g, '') : value
    }

    getDiscord() {
        var out = ''

        this.suffix()

        // bla bla

        this.phrase.forEach((c) => {
            switch (c['t']) {
                case 'prefix':
                case 'suffix':
                    // skip those ..
                    break

                case 'sep':
                case 'discordSep':
                    out += ':white_small_square:'
                    break

                case 'color':
                    // bold never
                    out += this.normalizeDiscord(c['input'])
                    break

                case 'channelLink':
                    if (c['input']['channelDiscord']) {
                        out +=
                            c['prefix'] +
                            '<#' +
                            c['input']['channelDiscord'] +
                            '>' +
                            c['suffix']
                    } else {
                        out += c['prefix'] + 'irc only' + c['suffix']
                    }
                    break

                case 'text':
                case 'textDiscord':
                    // do NOT normalize text here

                    if (c['bold']) {
                        if (out.substr(out.length - 2) == '**') out += ' '
                        out += '**' + c['input'] + '**'
                    } else {
                        out += c['input']
                    }
                    break

                case 'textNick':
                    if (c['bold']) {
                        if (out.substr(out.length - 2) == '**') out += ' '
                        out +=
                            '**' +
                            (c['discordId']
                                ? '<@' + c['discordId'] + '>'
                                : this.normalizeDiscord(c['input'])) +
                            '**'
                    } else {
                        out += c['discordId']
                            ? '<@' + c['discordId'] + '>'
                            : this.normalizeDiscord(c['input'])
                    }
                    break

                case 'texth':
                    if (c['is_nick']) {
                        if (out.substr(out.length - 2) == '__') out += ' '
                        out += '__' + this.normalizeDiscord(c['input']) + '__'
                    } else {
                        out += '' + this.normalizeDiscord(c['input']) + ''
                    }
                    break
            }
        })

        //out = out.replace(new RegExp('\\*\\*\\*\\*', 'g'), '**');

        return out
    }

    getHtml(skipPrefixSuffix = false) {
        var out = '',
            idx = 0,
            c,
            useColor

        this.suffix()

        while (idx < this.phrase.length) {
            c = this.phrase[idx]

            switch (c['t']) {
                case 'prefix':
                    if (!skipPrefixSuffix) {
                        out += "<span class='sep'>" + 'ø ' + '</span>'
                    }
                    break

                case 'suffix':
                    if (!skipPrefixSuffix) {
                        out += "<span class='sep'>" + ' ø' + '</span>'
                    }
                    break

                case 'sep':
                    out += "<span class='sep'>" + ' ø ' + '</span>'
                    break

                case 'discordSep':
                    // nothing ...
                    break

                case 'color':
                    if ((useColor = this.getHtmlColor(c['color'])) != false) {
                        out += c['bold']
                            ? '<strong style="color : ' +
                              useColor +
                              '">' +
                              c['input'] +
                              '</strong>'
                            : '<span style="color : ' +
                              useColor +
                              '">' +
                              c['input'] +
                              '</span>'
                    } else {
                        out += c['bold']
                            ? '<strong>' + c['input'] + '</strong>'
                            : '<span>' + c['input'] + '</span>'
                    }
                    break

                case 'text':
                    out += c['bold']
                        ? '<strong>' + c['input'] + '</strong>'
                        : '<span>' + c['input'] + '</span>'
                    break

                case 'textNick':
                    out += c['bold']
                        ? '<strong>' + c['input'] + '</strong>'
                        : '<span>' + c['input'] + '</span>'
                    break

                case 'textDiscord':
                    // nothing ...
                    break

                case 'texth':
                    useColor = this.getHtmlColor('14')
                    out += c['bold']
                        ? '<strong style="color : ' +
                          useColor +
                          '">' +
                          c['input'] +
                          '</strong>'
                        : '<span style="color : ' +
                          useColor +
                          '">' +
                          c['input'] +
                          '</span>'
                    break
            }

            idx++
        }

        return this.removeSpecialCharacters(out)
    }

    get() {
        return this.getIrc()
    }
}

export default WordCo
