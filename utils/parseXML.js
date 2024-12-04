const DOMParser = require('../miniprogram_npm/xmldom/index').DOMParser;

const parseXML = xmlString => {
  try {
    const xmlData = xmlString.replace(/&nbsp;/g, '\u00A0').replace(/&laquo;/g, '\u00AB').replace(/&raquo;/g, '\u00BB').replace(/(\w+=")([^"]*)(?![^"]*")/, '$1"$2"')
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
    return xmlDoc;
  } catch (error) {
    console.error();
    throw error;
  }
}

module.exports = {
  parseXML
}