const rp = require('request-promise');
const cheerio = require('cheerio');
const config = require('./config.json');
const rootUrl = config.rootUrl;

/**
 * Scrap promo detail in promo_detail.php. 
 * 
 * @param {string}  url     promo_detail.php?id=
 * 
 * @returns {Object}    Object of promo detail
 */
async function fetchDetail(url) {
    return rp(url)
        .then(html => {
            const $ = cheerio.load(html);
            const title = $(`.titleinside h3`).text();
            const area = $(`.area`).text().split(' ').pop().trim();
            let regex = /\n\t+/
            const periode = $(`.periode`).text()
                            .split(':')
                            .pop()
                            .trim()
                            .replace(regex, '');
            const image = $(`.keteranganinside img`)[0].attribs.src;

            return {
                'title': title,
                'area': area,
                'periode': periode,
                'image': `${rootUrl}${image}`
            };
        })
        .catch(err => {
            console.error(err);
        });
};

module.exports = fetchDetail;