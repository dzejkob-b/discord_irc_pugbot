import WordCo from './word_co';
import Catalog from './catalog';
import Team from './team';
import Game from './game';

class PageView {
    constructor(operRef) {

        this.operRef = operRef;

    }

    doCompose() {
        if (this.operRef.htmlPagePath) {

            var wRef, cont, pugCurrent = '', pugHistory = '', pugRules = '', pugBans = '', fs = require('fs');

            if (fs.existsSync("page.html") && (cont = fs.readFileSync('page.html', 'utf8')) != false) {

                this.operRef.cats.forEach((catRef) => {

                    wRef = catRef.addStatusReadable(WordCo.cre(), false, this.operRef.voteRef);

                    pugCurrent += '<p>' + wRef.getHtml() + '</p>';

                });

                var sf, hGameRef;

                for (sf = 0; sf < this.operRef.historyRef.gameHistory.length && sf < 4; sf++) {

                    hGameRef = this.operRef.historyRef.gameHistory[sf];
                    wRef = hGameRef.addStatusReadable(WordCo.cre(), true);

                    pugHistory += '<p>' + wRef.getHtml() + '</p>';

                }

                sf = 1;

                while (this.operRef.textCommands["rule" + sf]) {
                    pugRules += '<p>' + this.operRef.textCommands["rule" + sf].join('<br/>') + '</p>';

                    sf++;
                }

                var banKey, cBan;

                for (banKey in this.operRef.banUsers) {
                    cBan = this.operRef.banUsers[banKey];

                    wRef = WordCo.cre();

                    if (cBan['partRef']) {
                        wRef.texth(cBan['partRef'].readableInfo_b());
                    } else {
                        wRef.texth(banKey);
                    }

                    if (cBan['duration'] == 0) {
                        wRef.text(' permanently banned by ').texth(cBan['by'].nick).text(' for: ').texth(cBan['reason']);

                    } else {
                        wRef.text(' banned by ').texth(cBan['by'].nick).text(' for ').texth(cBan['duration']).text(' hours: ').texth(cBan['reason']);
                    }

                    if (cBan['mask'] && Array.isArray(cBan['mask']) && cBan['mask'].length > 0) {
                        wRef.text(' (masks: ').texth(cBan['mask'].join(', ')).text(')');
                    }

                    pugBans += '<p>' + wRef.getHtml() + '</p>';
                }

                if (!pugBans) {
                    pugBans += '<p>Nobody was banned.</p>';
                }

                cont = cont.replace('{$seconds$}', ((new Date()).getTime() / 1000));
                cont = cont.replace('{$pugCurrent$}', pugCurrent);
                cont = cont.replace('{$pugHistory$}', pugHistory);
                cont = cont.replace('{$pugRules$}', pugRules);
                cont = cont.replace('{$pugBans$}', pugBans);

                fs.writeFile(this.operRef.htmlPagePath, cont, function(err) {
                    
                    // may be async

                });

            } // if
        } // if
    }
}

export default PageView;