const scrapeIndustryByCity = require('./scrape');
const fs = require("fs");
const cities = require("./mesta.json");


(  async () => {
    const cities = require('./mesta.json');


    const fs = require('fs');
    const searchQueries = fs.readFileSync('searchQueries.txt', 'utf8');
    const searchQueriesArray = searchQueries.split("\r\n");
    for (let i = 0; i < cities.length; i++) {
        if (cities[i].ime === "Maribor" || cities[i].ime === "Ptuj") {
            for (let j = 0; j < searchQueriesArray.length; j++) {
                console.log("Scraping: " + cities[i].ime + " " + searchQueriesArray[j]);
                await scrapeIndustryByCity(cities[i], searchQueriesArray[j]);
            }
        }
    }

})();
