const puppeteer = require('puppeteer-extra')
const {executablePath} = require('puppeteer')

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const getDistanceBetweenTwoAddresses = require('./distance');
const image2text = require('./image2text');



function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}


async function scrapeBusinesses(businesses) {
    try{;
        const browser = await puppeteer.launch({headless: false, executablePath: executablePath()});
        const biziPage = await browser.newPage();
        const ajpesPage = await browser.newPage();
        const googlePage = await browser.newPage();

        await biziPage.setViewport({width: 2000, height: 1000});
        await ajpesPage.setViewport({width: 2000, height: 1000});
        await googlePage.setViewport({width: 2000, height: 1000});
        await ajpesPage.bringToFront();





        // ajpes login
        await ajpesPage.goto('https://www.ajpes.si/');
        await ajpesPage.click('.login');
        await ajpesPage.waitForSelector('#uporabnik');
        await ajpesPage.type('#uporabnik', 'galjeza');
        await ajpesPage.type('#geslo', 'Geslo123.');
        await delay(1000);
        await ajpesPage.click('[aria-describedby="login-msg"]');






        await biziPage.goto("https://www.google.com", {waitUntil: 'networkidle0'});
        await delay(3000);
        try{
            await biziPage.waitForSelector('#L2AGLb');
            await biziPage.click('#L2AGLb');
        }catch(e){
            console.log(e);
        }
        await delay(1000);
        for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];
            const biziSearchURL =   "https://www.bizi.si/iskanje?q=" + business.tax
            await biziPage.goto(biziSearchURL, {waitUntil: 'networkidle0'});
            await biziPage.waitForSelector('.b-company-title'); // počakaj da naloži stran


            const tableElements = await biziPage.$$('.col.b-table-cell.d-none.d-xl-block');
            business.dejavnostSKD = await biziPage.evaluate(el => el.textContent, tableElements[2]);





            await biziPage.click('.b-company-title');
            await biziPage.waitForSelector(".i-ostalo-telefon")

           business.phone = await biziPage.evaluate(() => {
                return document.querySelector('.b-link.i-ostalo-telefon').innerText;
            });

            business.email = await biziPage.evaluate(() => {
                return document.querySelector('.b-link.i-orodja-ovojnice').innerText;

            } );

            business.website = await biziPage.evaluate(() => {

                const website = document.querySelector('.b-link.i-ostalo-link').innerText;
                // check if website is valid
                if(website.includes("http")){
                    return website;
                }
                return null;
            });

            business.maticna = await biziPage.evaluate(() => {
                return  document.querySelectorAll('.col-6.b-attr-value.pl-1')[1].innerText.trim().replace(/\s+/g, '');

            });


            business.distanceFromCityCenter =  await getDistanceBetweenTwoAddresses(business.address, business.city);

            await ajpesPage.goto("https://www.ajpes.si/" );
            await ajpesPage.waitForSelector('#prva_OsnovnoIskanje');
            await ajpesPage.type('#prva_OsnovnoIskanje', business.tax);
            await delay(1000);
            await ajpesPage.click('.search');

            await ajpesPage.waitForSelector('.form-gray-print', {timeout: 10000});
            await delay(1000);


            // find element with text "Zastopnik" and get next element
            business.zastopnik = await ajpesPage.evaluate(() => {
                const zastopnikiString  = document.evaluate("//*[text()='Zastopniki']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.nextElementSibling.innerText;
                return zastopnikiString.split(",")[0];
            }
            );


            await ajpesPage.goto("https://www.ajpes.si/jolp/podjetje.asp?maticna=" + business.maticna);
            await ajpesPage.waitForSelector('.buttons-group');


            // check if there is element with class .captcha
            const captchaElement = await ajpesPage.$('.captcha');
            if(captchaElement){
                let captchaSolved = false;
                while(!captchaSolved) {
                    const capcthaImage = await ajpesPage.$('.captcha');
                    await capcthaImage.screenshot({path: 'captcha.png'});
                    let captchaText = await image2text('captcha.png');
                    captchaText = captchaText.replace(/[^a-zA-Z]/g, "");
                    captchaText = captchaText.toUpperCase();
                    await ajpesPage.type('#jolp_koda', captchaText);
                    await delay(5000);
                    await ajpesPage.click("#izjava_strinjam")
                    await ajpesPage.click(".pull-right.pull-right-mobile-disable.btn.btn-warning");
                    try {
                        // wait for element with class "buttons-group" to load
                        await ajpesPage.waitForSelector('.cell-links', {timeout: 5000});
                        // click on second child in element with class "cell-links"
                        captchaSolved = true;
                    }catch(e)
                    {
                        captchaSolved = false;
                    }
                }
            }else{
                await ajpesPage.waitForSelector('.cell-links', {timeout: 5000});
            }





            await ajpesPage.evaluate(() => {
                document.querySelector('.cell-links').children[1].click();
            });

            await ajpesPage.waitForSelector('.table.table-bordered');
            await delay(1000);
            business.annualIncome = await ajpesPage.evaluate(() => {
                return document.querySelectorAll('.text-right')[2].innerText;
            });

            // get element with class "table table-bordered" and get all children
            const tableRows = await ajpesPage.$$('.table.table-bordered tr');

            for (let i = 0; i < tableRows.length; i++) {
                const row = tableRows[i];
                const rowText = await ajpesPage.evaluate(el => el.innerText, row);
                // CHECK IF ROW CONTAINS "POVPREČNO ŠTEVILO ZAPOSLENIH"
                if(rowText.includes("POVPREČNO ŠTEVILO ZAPOSLENIH")){
                    const rowValues = rowText.split("\t");
                    business.averageNumberOfEmployees = rowValues[1].replace(",", ".");
                }
            }

            console.log(business);
            console.log("On business number:"+ (i+1));
        }


        await browser.close();
    }catch (e){
        console.log(e);
        await delay(1000000000);
    }

}

module.exports = scrapeBusinesses;