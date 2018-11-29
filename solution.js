const rp = require('request-promise');
const Promise = rp.Promise = require('bluebird');
const cheerio = require('cheerio');
const taskGenerator = require('./taskGenerator');
const fs = require('fs');
const config = require('./config.json');

const scrapUrl = config.scrapUrl;
const rootUrl = config.rootUrl;
const solutionFile = config.solutionFile;

const phpFilename = scrapUrl.split('/').pop();

console.time('Execution time');
rp(scrapUrl)
    .then(html => {
        const $ = cheerio.load(html);

        // ids and category title
        let categories = {};
        let idList = []; 
        
        // Product and subcat url table
        let categoryUrlTable = {};

        // Get identifiers as a base to find category url
        // For subcategory 
        const subcatPromo = $('#subcatpromo [title]');

        for (let i = 0; i < subcatPromo.length; i++) {
            let sub_id = subcatPromo[i].attribs.id
            idList.push(sub_id);
            if (!(sub_id in categories)) {
                categories[sub_id] = subcatPromo[i].attribs.title;
            }
        }
        // For product
        const productPromo = 
            $(`#promolain_inside ~ div`)
                .each(function(i, elem) {
                    idList.push(elem.attribs.id);
                    if (!(elem.attribs.id in categories)) {
                        categories[elem.attribs.id] = elem.children[0].data;
                    }
        });

        // Get AJAX url for product and subcat of each #identifier
        const getProductSubcatScript = $(`script:contains(${phpFilename})`).first().html();
        for (let id in categories) {
            let regex = new RegExp(`${id}.+\\n.+load\\(\\"(.+)\\"`);
            if (!(categories[id] in categoryUrlTable)) {
                let categoryUrl = getProductSubcatScript.match(regex)[1];
                categoryUrlTable[categories[id]] = `${rootUrl}/${categoryUrl}&page=`;
            }
        }
        
        // Feed generator with category links
        let promises = [];

        for (let cat in categoryUrlTable) {
            promises.push(taskGenerator(categoryUrlTable[cat], cat));
        }
        
        return Promise.all(promises)
            .then(results => {
                // Flatten into single object
                let merged = Object.assign(...results);
                let stringified = JSON.stringify(merged, null, 4);
                fs.writeFileSync(solutionFile, stringified);
                console.log("Scrapping done.");
                console.timeEnd('Execution time');
        });
    })
    .catch(err => {
        console.error(err);
    })
