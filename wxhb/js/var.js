/**
 * VAR.JS
 * 
 * 
 */
 
var XHR = [];
var RESP = [];
var NS = window.NS || {};

var tab_nm = 'dashboard';
var apply_status = ['待审核', '更新', '新建', '未定义', '审核失败', '审核成功', '已支付'];
var apply_type = ['错误', '未定义', '刷单', '好评'];
// var api_host = '';
var api_host = 'http://urlnk.com';
var document_root = api_host;
// var document_root = 'http://wx.themeal.cn/wwwroot/urlnk/web';

/**
 * 主类
 * @returns {undefined}
 */
var _ = function (str, index) {
	var result = null;
	var key = -1;
	if ('number' == typeof index) {
		key = index;
	}
	
    if ('string' == typeof str) {
		if (str.match(/=$/g)) { //查找名称
			var name = str.replace(/(.*)=$/g, "$1");
			//document.title = name;
			var el = document.getElementsByName(name);
			if (-1 < key) {
				result = el[key];
			} else {
				result = el[0];
			}
		} else if (str.match(/^@/g)) { //查找名称
			var name = str.match(/([^@\(]+)/g);
			var idx = str.match(/(\d+)\)$/g);
			idx = idx[0].replace(/([^\d]+)/g, "");
			// document.title = JSON.stringify(name) + '_'+ idx;
			var el = document.getElementsByName(name[0]);
			if (-1 < key) {
				result = el[key];
			} else if ('' !== idx) {
				result = el[idx];
			}
			
		} else { //CSS选择器
			if (-1 < key) {
				result = document.querySelectorAll(str)[key];
			} else {
				result = document.querySelector(str);
			}
		}
	}
	return result;
};

/**
 * 文件
 * @returns {undefined}
 */
_.file = function () {

};

/**
 * 接口
 * @returns {undefined}
 */
_.api = function (uri, query, method, formData, arg) {
	method = method || 'get';
	method = method.toUpperCase();
	arg = arg || {};
	
	var url = api_host + '/redpack/apis/' + uri;
	if (query) {
		url += '?' + query;
	}
	XHR[uri] = new XMLHttpRequest();
	XHR[uri].onreadystatechange = function()
	{
		if (4 == XHR[uri].readyState) {
			if (200 == XHR[uri].status) {
				eval("var json = " + XHR[uri].responseText + "; _.api.run(json, '" + uri + "', '" + encodeURI(JSON.stringify(arg)) + "');");
				
			} else {
				alert('Problem retrieving data:' + XHR[uri].statusText);
			}
		}
	};
	XHR[uri].open(method, url, true);
	//XHR[uri].overrideMimeType('text/plain; charset=GBK');
	//XHR[uri].responseType = 'json';
	if ('POST' == method) {
		XHR[uri].setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	}
	XHR[uri].send(formData);
};

/**
 * 字符串
 * @returns {undefined}
 */
_.str = function () {

};

/**
 * 日期时间
 * @returns {undefined}
 */
_.date = function (format, timestamp, millisec, ignore) {
	format = format || 'Y-m-d';
	if (null == timestamp) { //容错
		timestamp = -1;
	}
	millisec = millisec || 1000;
	//ignore = '';
	
	// 忽略
	var val = timestamp ? timestamp : '';
	var num = parseInt(val);
	if (isNaN(num) || 'number' != typeof num || 0 == num) {
		if ('undefined' != typeof ignore) {
			return ignore;
		} else {
			return val;
		}
	}
	//return num + '_' + val + '_' + timestamp ;
	num = num * millisec;
	
	// 设置获取
	var date = new Date();
	date.setTime(num);
	var year = date.getFullYear();
	var n = date.getMonth() + 1;
	var j = date.getDate();
	var G = date.getHours();
	var i = date.getMinutes();
	var s = date.getSeconds();
	var w = date.getDay();
	var a = 'am';
	
	// 修改
	var y = String(year).substring(2);
	var m = String(n).str_pad(2);
	var d = String(j).str_pad(2);
	var H = String(G).str_pad(2);
	var dian = 12;
	if (12 < G) {
		dian = G - 12;
		a = 'pm';
	} else if (G) {
		dian = G;
	}
	var shi = String(dian).str_pad(2);
	
	i = String(i).str_pad(2);
	s = String(s).str_pad(2);
	
	// 替换
	var str = format.replace(/Y/g, year);
	str = str.replace(/n/g, n);
	str = str.replace(/j/g, j);
	str = str.replace(/G/g, G);
	str = str.replace(/i/g, i);
	str = str.replace(/s/g, s);
	str = str.replace(/w/g, w);
	
	
	str = str.replace(/y/g, y);
	str = str.replace(/m/g, m);
	str = str.replace(/d/g, d);
	str = str.replace(/H/g, H);
	str = str.replace(/g/g, dian);
	str = str.replace(/h/g, shi);
	str = str.replace(/a/g, a);
	str = str.replace(/A/g, a.toUpperCase());
	return str;
};

/**
 * 脚本
 * @returns {undefined}
 */
_.js = function () {

};

/**
 * 样式表
 * @returns {undefined}
 */
_.css = function () {

};

/**
 * 数学
 * @returns {undefined}
 */
_.math = function () {

};

/**
 * 单位
 * @returns {undefined}
 */
_.unit = function () {

};

/**
 * JSON
 * @returns {undefined}
 */
_.json = function () {
	
};

/**
 * 缓存
 * @returns {undefined}
 */
_.cache = function () {
	
};

/**
 * 表单
 * @returns {undefined}
 */
_.form = function () {
	
};

/**
 * 预览要上传的图片
 * 
 * @returns {undefined}
 */
_.file.preview = function (prv) {
	var result = 0;
    var file = document.querySelectorAll('input[type=file]')[0];
	var img = document.querySelectorAll('img')[0];
	
	// 匹配图片类型
	var val = file.value;
	var match = val.match(/\.(jpeg|jpg|png|gif|bmp)$/i);
	if (match) {
		result = 1;
		
		var reader = new FileReader();
		
		reader.addEventListener('load',
			function () {
				img.src = reader.result;
				img.style.height = 'auto';
			},
			false);
			
		file = file.files[0];
		if (file) {
			if (!prv) {
				reader.readAsDataURL(file);
			}
			result = 2;
		}
		
	} else if (!prv) {
		img.src = 'img/px.png';
		img.style.height = '70px';
	}
	return result;
};

/**
 * 上传文件
 * 
 * @returns {undefined}
 */
_.file.upload = function (name, filename, file, url) {
	
	var result = 7;
	name = name || 'file_upload';
	file = file || document.getElementById(name);
	if (file) {
		result = 8;
		file = file.files[0];
		if (file) {
			result = -1;
			url = url || api_host + '/redpack/apis/upload';
			
			var formData = new FormData();
			formData.append(name, file);
			formData.append('name', name);
			formData.append('filename', filename);
			
			var uri = 'varjs_file_upload';
			XHR[uri] = new XMLHttpRequest();
			XHR[uri].open('POST', url, true);
			XHR[uri].onload = _.file.upload.onload;
			XHR[uri].onerror = _.file.upload.onerror;
			XHR[uri].upload.onprogress = _.file.upload.onprogress;
			XHR[uri].upload.onloadstart = function(){
				_.file.upload.uploaded_time = _.date.time();
				_.file.upload.uploaded_size = 0;
			};
			XHR[uri].send(formData);
		}
	}
	return result;
};



/**
 * 运行接口
 * 
 * @returns {undefined}
 */
_.api.run = function (json, func, arg) {
	if (json) {
		if (json.status) {
			alert(json.msg);
			
		} else {
			RESP[func] = json;
			eval("api_" + func + "('" + arg + "');");
		}
		
	} else {
		alert('_.api.run() ERROR');
	}
};

/**
 * 计算长度 - 把中文替换成两个字节的英文
 * @returns {undefined}
 */
_.str.len = function (str) {
	return str.replace(/[\u0391-\uFFE5]/g, 10).length;
};

/**
 * 时间戳 毫秒
 * @returns {undefined}
 */
_.date.time = function (millisec) {
	var type = typeof millisec;
	if ('number' == type || 'string' == type) {
		_.date.object.setTime(millisec);
	} else {
		return new Date().getTime();
	}
};

_.date.object = new Date;
_.date.timestamp = 0;

/**
 * 脚本代码
 * @returns {undefined}
 */
_.js.text = function (code) {
	var script = document.createElement("script");
    script.type = "text/javascript";
    try {
        script.appendChild(document.createTextNode(code));
    } catch (ex) {
        script.text = code;
    }
    document.body.appendChild(script);
};

/**
 * 插入脚本
 * @returns {undefined}
 */
_.js.src = function (url, callback, version) {
	version = version || _.date.time();
	url += '?v=' + version;
	
	var script = document.createElement("script");
	script.type = "text/javascript";
	if (typeof(callback) != "undefined") {
		if (script.readyState) {
			script.onreadystatechange = function () {
				if (script.readyState == "loaded" || script.readyState == "complete") {
					script.onreadystatechange = null;
					callback();
				}
			};
		} else {
			script.onload = function () {
				callback();
			};
		}
	}
	script.src = url;
	document.body.appendChild(script);
};

/**
 * 
 * @returns {undefined}
 */
_.css.append = function (url, version) {
	version = version || _.date.time();
	url += '?v=' + version;
	
	var el = document.createElement('link');
	el.href = url;
    el.rel = "stylesheet";
	el.type = "text/css";
    document.head.appendChild(el);
};


/**
 * 求指数
 * @returns {undefined}
 */
_.math.exp = function (number, radix, count) {
	number = Number(number);
	radix = Number(radix) || 1024;
	count = Number(count) || 1;
	var num = number / radix;
	if (1 < num) {
		++count;
		return _.math.exp(num, radix, count);
	}
	num = number;
	return [count, num];
};

/**
 * 存储单位
 * @returns {undefined}
 */
_.unit.storage = function (size) {
	var exp = _.math.exp(size, 1024, -1);
	return _.unit.storage_abbr[exp[0]];
};

_.unit.storage_abbr = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];


/**
 * 解码URI并解析JSON
 * @returns {undefined}
 */
_.json.parseURI = function (URIstring) {
	var str = decodeURI(URIstring);
	return result = str ? JSON.parse(str) : {};
};


/**
 * 缓存设置
 * @returns {undefined}
 */
_.cache.set = function (key, value) {
	var cache = _.cache.object;
	var k, obj;
	
	/* 多层次键名 */
	var arr = String(key).split('.');
	var len = arr.length;
	var max = len - 1;
	for (var i = 0; i < max; i++) {
		k = arr[i];
		obj = cache[k];
		if ('undefined' == typeof obj) {
			cache[k] = {};
		}
		cache = cache[k];
	}
	k = arr[max];
	cache[k] = value;
};


/**
 * 缓存获取
 * @returns {undefined}
 */
_.cache.get = function (key, value, cache) {
	cache = cache || _.cache.object;
	var k = key;
	
	/* 多层次键名 */
	var arr = String(key).split('.');
	var len = arr.length;
	if (1 < len) {
		k = arr.shift();
		key = arr.join('.');
	}
	
	var val = null;
	var obj = cache[k];
	if ('undefined' != typeof value) { //设置默认值
		val = value;
	}
	if ('undefined' != typeof obj) { //值存在
		val = obj;
		if (1 < len) {
			return _.cache.get(key, value, obj);
		}
	}
	
	return val;
};

_.cache.object = {};

/**
 * 表单
 * @returns {undefined}
 */
_.form.checkbox = function (e, target, set) {
	var checked = e.checked;
	var input = _(target).querySelectorAll('input[type=checkbox]');
	for (var i = 0; i < input.length; i++) {
		input[i].checked = checked;
	}
};

_.file.upload.uploaded_time = null;
_.file.upload.uploaded_size = null;
_.file.upload.percent = 0; //上传大小百分比

/**
 * 上传文件 - 请求完成
 * 
 * @returns {undefined}
 */
_.file.upload.onload = function (evt) {
	var json = JSON.parse(evt.target.responseText);
	var data = json.data;
	var result = data.result;
	if (result) {
		previous_file.value = result;
		var img = document.querySelectorAll('img')[0];
		img.src = document_root + '/files/' + previous_file.value + '?v=' + _.date.time();
		img.style.height = 'auto';
		
		var progress = document.getElementsByClassName('progress')[0];
		progress.style.display = 'none';
		
	} else if (json.status) {
		alert(json.msg);
	} else {
		alert(JSON.stringify(data.tip));
	}
};

/**
 * 上传文件 - 失败
 * 
 * @returns {undefined}
 */
_.file.upload.onerror = function (evt) {
	var json = evt.target.responseText;//document.title = json;
	alert("上传失败！");
	//alert(json);
};

/**
 * 上传文件 - 进度
 * 
 * @returns {undefined}
 */
_.file.upload.onprogress = function (evt) {	
	var progress = document.getElementsByClassName('progress')[0];
	var p = progress.querySelector('p');
	var span = progress.querySelector('span');
	
	// 上传大小百分比
	if (evt.lengthComputable) {
		_.file.upload.percent = Math.round(evt.loaded / evt.total * 100);
		p.style.width = _.file.upload.percent + "%";
		progress.setAttribute('data-max', evt.total);
		progress.setAttribute('data-value', evt.loaded);
		progress.style.display = 'block';
	}
	
	// 时间差
	var now_time = _.date.time();
	var diff_time = (now_time - _.file.upload.uploaded_time) / 1000;
	_.file.upload.uploaded_time = now_time;//document.title = 
	
	// 大小增量
	var diff_size = evt.loaded - _.file.upload.uploaded_size;
	_.file.upload.uploaded_size = evt.loaded;

	// 上传速度计算
	var speed = diff_size / diff_time;
	var bspeed = speed;
	speed = _.math.exp(bspeed)[1];
	speed = speed.toFixed(1);
	var units = _.unit.storage(bspeed) + '/s';
	
	
	// 剩余
	var rest_size = evt.total - evt.loaded;
	var rest_time = (rest_size / bspeed).toFixed(1);
	
	
	span.innerHTML = p.style.width + '，速度：' + speed + units + '，剩余时间：' + rest_time + 's';
	if (0 == bspeed) {
		span.innerHTML = '上传已取消';
	}
};




/**
 * 上传文件 - 取消
 * 
 * @returns {undefined}
 */
_.file.upload.abort = function () {
	XHR['varjs_file_upload'].abort();
};

function api_check_order(arg) {
	arg = _.json.parseURI(arg);
	var id = arg.id || 'list';
	var json = RESP['check_order'];
	var data = json.data;
	var result = Number(data.result);
	//document.title = result;
	//alert(JSON.stringify([arg, json]));
	var x = 3 + result;
	if (-5 < result) {
		if (-4 < result) {
			if (-3 < result) {
				if (0 < result) {
					if (1 < result) {
						order_no_tip.innerHTML = apply_status[x] + '，不可以申请';
					} else {
						order_no_tip.innerHTML = '审核失败，可以重新申请';
					}
				} else {
					order_no_tip.innerHTML = apply_status[x] + '，可以申请';
				}
			} else {
				order_no_tip.innerHTML = '';
			}
		} else {
			order_no_tip.innerHTML = '请输入正确的订单号';
		}
	}
}


