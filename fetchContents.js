const rp = require('request-promise');
const cheerio = require('cheerio');
const Promise = rp.Promise = require('bluebird');
const fetchDetail = require('./fetchDetail');

const config = require('./config.json');
const rootUrl = config.rootUrl;

/**
 * Get all promo_detail.php links. Then, generate tasks to scrap 
 * detail of each promo_detail.php. External links and internal
 * links other than promo_detail.php will be scrapped in 
 * ajax.promolainnya.php.
 * 
 * @param {string}  url     ajax.promolainnya.php?
 *                                      product=
 *                                      subcat=
 *                                      page=
 * 
 * @returns {Array}     Promo detail results in array of objects
 */
async function fetchContents(url) {
        return rp(url)
            .then(html => {
                const $ = cheerio.load(html);

                // List of internal links
                let detailUrls = [];

                // Detail of promo which has link other than promo_detail.php
                let otherWebsitesDetail = [];
                const getPromoLain = 
                    $('#promolain a img').each(function(i, elem) {
                        let href = elem.parent.attribs.href;
                        if (href.includes(`promo_detail.php`)) {
                            detailUrls.push(`${rootUrl}/${href}`);
                        }
                        else {
                            // External links, fetch detail now
                            let detail = {};
                            let title = elem.attribs.title;
                            let image = elem.attribs.src;
                            detail['title'] = title;
                            detail['imageurl'] = href;
                            detail['image'] = `${rootUrl}/${image}`;

                            otherWebsitesDetail.push(detail);
                        }
                    });

                // Generate fetchDetail tasks
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
}

module.exports = fetchContents;