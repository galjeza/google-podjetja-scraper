const axios = require('axios');

function distanceBeetwenCoordinates(lat1, long1,lat2,long2){
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (long2-long1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // in metres
    // round to full meters
    console.log("d:", Math.round(d));
    return Math.round(d);
}


async function getDistanceBeetwenTwoAdresses(address1, address2) {
    try{
        const url1 = "http://api.positionstack.com/v1/forward?access_key=8c3970d37ed050172cb129a6052b6a82&query=" + address1
        const url2 = "http://api.positionstack.com/v1/forward?access_key=8c3970d37ed050172cb129a6052b6a82&query=" + address2
        const res1 = await axios.get(url1);
        const res2 = await axios.get(url2);
        const lat1 = res1.data.data[0].latitude;
        const long1 = res1.data.data[0].longitude;
        const lat2 = res2.data.data[0].latitude;
        const long2 = res2.data.data[0].longitude;
        return distanceBeetwenCoordinates(lat1, long1,lat2,long2);
    }
    catch(err){
        console.log(err);
        return "";
    }
}

module.exports = getDistanceBeetwenTwoAdresses;
