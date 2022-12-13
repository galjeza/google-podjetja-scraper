const scrapeBussineses = require('./scrape');
const fs = require("fs");
const cities = require("./mesta.json");
const { parse } = require("csv-parse");






(  async () => {
    const cities = require('./mesta.json');
    const businesses = [];
    fs.createReadStream("./ajpes-izvoz.csv")
        .pipe(parse({ delimiter: ",", from_line: 2, to_line: 4776 }))
        .on("data", function (row) {
            const business = {
                tax: row[0],
                name: row[1],
                address: row[2],
                zip: row[3],
                city: row[4],

            }
            businesses.push(business);
        })
        .on("error", function (error) {
            console.log(error.message);
        })
        .on("end", async function () {
            console.log("done");
            console.log(businesses.length);
            await scrapeBussineses(businesses);

        });

    })();
