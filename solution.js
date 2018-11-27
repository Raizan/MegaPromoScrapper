const rp = require('request-promise');
const Promise = rp.Promise = require('bluebird');
const cheerio = require('cheerio');
const rootUrl = 'https://www.bankmega.com/promolainnya.php';
const phpFilename = rootUrl.split('/').pop();

rp(rootUrl)
    .then(html => {
        const $ = cheerio.load(html);

        // get identifiers as a base to find cat url
        var categories = {};
        var idList = []; 
        const subcatPromo = $('#subcatpromo [title]');

        for (let i = 0; i < subcatPromo.length; i++) {
            var sub_id = subcatPromo[i].attribs.id
            idList.push(sub_id);
            if (!(sub_id in categories)) {
                categories[sub_id] = subcatPromo[i].attribs.title;
            }
        }

        const productPromo = 
            $(`div[id='promolain_inside'] ~ div`)
                .each(function(i, elem) {
                    idList.push(elem.attribs.id);
                    if (!(elem.attribs.id in categories)) {
                        categories[elem.attribs.id] = elem.children[0].data;
                    }
        });
    })
    .catch(err => {
        console.error(err);
    })