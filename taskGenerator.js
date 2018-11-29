const rp = require('request-promise');
const cheerio = require('cheerio');
const Promise = rp.Promise = require('bluebird');
const fetchContents = require('./fetchContents');

/**
 * Generate tasks to scrap pages by executing fetchContents
 * as many as maximum page in pagination.
 * 
 * @param {string}  url     ajax.promolainnya.php?
 *                                      product=
 *                                      subcat=
 *                                      page=
 * @param {string}  categoryName
 * 
 * @returns {Object}    Object of objects grouped under categoryName
 */
 async function taskGenerator(url, categoryName) {
    return rp(url)
        .then(html => {
            const $ = cheerio.load(html);

            // List of generated urls with paging suffix
            let taskUrls = [];

            // Get max page string
            const getMaxPage = $(`#paging1`)[0].attribs.title;
            maxPage = getMaxPage.split(' ').pop();

            for (let i = 1; i <= maxPage; i++) {
                let pagingUrl = `${url}${i}`;
                taskUrls.push(pagingUrl);
            }
            
            return Promise.all(
                taskUrls.map(url => {
                    return fetchContents(url);
                })
            )
            .then(results => {
                let merged = {};
                // Flatten results into single array
                merged[categoryName] = [].concat.apply([], results);
                return merged;
            });
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports = taskGenerator;