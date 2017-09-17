/**
 * mongo schema cong
 * @authors veganQian (veganQian@163.com)
 * @date    2017-09-15 21:18:40
 * @version $Id$
 */

module.exports = {
	CAS: String,
	enName: String,
	zhName: String,
	MF: String,
	company: [
		{
			name: String,
			phone: String,
			fax: String,
			email: String,
			url: String,
			productNumber: Number,
			country: String,
			score: Number
		}
	]
}