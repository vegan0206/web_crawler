const cheerio = require('cheerio');
const fs = require('fs');

const axios =require('axios');

axios.get('http://www.chemicalbook.com/CASDetailList_0.htm').then(response => {
	// fs.writeFile('1.html', JSON.stringify(response.data), e => {
	// 	console.info(e);
	// });
});