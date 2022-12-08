const rotateIp =  ()=>{
    require('request-promise')({
        url: 'http://ipv4.webshare.io/',
        proxy: 'socks5://hnskvsyg-rotate:gzwsf5w64s3q@p.webshare.io:80'
    }).then(function(data){ console.log(data); }, function(err){ console.error(err); });
}


module.exports = rotateIp;