/**
 * 
 * @authors veganQian
 * @date    2017-09-18 10:13:12
 * @version $Id$
 */

module.exports = {
	CAS: String,
	enName: String,
	zhName: String,
	zhInfo: {
		zhName: String,
		enName: String,
		synonyms: String, // 中文别名
		CAS: String, 
		EINECS: String,
		molecularWeight: String, //分子量
		molecularFormula: String, // 分子式
		dangerousMark: String, // 危险标志
		riskCodes: String, // 风险术语
		safetyDescription: String, // 安全术语
		physicalProperties : String, // 化学性质
		application : String, // 用途
		img: String, 
		material: String, // 原材料
		product: String,  // 合成产品		
		company: String
	},
	enInfo: {
		enName: String,
		synonyms: String, // 英文别名
		CAS: String, 
		EINECS: String,
		molecularWeight: String, //分子量
		molecularFormula: String, // 分子式
		dangerousMark: String, // 危险标志
		riskCodes: String, // 风险术语
		safetyDescription: String, // 安全术语
		meltingPoint: String,
		boilingPoint: String,
		flashPoint: String,
		waterSolubility: String,
		// physicalProperties : String, // 化学性质
		// application : String, // 用途
		img: String, 
		// material: String, // 原材料
		// product: String,  // 合成产品		
		company: String
	}
}