
const rotateIP = require('./rotateIP');

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

const scrapePage = async (url, page) => {
    await rotateIP();
    const ip = require("ip");
    console.dir ( ip.address() );
    const businesses = [];
    await page.goto(url);
    await delay(3000);
    await page.waitForSelector('.rlfl__tls.rl_tls'); // počakaj da naloži vse rezultate


     await page.waitForSelector('.rllt__details');
    const elements = await page.$$('.rllt__details');
    await delay(1000);
    for (let i = 0; i < elements.length; i++) {
        let website = ""
        let address = ""
        let phone = ""
        let email = ""
        let workingHours = ""
        let distance = ""
        let businessName = ""
        let rating = ""
        let reviews = ""
        let postalCode = ""
        await elements[i].click();
        await delay(1000);


        phone = await page.evaluate(() => {
                const element = document.querySelector('[aria-label="Pokliči"]');
                if (element) {
                    return element.getAttribute('data-phone-number');
                }
                return "Ni podatka";
            }
        );
        try {
            const addressElement = await page.waitForSelector(".LrzXr", {timeout: 1000});
            const addressString = await addressElement.evaluate(naslovElement => naslovElement.textContent);
            address = addressString.split(',')[0];
            postalCode = addressString.split(',')[1];
        } catch (e) {
            address = "Ni podatka"
        }


        businessName = await page.evaluate(() => {
                const element = document.querySelector('[data-attrid="title"]');
                if (element) {
                    return element.textContent;
                }
                return "Ni podatka";
            }
        );

        try {
            const element = await elements[i].waitForSelector(".yYlJEf.Q7PwXb.L48Cpd", {timeout: 1000});
            website = await element.evaluate(element => element.href);
        } catch (e) {
            website = "Ni podatka";
        }

        try {
            const element = await elements[i].waitForSelector(".yi40Hd.YrbPuc", {timeout: 1000});
            rating = await element.evaluate(element => element.textContent);

        } catch (e) {
            rating = "Ni podatka";
        }

        try {
            const element = await elements[i].waitForSelector(".RDApEe.YrbPuc", {timeout: 1000});
            const reviewsString = await element.evaluate(element => element.textContent);
            reviews = reviewsString.replace("(", "").replace(")", "");

        } catch (e) {
            reviews = "Ni podatka";
        }

        const businessObject = {
            businessName,
            postalCode,
            address,
            phone,
            website,
            rating,
            reviews
        }
        businesses.push(businessObject);

        // add buisnesses to json file
        fs.appendFile('businesses.json', JSON.stringify(businessObject) + ',', function (err) {
            if (err) throw err;
            console.log('Saved!');
        }
        );


    }
    return businesses;
}

module.exports = scrapePage;