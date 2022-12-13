const fs = require("fs");
const {isAlreadySaved} = require('./csvUtils');
const dayjs = require('dayjs');
const {parse} = require("json2csv");
const {stringToSave} = require("./csvUtils");
const getDistanceBetweenTwoAddresses = require('./distance');

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}
const scrapePage = async (url, page,pageNumber,cityObj,searchQuery) => {
    try{
        await page.goto(url);
        await delay(
            // wait for random time between 5 and 10 seconds
            Math.floor(Math.random() * 5000) + 5000
        );
        await page.waitForSelector('.rlfl__tls.rl_tls'); // počakaj da naloži vse rezultate


        await page.waitForSelector('.rllt__details');
        const elements = await page.$$('.rllt__details');
        await delay(
            // wait for random time between 5 and 10 seconds
            Math.floor(Math.random() * 5000) + 5000
        );
        for (let i = 0; i < elements.length; i++) {
            let website;
            let address;
            let phone;
            let workingHoursPerWeek = 0;
            let businessName;
            let rating;
            let reviews;
            let postalCode;
            let googleSearchPageNumber = pageNumber+1;
            await elements[i].click();
            await delay(
                Math.floor(Math.random() * 7 + 4) * 1000
            );

            phone = await page.evaluate(() => {
                    const element = document.querySelector('[aria-label="Pokliči"]');
                    if (element) {
                        return element.getAttribute('data-phone-number');
                    }
                    return "";
                }
            );
            try {
                const addressElement = await page.waitForSelector(".LrzXr", {timeout: 3000});
                const addressString = await addressElement.evaluate(naslovElement => naslovElement.textContent);
                address = addressString.split(',')[0].replace(",", "");
                postalCode = addressString.split(',')[1].replace(" ", "").replace(",", "");;
            } catch (e) {
                address = ""
            }


            businessName = await page.evaluate(() => {
                    const element = document.querySelector('[data-attrid="title"]');
                    if (element) {
                        return element.textContent;
                    }
                    return "";
                }
            );
            businessName = businessName.replace(",", " ").replace(",", "");


            try {
                website = await page.evaluate(() => {
                        const element = document.querySelector('.dHS6jb');
                        if (element?.href) {
                            return element.href;
                        }
                        return "";
                    }
                );
            } catch (e) {
                console.log(e);
                website = "";
            }

            try {
                const element = await elements[i].waitForSelector(".yi40Hd.YrbPuc", {timeout: 3000});
                rating = await element.evaluate(element => element.textContent);
                rating = rating.replace(",", ".");

            } catch (e) {
                rating = "";
            }

            try {
                const element = await elements[i].waitForSelector(".RDApEe.YrbPuc", {timeout: 3000});
                const reviewsString = await element.evaluate(element => element.textContent);
                reviews = reviewsString.replace("(", "").replace(")", "");

            } catch (e) {
                reviews = "";
            }


            // Delovni čas
            try {
                // click on element with class "bJpcZc"
                await page.waitForSelector('.BTP3Ac', {timeout: 3000});
                await page.click('.BTP3Ac');

                // click on element with class "bJpcZc"
                await delay(
                    3000
                );

                const tableRows = await page.$$('.WgFkxc tbody tr');
                for(let i = 0; i < tableRows.length; i++){
                    const hours = await tableRows[i].evaluate(element => element.children[1].textContent);
                    if(hours === "Zaprto"){
                        workingHoursPerWeek = workingHoursPerWeek + 0;
                    }else{
                        const start = hours.split("–")[0];
                        const end = hours.split("–")[1];

                        // calculate hour difference with dayjs
                        const startHour = start.split(":")[0];
                        const startMinute = start.split(":")[1];
                        const endHour = end.split(":")[0];
                        const endMinute = end.split(":")[1];
                        const startDayjs = dayjs().hour(startHour).minute(startMinute);
                        const endDayjs = dayjs().hour(endHour).minute(endMinute);
                        const hoursDifference = endDayjs.diff(startDayjs, 'hour');
                        const minutesDifference = endDayjs.diff(startDayjs, 'minute');
                        const minutesDifferenceWithoutHours = minutesDifference - (hoursDifference * 60);
                        const workingHours = hoursDifference + (minutesDifferenceWithoutHours / 60);
                        workingHoursPerWeek  = workingHoursPerWeek+ workingHours;
                    }
                }

            }catch (e) {
                console.log(e);
                workingHoursPerWeek = "";
            }
            const postCode = postalCode.split(" ")[0];
            const city = postalCode.split(" ")[1];
            const hasGoogleMyBusiness = workingHoursPerWeek === "" ? 0 : 1;
            const industry =  searchQuery
            const searchTerm = cityObj.ime + " " + searchQuery;


            let distance;
            const isSaved = isAlreadySaved(businessName);
            if (!isSaved) {
                try{
                    console.log("Računanje razdalje med" + address + " in " + city);
                     distance =  await getDistanceBetweenTwoAddresses(address, city);
                     console.log("Razdalja med" + address + " in " + city + " je " + distance);
                }catch (e) {
                    console.log(e);
                     distance = "";
                }


                const businessObject = {
                    businessName,
                    postCode,
                    city,
                    address,
                    phone,
                    website,
                    rating,
                    reviews,
                    googleSearchPageNumber,
                    workingHoursPerWeek,
                    hasGoogleMyBusiness,
                    cityObj,
                    industry,
                    distance,
                    searchTerm

                }

                const data = stringToSave(businessObject);

                fs.appendFileSync('scraped.csv', data, function (err) {
                        if (err) throw err;
                        console.log('Saved:' + businessName);
                    }
                );
            }
        }
        return true;
    }catch (e) {
        console.log(e);
        return false;
    }



}
module.exports = scrapePage;