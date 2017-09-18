/*
	使用axios+fiddler获取数据
 */

const cheerio = require('cheerio');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const mongoBase = require("../config/mongoBase");
const collection = 'chemicalbook';
const model = mongoBase.model({url: path.join(__dirname + '/schema.js'), collection: collection});

const maxPage = 324;
const basePath = 'http://www.chemicalbook.com';

/**
 * [根据序号获取页面]
 * @param  {[type]} i [description]
 * @return {[type]}   [description]
 */
const getPage = (i) => {
	let count = i;
	let flag = false;
	let index = i == 0 ? '0' : i + '00';
	axios.get(basePath + '/CASDetailList_' + index + '.htm', {
		header: {
			'User-Agent': 'Fiddler'
		},
		proxy: {
			host: '127.0.0.1',
			port: 8888
		}
	})
		.then(response => {
			let $ = cheerio.load(response.data);
			if($('#ContentPlaceHolder1_ProductClassDetail').length){
				flag = true;
				$('#ContentPlaceHolder1_ProductClassDetail').find('tr').each((i, item) => {
					if(i == 0) return; 
					let data = ['CAS', 'zhName', 'enName', 'MF'];
					let doc = {
						company: []
					};
					$(item).find('td').each((index, list) => {
						doc[data[index]] = $(list).text().trim();
						if(index == 1){
							let href = $(list).find('a').attr('href');
							//- 获取厂家信息
							if(href){
								//- 有厂家信息
								axios.get(basePath + href, {
									header: {
										'User-Agent': 'Fiddler'
									},
									proxy: {
										host: '127.0.0.1',
										port: 8888
									}
								})
									.then(response => {
										let $ = cheerio.load(response.data);
										let data = ['name', 'phone', 'fax', 'email', 'country', 'productNumber', 'score'];
										$('#GridView1').find('tr').each((i, item) => {
											if(i == 0) return; 
											let buf = {};
											$(item).find('td').each((index, list) => {
												buf[data[index]] = $(list).text().trim();
												if(index == 0){
													buf.url = $(list).find('a').attr('href');
												}
											});
											doc.company.push(buf);
										});	
										model.create(doc);	
									})
									.catch(e => {
										console.info("2: 2");
									});
							}
							else{	
								//- 无公司信息
								model.create(doc);	
							}
						}
					});
				});
			}
			else{
				console.info('未获取数据 index = ', i);
			}
			console.info('current page: ', count)								
			if(flag && count < maxPage){								
				setTimeout(() => {
					getPage(++count);
					pageIndexMode.update({name: collection}, {index: count, name: collection}, e => {
						console.info('update index : ', count, '::::', e)
					});
				}, 5000);
			}
		})
		.catch(e => {
			console.info("1: e", '::: count = ', count);
		});
};

//- 获取序号
pageIndexMode.find({name: collection}).then(doc => doc[0]).then(doc => {
	getPage(doc.index)
});
