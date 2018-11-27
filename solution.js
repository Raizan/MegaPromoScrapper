const rp = require('request-promise');
const Promise = rp.Promise = require('bluebird');
const cheerio = require('cheerio');
const rootUrl = 'https://www.bankmega.com/promolainnya.php';
const phpFilename = rootUrl.split('/').pop();

rp(rootUrl)
    .then(html => {
        const $ = cheerio.load(html);

        // ids and category title
        var categories = {};
        var idList = []; 
        
        // AJAX url for pagination
        var ajaxUrl = '';

        // product and subcat index table
        var indexTable = {};
        
        // get identifiers as a base to find cat url
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

        // get AJAX url for pagination
        // const getAjaxUrl = $(`script:contains(${phpFilename})`)
        //     .last().html();

        // var regex = /load\(\"(.+)\)/
        // ajaxUrl = getAjaxUrl.match(regex)[1];
        // ajaxUrl = ajaxUrl.split('+');

        // get AJAX url for product and subcat of each #identifier
        const getProductSubcatScript = $(`script:contains(${phpFilename})`).first().html();
        idList.forEach(id => {
            let regex = new RegExp(`${id}.+\\n.+load\\(\\"(.+)\\"`);
            if (!(id in indexTable)) {
                indexTable[id] = getProductSubcatScript.match(regex)[1] + `&page=`;
            }
        });

        // todo get max pages in pagination
        // todo create tasks for navigating pages
    })
    .catch(err => {
        console.error(err);
    })