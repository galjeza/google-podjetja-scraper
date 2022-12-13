const fs = require('fs');


const isAlreadySaved = (businessName) => {
    // check if businessName is anywhere in the csv file
    const csv = fs.readFileSync('scraped.csv', 'utf8');
    const csvArray = csv.split("\r\n");
    for (let i = 0; i < csvArray.length; i++) {
        if (csvArray[i].includes(businessName)) {
            return true;
        }
    }
}

const stringToSave = (businessObj) => {
    //Email,First name,Last nam,Phone number,Website URL,Latest source date,Industrija,Annual revenue,St. zaposlenih,Company name,City,Postal code,Street address,St. prebivalcev,Fax number,Lead status,Lifecycle stage,Contact owner,Oddaljenost od mesta,Google my business,Ure na teden,Stran na google,Ocena,Search term,St. ocen
    let stringToSave = "\r\n";
    stringToSave = stringToSave   + ","; // Email
    stringToSave = stringToSave + ","; // First name
    stringToSave = stringToSave  + ","; // Last name
    stringToSave = stringToSave + businessObj.phone + ","; // Phone number
    stringToSave = stringToSave + businessObj.website + ","; // Website URL
    stringToSave = stringToSave  + ","; // Latest source date
    stringToSave = stringToSave + businessObj.industry + ","; // Industrija
    stringToSave = stringToSave + ",";  // Annual revenue
    stringToSave = stringToSave +","; // St. zaposlenih
    stringToSave = stringToSave + businessObj.businessName + ","; // Company name
    stringToSave = stringToSave + businessObj.city + ","; // City
    stringToSave = stringToSave + businessObj.postCode + ","; // Postal code
    stringToSave = stringToSave + businessObj.address + ","; // Street address

    stringToSave = stringToSave + businessObj.cityObj.prebivalci + ","; // St. prebivalcev
    stringToSave = stringToSave + ","; // Fax number
    stringToSave = stringToSave  + ","; // Lead status
    stringToSave = stringToSave  + ","; // Lifecycle stage
    stringToSave = stringToSave  + ","; // Contact owner
    stringToSave = stringToSave + businessObj.distance + ","; // Oddaljenost od mesta
    stringToSave = stringToSave + businessObj.hasGoogleMyBusiness + ","; // Google my business
    stringToSave = stringToSave + businessObj.workingHoursPerWeek + ","; // Ure na teden
    stringToSave = stringToSave + businessObj.googleSearchPageNumber + ","; // Stran na google
    stringToSave = stringToSave + businessObj.rating + ","; // Ocena
    stringToSave = stringToSave + businessObj.searchTerm + ","; // Search term
    stringToSave = stringToSave + businessObj.reviews + ","; // St. ocen
    return stringToSave;

}

module.exports = {
    isAlreadySaved,
    stringToSave
}