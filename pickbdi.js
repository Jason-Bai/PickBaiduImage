/**
 * Module Denpendencies
 */
var fs = require('fs'),
	request = require('superagent'),
	stdin = process.stdin,
	stdout = process.stdout;

// 1 Level Categories
var tag1 = ["明星", "图说天下", "美女", "壁纸", "搞笑", "服饰", "动漫", "旅游", "摄影", "家居", "婚嫁", "设计"];
// 2 level Categories
var tag2 = {
	3: ["全部", "小清新", "性感美女", "写真", "诱惑", "长腿", "甜素纯", "足球宝贝", "清纯", "校花", "网络美女", "唯美", "气质", "嫩萝莉", "时尚", "长发", "可爱", "车模", "古典美女", "素颜"]
};

// display all 1 level categories
function displayTag1() {
	stdout.write('\033[39mSelect a number for you : \033[90m');
	for(var i = 0, max = tag1.length; i < max; i++) {
		stdout.write('\r\n ' + i + ')' +  tag1[i]);
	}
	stdout.write('\r\n\033[39mEnter your choice: \033[90m');
}

/**
 * 下载单个图片
 */
function pickImage(url, path) {
	var stream = fs.createWriteStream(path);
	var req = request.get(url);
	req.pipe(stream);
};

exports.pickImage = pickImage;

/**
 * 分组下载多个图片
 * 说明：在我的机器上会有拒绝连接的错误，猜测可能与单线程有关
 */
function pickMultiImages(urls, path, time) {
	var i = 0,
		len = urls.length;
	(function () {
		for(var j = i; j < i + 10 && j < len; j++) {
			pickImage(urls[j], path + parseInt(Math.random() * 1000) + '.jpg');
		}
		i += 10;
		if(i < len) {
			var args = arguments;
			setTimeout(function () {
				console.log( i + ' invoked!');
				args.callee();
			}, time || 10000);
		}
	}());
}

exports.pickMultiImages = pickMultiImages;

/**
 * 下载图片
 * options : {
 *  url:   基地址
 *  pn:    起始编号
 *  rn:    结束编号
 *  tag1:  分类（大）
 *  tag2:  分类（小）
 * }
 */
exports.run = function (options) {
	options = options || {};
	options.url = options.url || 'http://image.baidu.com/channel/listjson';
	request.get(options.url)
		   .query({pn: options.pn || 0, rn: options.rn || 100, tag1: options.tag1 || '美女', tag2: options.tag2 || '性感美女', ie: 'utf8'})
		   .send()
		   .end(function (res) {
				var r = JSON.parse(res.text),
					images = [];
				for(var i = 0, max = r.data.length; i < max; i++) {
					images.push(r.data[i].download_url);
				}
				pickMultiImages(images, options.path || './images/');	
		   });
}


