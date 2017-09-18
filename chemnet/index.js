/**
 * 
 * @authors veganQian
 * @date    2017-09-18 10:13:02
 * @version $Id$
 */
const cheerio = require('cheerio');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const needle = require('needle');
const iconv = require('iconv-lite');
const mongoBase = require("../config/mongoBase");
const collection = 'chemnet';
const model = mongoBase.model({url: path.join(__dirname + '/schema.js'), collection: collection});

const mir = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','09'];
const maxPage = mir.length;
needle.defaults({
	headers: {
		'User-Agent': 'Fiddler'
	},
	proxy: 'http://127.0.0.1:8888'
});

let getPage = (i) => {	
	let count = i;
	needle('get', 'http://china.chemnet.com/hot-product/' + mir[i] + '.html').then(response => {
		let $ = cheerio.load(response.body);
		let $el = $('.elist li');
		let len = $el.length;
		let promise = new Promise((rs, rj) => {				
			// 循环取出数据
			let getList = (index = 0) =>{
				let promise = new Promise((resolve, reject) => {				
					let data = ['enName', 'zhName', 'CAS'];
					let doc = {
						zhInfo: {
							company: []
						}, 
						enInfo: {
							company: []
						}
					}
					doc.enName = $($el[index]).find('a').eq(0).html().replace(/<!--.+-->/, '').trim();
					doc.zhName = $($el[index]).find('a').eq(1).html().replace(/<!--.+-->/, '').trim();
					doc.CAS = $($el[index]).find('b').eq(0).html().replace(/<!--.+-->/, '').trim();
					/* 获取中英文数据 */
					Promise.all([
						needle('get', $($el[index]).find('a').eq(0).attr('href')),
						needle('get','http://china.chemnet.com' + $($el[index]).find('a').eq(1).attr('href'))
					]).then(response => {
						// en
						(()=> {
							let $ = cheerio.load(response[0].body);
							let data = {
								'Product Name':	'enName',
								'Synonyms': 'synonyms',
								'CAS RN': 'CAS',
								'EINECS': 'EINECS',
								'Molecular Weight': 'molecularWeight',
								'Molecular Formula': 'molecularFormula',
								'Melting Point': 'meltingPoint',
								'Boiling Point': 'boilingPoint',
								'Flash Point':	'flashPoint',
								'Water Solubility': 'waterSolubility',
								'Hazard Symbols': 'dangerousMark',	
								'Risk Codes': 'riskCodes',
								'Safety Description': 'safetyDescription'
							}
							let keys = Object.keys(data);
							$('#search-left').find('table').find('tr').each((index, item) => {
								let key = $(item).find('td').eq(0).text().replace(/(\(℃\))?:/, '');
								let val = $(item).find('td').eq(1).text().replace(/Details/g, '').trim();
								for(let i = 0, len = keys.length; i < len; ++i) {
									if(key.indexOf(keys[i]) != -1){
										doc.enInfo[data[keys[i]]] = val;
										break;
									}
								}
							})
							doc.enInfo.img = $('#search-left center img').attr('src')
							doc.enInfo.company = 'http://www.chemnet.com' + $('.page a').eq(0).attr('href')
						})();

						// zh
						(()=> {
							let $ = cheerio.load(response[1].body);
							let keys = ['zhName', 'enName', 'synonyms', 'CAS', 'EINECS', 'molecularFormula', 'molecularWeight', 'dangerousMark', 'riskCodes', 'safetyDescription', 'physicalProperties', 'application', 'img', 'material', 'product' ]

							$('.left.dl-left').find('table').find('tr').each((index, item) => {
								let $el = $(item).find('td');
								let val = $el.length == 1 ? $el.find('a').attr('href') : $el.eq(1).text().trim();
								doc.zhInfo[keys[index]] = val;
							})
							doc.zhInfo.company = 'http://www.chemnet.com' + $('.gys h6 a').eq(0).attr('href')
						})();
						doc.enName = doc.enInfo.enName || doc.enName
						doc.zhName = doc.zhInfo.zhName || doc.zhName 
						model.create(doc);
						console.info(count, ' - ', index, 'write done');
						resolve('done');					
					}).catch(e => {
						reject('err');
						console.info(count, ' - ', index, 'get error');
					})
				});
				promise.then(() => {
					index < len ? getList(++ index) : rs('page done');
				}).catch(() => {
					index < len ? getList(++ index) : rs('page done');
				})
			}
			getList();
		});
		promise.then(() => {
			count < maxPage ? getPage(++count) : console.info('all done');
		})
	}).catch(e => {
		console.info(e)
	})
}
//- 获取序号
pageIndexMode.find({name: collection}).then(doc => doc[0]).then(doc => {
	getPage(doc.index || 0)
});