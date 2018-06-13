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

            var wRef, cont, pugCurrent = '', pugHistory = '', fs = require('fs');

            if (fs.existsSync("page.html") && (cont = fs.readFileSync('page.html', 'utf8')) != false) {

                this.operRef.cats.forEach((catRef) => {

                    wRef = catRef.addStatusReadable(WordCo.cre());

                    pugCurrent += '<p>' + wRef.getHtml() + '</p>';

                });

                var sf, hGameRef;

                for (sf = 0; sf < this.operRef.gameHistory.length && sf < 4; sf++) {

                    hGameRef = this.operRef.gameHistory[sf];
                    wRef = hGameRef.addStatusReadable(WordCo.cre(), true);

                    pugHistory += '<p>' + wRef.getHtml() + '</p>';

                }

                cont = cont.replace('{$seconds$}', ((new Date()).getTime() / 1000));
                cont = cont.replace('{$pugCurrent$}', pugCurrent);
                cont = cont.replace('{$pugHistory$}', pugHistory);

                fs.writeFile(this.operRef.htmlPagePath, cont, function(err) {
                    
                    // may be async

                });

            } // if
        } // if
    }
}

export default PageView;