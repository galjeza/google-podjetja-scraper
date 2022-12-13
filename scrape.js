const puppeteer = require('puppeteer-extra')
const {executablePath} = require('puppeteer')


const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const scrapePage = require('./scrapePage');


function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}


async function scrapeIndustryByCity(cityObj, searchQuery){
    try{
        const searchUrl = `https://www.google.com/search?q=${cityObj.ime}+${searchQuery}`;
        const browser = await puppeteer.launch({headless: false, executablePath: executablePath()});
        const page = await browser.newPage();
        await page.setViewport({width: 1200, height: 600});
        await page.goto(searchUrl, {waitUntil: 'networkidle0'});
        await delay(3000);

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
            if (!pagesUrls.includes(page.url())) {
                pagesUrls.push(page.url());
            }
            await delay(
                Math.floor(Math.random() * 10 + 7) * 1000
            );
        }


        for (let i = 0; i < pagesUrls.length; i++) {
            await scrapePage(pagesUrls[i], page,i, cityObj, searchQuery);
        }

        await browser.close();
    }catch (e){
        console.log(e);
        await delay(1000000000);
    }

}

module.exports = scrapeIndustryByCity;