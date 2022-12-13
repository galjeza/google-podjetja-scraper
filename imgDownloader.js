const fs = require('fs'),
    http = require('http'),
    https = require('https');



const Stream = require('stream').Transform;



const downloadImageFromURL = (url, filename, callback) => {



    var client = http;

    if (url.toString().indexOf("https") === 0){

        client = https;

    }



    client.request(url, function(response) {

        var data = new Stream();



        response.on('data', function(chunk) {

            data.push(chunk);

        });



        response.on('end', function() {

            fs.writeFileSync(filename, data.read());

        });

    }).end();

};


module.exports = downloadImageFromURL;