 const imageURL = "https://www.ajpes.si/MDScripts/captcha.asp?id=jolp&now=13.12.2022%2019:44:48"
 const Tesseract = require('tesseract.js');
 Tesseract.recognize(
     'https://www.ajpes.si/MDScripts/captcha.asp?id=jolp&now=13.12.2022%2019:44:48',
     'eng',
     { logger: m => console.log(m) }
 ).then(({ data: { text } }) => {
     console.log(text);
 })

