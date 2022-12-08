// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')
const {executablePath} = require('puppeteer')


// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const scrapePage = require('./scrapePage');


function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}


// seštevek klko ur delajo na teden
// oddaljenost od centra mesta
const mesto = 'Ljubljana';
const industrija = 'Frizerski saloni';

(async () => {
    try{
        const searchUrl = `https://www.google.com/search?q=${mesto}+${industrija}`;
        const browser = await puppeteer.launch({headless: false,args: [ '--proxy-server=149.14.243.178:9999', `--ignore-certificate-errors`,'--lang=sl,sl' ],executablePath: executablePath(),});
        const page = await browser.newPage();

        // Set the language forcefully on javascript
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "language", {
                get: function() {
                    return "sl";
                }
            });
            Object.defineProperty(navigator, "languages", {
                get: function() {
                    return ["sl", "en-GB", "en"];
                }
            });
        });
        await page.setViewport({width: 1200, height: 600});
        await page.goto(searchUrl, {waitUntil: 'networkidle0'});
        await delay(30000);

        try{
            await page.waitForSelector('#L2AGLb');
            await page.click('#L2AGLb');
        }catch(e){
            console.log(e);
        }



        await page.goto(searchUrl);


        // Pridobi google maps url za rezultate
        await page.waitForSelector('.tiS4rf.Q2MMlc');
        const resultLink = await page.evaluate(() => {
                const element = document.querySelector('.tiS4rf.Q2MMlc');
                return element.href;
            }
        );

        await page.goto(resultLink);

        // get element by id "ppnext"
        const pagesUrls = [];
        pagesUrls.push(page.url());
        while (await page.$('#pnnext') !== null) {
            const nextPage = await page.evaluate(() => {
                    const element = document.querySelector('#pnnext');
                    return element.href;
                }
            );
            await page.goto(nextPage);
            // check if url is already in array
            if (!pagesUrls.includes(page.url())) {
                pagesUrls.push(page.url());
            }
            delay(1000);
        }

        // scrape all pages
        const businesses = [];
        for (let i = 0; i < pagesUrls.length; i++) {
            const businessesOnPage = await scrapePage(pagesUrls[i], page);
            // ad page numbe (i) to each business
            businessesOnPage.forEach(business => {
                business.pageOnGoogleMaps = i;
            });
            businesses.push(...businessesOnPage);
            // go throught all buissneses and add page number attribute to them

        }

        // remove all duplicates from businesses array
        const uniqueBusinesses = [...new Set(businesses.map(business => business.name))].map(name => {
                return businesses.find(business => business.name === name)
            }
        );


        await browser.close();
    }catch (e){
        console.log(e);
        await delay(1111111111)
    }

})();