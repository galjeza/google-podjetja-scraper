const Tesseract = require("tesseract.js");


const image2text = async (image) => {
    const data = await Tesseract.recognize(image, 'eng');
    return data.data.text;
}



module.exports = image2text;