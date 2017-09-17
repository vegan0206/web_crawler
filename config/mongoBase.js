const mongoose = require('mongoose');
const bluebird = require('bluebird');
const Schema = mongoose.Schema;
mongoose.Promise = bluebird; //- 替换原来不建议使用的promise
const base = {
    'host': '127.0.0.1',
    'port': 27017,
    'max': 100,
    'min': 10,
    'timeout': 30000,
    'db': 'iworku'
}
const db = mongoose.connect('mongodb://' + base.host + ':' + base.port + '/' + base.db);
db.connection.on('error', function (error) {
  console.log('数据库连接失败：' + error);
});
db.connection.on('open', function () {
  console.log('——数据库连接成功！——');
});


exports.model = ({url, collection}) => {
  //- 初始化序号, 将获取数据的序号保存到集合pageIndex中
  let pageIndexSchem = new Schema({name: String, index: Number}, {collection: 'pageIndex'}); 
  let pageIndexMode = mongoose.model('pageIndexMode', pageIndexSchem);
  pageIndexMode.find({name: collection})
    .exec()
    .then(doc => {
      if(!doc.length){          
        pageIndexMode.create({
          name: collection,
          index: 0
        });
      }
    });
  global.pageIndexMode  = pageIndexMode;
	let schema = new Schema(require(url), {collection: collection, autoIndex: true});
	return mongoose.model('Model', schema);
};