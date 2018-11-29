const rp = require('request-promise');
const cheerio = require('cheerio');
const Promise = rp.Promise = require('bluebird');
const fetchDetail = require('./fetchDetail');

const config = require('./config.json');
const rootUrl = config.rootUrl;
const url = 'https://www.bankmega.com/ajax.promolainnya.php?product=0&subcat=1&page=1';
const urlTable = { 
   travel:
    'https://www.bankmega.com/ajax.promolainnya.php?product=0&subcat=1&page=',
   lifestyle:
    'https://www.bankmega.com/ajax.promolainnya.php?product=0&subcat=2&page=',
   fnb:
    'https://www.bankmega.com/ajax.promolainnya.php?product=0&subcat=3&page=',
   gadget_entertainment:
    'https://www.bankmega.com/ajax.promolainnya.php?product=0&subcat=4&page=',
   dailyneeds:
    'https://www.bankmega.com/ajax.promolainnya.php?product=0&subcat=5&page=',
   others_promo:
    'https://www.bankmega.com/ajax.promolainnya.php?product=0&subcat=6&page=',
   kartukredit:
    'https://www.bankmega.com/ajax.promolainnya.php?product=1&page=',
   ebanking:
    'https://www.bankmega.com/ajax.promolainnya.php?product=4&page=',
   simpanan:
    'https://www.bankmega.com/ajax.promolainnya.php?product=2&page=',
   others:
    'https://www.bankmega.com/ajax.promolainnya.php?product=0&subcat=6&page=' 
};
// receives url that inc [prod,subcat,page]
// get all promo_detail urls
// returns list of fetchDetail + other infos which require no further access

        rp(url)
            .then(html => {
                const $ = cheerio.load(html);
                var detailUrls = [];
                var otherWebsitesDetail = [];
                const getPromoLain = 
                    $('#promolain a img').each(function(i, elem) {
                        let href = elem.parent.attribs.href;
                        if (href.includes(`promo_detail.php`)) {
                            detailUrls.push(rootUrl + href);
                        }
                        else {
                            let detail = {};
                            let title = elem.attribs.title;
                            let image = elem.attribs.src;
                            detail['title'] = title;
                            detail['imageurl'] = href;
                            detail['image'] = rootUrl + image;

                            otherWebsitesDetail.push(detail);
                        }
                    });

                // generate fetchDetail tasks
                // returns list of fetchDetail results + otherWebsitesDetail
                return Promise.all(
                        detailUrls.map(url => {
                            return fetchDetail(url);
                        }))
                        .then(results => {
                            return results.concat(otherWebsitesDetail);
                        });
                
            })
            .catch(err => {
                console.error(err);
            });
