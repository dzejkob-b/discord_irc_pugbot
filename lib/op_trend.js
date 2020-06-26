import WordCo from './word_co';
import TimeUtils from './utils/time';

class OpTrend {
    constructor(parent) {

        this.parent = parent;

    }

    exec(channelKey) {
        let operRef = this.parent, catRef, md, cStk = this.parent.cStk, partRef = this.parent.partRef, privPartRef = this.parent.privPartRef;

        if (!operRef.anyCats(channelKey)) {
            partRef.noticeMessage(operRef, WordCo.cre().text('No available pugs in this channel!'));

        } else if ((catRef = operRef.getCatRef(channelKey, cStk.popMod(channelKey))) == null) {

            if (cStk.first()) {
                partRef.noticeMessage(operRef, WordCo.cre().text('No such pug ').texth(cStk.first()).text('!'));

            } else {
                partRef.noticeMessage(operRef, WordCo.cre().text('Specify pug for trend stats!'));
            }

        } else {
            var dNum = parseInt(cStk.pop());
            if (isNaN(dNum)) dNum = 30;
            
            if (dNum < 7) dNum = 7;
            else if (dNum > 180) dNum = 180;

            operRef.statsRef.getTrendStats(catRef, TimeUtils.getDaysList(dNum), (result) => {

                var x_sum = 0;
                var x_sum_squares = 0;
                var y_sum = 0;
                var k_sum = 0;

                var idx = 0;
                var idx_hash = {};
                var idx_hash_length = 0;
                var dt;

                while (idx < result.length) {
                    dt = TimeUtils.dateToSql(result[idx]['day']);

                    if (!idx_hash[dt]) {
                        var tm_idx;

                        idx_hash[dt] = {
                            'idx' : tm_idx = idx_hash_length,
                            'cnt' : 1,
                            'value' : result[idx]['count'],
                            'incl' : true
                        };
                        idx_hash_length++;

                        x_sum += tm_idx;
                        x_sum_squares += tm_idx * tm_idx;

                    } else {
                        idx_hash[dt]['cnt']++;
                        idx_hash[dt]['value'] += result[idx]['count'];
                    }

                    idx++;
                }

                for (dt in idx_hash) {
                    if (idx_hash[dt]['incl']) {
                        y_sum += idx_hash[dt]['value'];
                        k_sum += idx_hash[dt]['idx'] * idx_hash[dt]['value'];
                    }
                }

                var a_div = (idx_hash_length * x_sum_squares - Math.pow(x_sum, 2)), a, b, c;

                if (a_div == false) {
                    a = 0;
                } else {
                    a = ((idx_hash_length * k_sum) - x_sum * y_sum) / a_div;
                }
                
                b = (y_sum - x_sum * a) / idx_hash_length;

                idx = 0;

                while (idx < result.length) {
                    c = idx_hash[TimeUtils.dateToSql(result[idx]['day'])];

                    if (c['incl']) {
                        result[idx]['count_trend'] = (a * c['idx'] + b) / c['cnt'];
                    }

                    idx++;
                }

                var tr_start = result[result.length - 1]['count_trend'];
                var tr_end = result[0]['count_trend'];

                var wRef = WordCo.cre();

                wRef.text(catRef.flag.toUpperCase(), true);
                wRef.text(' count of daily pugs trend for past ').texth(dNum).text(' days is: <from: ');
                wRef.texth(Math.round(tr_start * 100) / 100, true);
                wRef.text(' to: ');
                wRef.texth(Math.round(tr_end * 100) / 100, true);
                wRef.text('>.');

                operRef.msgRef.sendMsg(channelKey, wRef, privPartRef);

            });

        }
    }
}

export default OpTrend;