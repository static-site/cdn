// 接口
function api(uri, query, method, formData, arg) {
	method = method || 'get';
	method = method.toUpperCase();
	arg = arg || {};
	
	var url = api_host + '/redpack/api/' + uri;
	url += '?_timestamp=' + _.date.time();
	if (query) {
		url += '&' + query;
	}
	XHR[uri] = new XMLHttpRequest();
	XHR[uri].onreadystatechange = function()
	{
		if (4 == XHR[uri].readyState) {
			if (200 == XHR[uri].status) {
				eval("var json = " + XHR[uri].responseText + "; api_run(json, '" + uri + "', '" + encodeURI(JSON.stringify(arg)) + "');");
				
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
}


// 运行接口
function api_run(json, func, arg) {
	if (json) {
		if (json.status) {
			alert(json.msg);
			
		} else {
			RESP[func] = json;
			eval("api_" + func + "('" + arg + "');");
		}
		
	} else {
		alert('api_run ERROR');
	}
}

// 接口 - 申请列表
function api_apply_list(arg) {
	ajax_api_list(arg, 'apply_list');
}

// 接口 - 支付列表
function api_pay_list(arg) {
	ajax_api_list(arg, 'pay_list');
}

// 接口 - 微信会员列表
function api_weixin_list(arg) {
	ajax_api_list(arg, 'weixin_list');
}

// 接口 - 淘宝会员列表
function api_taobao_list(arg) {
	ajax_api_list(arg, 'taobao_list');
}

// 接口 - 支付宝会员列表
function api_alipay_list(arg) {
	ajax_api_list(arg, 'alipay_list');
}

// 接口 - 会员列表
function api_user_list(arg) {
	ajax_api_list(arg, 'user_list');
}

// 接口 - 列表
function ajax_api_list(arg, nm) {
	arg = decodeURI(arg);
	arg = arg ? JSON.parse(arg) : {};
	var id = arg.id || 'element_id';
	var tpl = arg.tpl || '<li>{variable_name}</li>';
	var ns = arg.ns || nm;
	var json = RESP[nm];
	
	ajax_list(id, tpl, json.data);
	
	// 元数据
	if (json.info) {
		for (var key in json.info) {
			NS[ns][key] = json.info[key];
		}
	}
	
	// 析构
	if (arg.destruct) {
		eval(arg.destruct);
	}
}

/**
 * 动态插入列表
 */
function ajax_list(id, tpl, data, position) {
	position = position || 'beforeEnd';
	var ul = document.getElementById(id);
	if (ul) {
		for (var i = 0; i < data.length; i++) {
			var row = data[i];
			row = JSON.stringify(row); //容错处理
			
			var html = tpl.replace(/{(\w+)}/g, "' + row.$1 + '"); //数据替换
			html = html.replace(/{(\w+)\.(\w+)([^}]+)}/g, "' + row.$1.$2$3 + '"); //使用prototype
			eval_script("var row = JSON.parse('" + row + "'); window.html = '" + html + "';"); //执行脚本
			//document.title = window.html;
			html = window.html.replace(/<%([\w\.]+)\(([^%>]+)\)%>/g, "' + $1($2) + '"); //使用函数
			eval("html = '" + html + "';");
			
			ul.insertAdjacentHTML(position, html);
		}
	}
}	

// 解码URI并解析JSON
function json_decode_parse(arg) {
	arg = decodeURI(arg);
	return arg = arg ? JSON.parse(arg) : {};
}

// 审核
function api_audit(arg) {
	arg = json_decode_parse(arg);
	var id = arg.id || 'list';
	var json = RESP['audit'];
	var data = json.data;
	table_change_td(id, data.change, apply_status[Number(data.cmd) + 3], 5);
}

// 仪表盘
function api_dashboard(arg) {
	arg = json_decode_parse(arg);
	var id = arg.id || 'dashboard';
	var json = RESP['dashboard'];
	var data = json.data;
	//alert(JSON.stringify([arg, json]));
	document.getElementById(id).innerHTML = '订单 ' + data.order_count;
}

function api_edit(arg) {
	arg = json_decode_parse(arg);
	var id = arg.id || 'list';
	var json = RESP['edit'];
	var data = json.data;
	//alert(JSON.stringify([arg, json]));
	NS.tpl_pay_list.refresh();
	var el = _('#' + id);
	if (el && 'FORM' == el.nodeName) {
		el.reset();
	}
}

function api_user(arg) {
	arg = json_decode_parse(arg);
	var id = arg.id || 'list';
	var json = RESP['user'];
	var data = json.data;
	NS.tpl_user_list.refresh();
	var el = _('#' + id);
	if (el && 'FORM' == el.nodeName) {
		el.reset();
	}
}

function change_password() {
	var msg = prompt("请输入新密码：", "");
	if ('string' == typeof msg) {
		api('user', 'chk[]=-1', 'post', 'password=' + encodeURIComponent(msg));
	}
}

// 模板初始化
function tpl_init(uri, nm, param, tag) {
	tag = tag || '';
	var func = nm || uri;
	
	var url = api_host + '/redpack/api/tpl?uri=' + uri;
	if (param) {
		url += '&param=' + encodeURIComponent(param);
	}
	url += '&ns=' + func;
	
	var x = 'tpl_' + func;
	XHR[x] = new XMLHttpRequest();
	XHR[x].onreadystatechange = function()
	{
		if (4 == XHR[x].readyState) {
			if (200 == XHR[x].status) {
				eval("var json = " + XHR[x].responseText + "; tpl_load(json, '" + func + "', '" + tag + "');");
				
			} else {
				alert('Problem retrieving data:' + XHR[x].statusText);
			}
		}
	};
	XHR[x].open('GET', url, true);
	XHR[x].send(null);
}


// 加载模板
function tpl_load(json, func, type) {
	//document.title = type;
	type = type || 'main';
	if (json) {
		if (json.status) {
			alert(json.msg);
			
		} else {
			NS[func] = NS[func] || {};
			
			x = 'tpl_' + func;
			RESP[x] = json;
			NS[x] = NS[x] || {};
			NS[x].refresh = function () {};
			NS[x].arg = {};
			
			var main = document.getElementsByTagName(type)[0];
			//document.getElementById('main')
			var c = main.childNodes;
			for (var l = 0; l < c.length; l++) {
				if (1 == c[l].nodeType) {
					var name = c[l].getAttribute('data-nm');
					if (func == name) {
						c[l].style.display = 'block';
						var el = c[l].querySelector('.ajax-content');
						//document.title = JSON.stringify(el);
						if (null !== el) {
							el.innerHTML = json.data.html;
						} else {
							c[l].innerHTML = json.data.html;
						}
						
						var arg = json.data.arg;
						if (arg) {
							if ('string' == typeof arg) {
								arg = JSON.parse(arg);
							}
							NS[x].arg = arg;
						}
						
						eval(json.data.js);
						break;
					}
				}
			}
		}
		
	} else {
		alert('tpl_load ERROR');
	}
}


/**
 * 切换标签
 */
function tab_switch(e) {
	var el = e.parentNode;
	
	
	// 切换标签
	var nav_tab = document.getElementsByClassName('nav-tab')[0];
	var ol = nav_tab.getElementsByTagName('ol')[0];
	
	// 自动移动标签
	if (0 > (el.offsetLeft + ol.offsetLeft)) {
		tab_roll();
	} else if (nav_tab.offsetWidth < (el.offsetLeft +  el.offsetWidth)) {
		tab_roll('-');
	}
	
	var li = nav_tab.getElementsByTagName('li');
	var j = -1;
	var nm = el.getAttribute('data-nm');
	for (var i = 0; i < li.length; i++) {
		li[i].className = '';
		if (el == li[i]) {
			j = i;
		}
	}
	el.className = 'tab-current';
	
	// 同步显示内容
	var main = document.getElementsByTagName('main')[0]
	var c = main.childNodes;
	var k = 0;
	for (var l = 0; l < c.length; l++) {
		if (1 == c[l].nodeType) {
			var name = c[l].getAttribute('data-nm');
			if ((nm && nm == name) || k == j) {
				c[l].style.display = 'block';
			} else {
				c[l].style.display = 'none';
			}
			k++;
		}
	}
	
	// 双击刷新
	if (nm == tab_nm) {
		NS['tpl_' + nm].refresh();
	}
	tab_nm = nm;
}

/**
 * 滚动标签
 */
function tab_roll(d) {
	d = d || '';
	
	var nav_tab = document.getElementsByClassName('nav-tab')[0];
	var ol = nav_tab.getElementsByTagName('ol')[0];
	
	var sum = ol.offsetWidth;
	var vis = nav_tab.offsetWidth;
	var hid = sum - vis;
	var left = Math.abs(ol.offsetLeft);
	
	var mov = 0;
	// 有隐藏
	if (0 < hid) {
		// 可见小于隐藏宽度
		if (vis < hid) {
			// 右移
			if (!d) {
				// 需要移动
				if (left) {
					// 左边小于可见宽度
					if (left <= vis) {
						mov = 0;
					} else {
						mov = left - vis;
					}
				}
			// 左移
			} else {
				mov = left + vis;
				// 移动不超过隐藏宽度
				if (mov > hid) {
					mov = hid;
				}
			}
		} else if (d) {
			mov = hid;
		}
	}
	
	ol.style.left = '-' + mov + 'px';
}

/**
 * 打开标签
 */
function tab_open(nm, title, uri, param) {
	if ('object' == typeof title) {
		title = title.innerText;
	}
	title = title || '标签页';
	uri = uri || nm;
	
	var opened = 0;
	var nav_tab = document.getElementsByClassName('nav-tab')[0];
	//var main = document.getElementsByTagName('main')[0];
	var main = document.getElementById('main');
	var ol = nav_tab.getElementsByTagName('ol')[0];
	var li = nav_tab.getElementsByTagName('li');
	var j = -1;
	for (var i = 0; i < li.length; i++) {
		if (nm == li[i].getAttribute('data-nm')) {
			j = i;
			var a = li[i].getElementsByTagName('a')[0];
			tab_switch(a);
			break;
		} else {
			li[i].className = '';
		}
	}
	
	var len = li.length;
	if (-1 == j) {
		var tab = document.createElement('li');
		tab.className = 'tab-current';
		tab.innerHTML = '<a href="javascript:" onclick="tab_switch(this)">' + title + '</a><i onclick="tab_close(this)">x</i>';
		tab.setAttribute('data-nm', nm);
		ol.appendChild(tab);
		
		var c = main.childNodes;
		for (var l = 0; l < c.length; l++) {
			if (1 == c[l].nodeType) {
				c[l].style.display = 'none';
			}
		}
		
		var content = document.createElement('div');
		//content.innerHTML = new Date;
		content.setAttribute('data-nm', nm);
		main.appendChild(content);
		
		tpl_init(uri, nm, param);
		
		// 自动移动标签
		var nav_tab = document.getElementsByClassName('nav-tab')[0];
		var ol = nav_tab.getElementsByTagName('ol')[0];
		if (ol.offsetWidth > nav_tab.offsetWidth) {
			tab_roll('-');
			var roll = document.querySelector('.tab-roll');
			roll.style.display = 'block';
		}
		
		len++;
	}
	
	if (2 < len) {
		var roll = document.querySelector('.tab-option');
		roll.style.display = 'block';
	}
}

/**
 * 打开对话框
 */
function dialog(nm, title, uri, param) {
	if ('object' == typeof title) {
		title = title.innerText;
	}
	//title = title || '对话框';
	uri = uri || nm;
	
	var width = 300;
	var dialog = document.getElementsByClassName('dialog')[0];
	if ('none' != dialog.style.display) {
		dialog.style.display = 'none';
	} else {
		dialog.style.display = 'block';
	}
	var j = -1;
	
	var c = dialog.childNodes;
	for (var l = 0; l < c.length; l++) {
		if (1 == c[l].nodeType) {
			if (nm == c[l].getAttribute('data-nm')) {
				j = l;
				c[l].style.display = 'block';
				if (c[l].offsetWidth) {
					width = c[l].offsetWidth;
				}
			} else {
				c[l].style.display = 'none';
			}
		}
	}
	
	if (-1 == j) {
		var content = document.createElement('div');
		if (title) {
			content.innerHTML = '<div class="dialog-title"><i onclick="dialog(\'' + nm + '\')">x</i><h4>' + title + '</h4></div><div class="ajax-content"></div>';
		}
		content.setAttribute('data-nm', nm);
		dialog.appendChild(content);
		
		tpl_init(uri, nm, param, 'dialog');
		dialog.style.display = 'block';
	}
	
	dialog.style.maxWidth = width + 'px';
}

/**
 * 关闭标签
 */
function tab_close(e) {
	var el = e.parentNode;
	var next = null;
	
	// 移除标签
	var nav_tab = document.getElementsByClassName('nav-tab')[0];
	var main = document.getElementsByTagName('main')[0];
	var ol = nav_tab.getElementsByTagName('ol')[0];
	var li = ol.getElementsByTagName('li');
	var j = 0;
	var nm = el.getAttribute('data-nm');
	for (var i = 0; i < li.length; i++) {
		if (el == li[i]) {
			j = i;
			next = li[i - 1];
			ol.removeChild(li[i]);
			break;
		}
	}
	
	// 同步移除内容
	var c = main.childNodes;
	var k = 0;
	for (var l = 0; l < c.length; l++) {
		if (1 == c[l].nodeType) {
			var name = c[l].getAttribute('data-nm');
			if ((nm && nm == name) || k == j) {
				main.removeChild(c[l]);
			}
			k++;
		}
	}
	
	// 切换标签
	if (next) {
		var a = next.getElementsByTagName('a')[0];
		a.click();
	}
	
	if (ol.offsetWidth < nav_tab.offsetWidth) {
		var roll = document.querySelector('.tab-roll');
		roll.style.display = 'none';
	}
	
	if (3 > li.length) {
		var roll = document.querySelector('.tab-option');
		roll.style.display = 'none';
	}
 }
 
 /**
 * 重置标签
 */
function tab_reset() {	
	// 移除标签
	var nav_tab = document.getElementsByClassName('nav-tab')[0];
	var main = document.getElementsByTagName('main')[0];
	//var main = document.getElementById('main');
	var ol = nav_tab.getElementsByTagName('ol')[0];
	var li = ol.getElementsByTagName('li');
	for (var i = li.length - 1; i > 0; i--) {
		ol.removeChild(li[i]);
	}
	
	// 同步移除内容
	var c = main.childNodes;
	for (var l = c.length - 1; l > 0; l--) {
		if (1 == c[l].nodeType) {
			var name = c[l].getAttribute('data-nm');
			if ('dashboard' != name) {
				main.removeChild(c[l]);
			}
		}
	}
	
	// 切换标签
	var a = li[0].getElementsByTagName('a')[0];
	a.click();
	
	if (ol.offsetWidth < nav_tab.offsetWidth) {
		var roll = document.querySelector('.tab-roll');
		roll.style.display = 'none';
	}
	
	var roll = document.querySelector('.tab-option');
	roll.style.display = 'none';
 }

/**
 * 菜单切换
 */
function menu_toggle(e) {
	var expand = e.getAttribute('data-expand');
	var collapse = e.getAttribute('data-collapse');
	var el = e.parentNode.parentNode;
	var dd = el.getElementsByTagName('dd');
	var cls = el.className;
	var show = 'none';
	if ('expand' != cls) {
		el.className = 'expand';
		show = 'block';
		e.innerHTML = expand;
	} else {
		el.className = 'collapse';
		e.innerHTML = collapse;
	}
	
	for (var i = 0; i < dd.length; i++) {
		dd[i].style.display = show;
	}
}

function details(e) {
	var expand = e.getAttribute('data-expand');
	var collapse = e.getAttribute('data-collapse');
	var target = e.getAttribute('data-target');
	var el = _(target);
	var dd = el.querySelectorAll('.details');
	var summary = el.querySelector('.summary');
	var cls = el.className;
	var show = 'none';
	if ('expand' != cls) {
		el.className = 'expand';
		show = 'block';
		summary.innerHTML = expand;
	} else {
		el.className = 'collapse';
		summary.innerHTML = collapse;
	}
	
	for (var i = 0; i < dd.length; i++) {
		dd[i].style.display = show;
	}
}

/**
 * 通用切换
 */
function toggle(e) {
	var expand = e.getAttribute('data-expand');
	var collapse = e.getAttribute('data-collapse');
	var target = e.getAttribute('data-target');
	var el = document.getElementById(target);
	var exp = el.getAttribute('data-expand');
	var coll = el.getAttribute('data-collapse');
	if ('none' != el.style.display) {
		el.style.display = 'none';
		e.innerHTML = collapse;
		eval(coll);
	} else {
		el.style.display = 'block';
		e.innerHTML = expand;
		eval(exp);
	}
}


// 在全局环境中执行
function  evalGlobal(strScript) {
	 with ( window )eval (strScript) ;
	//with (window) eval(strScript);
}

// 增强的 eval
function eval_script(str) {
	str = TransferString(str);
	eval(str);
}

/**
 * 数组
 */
// 是否在数组中
function in_array(search, array) {
    for(var i in array){
        if(array[i] == search){
            return true;
        }
    }
    return false;
}

//替换所有的回车换行    
function TransferString(content, br)    
{    
	br = br || '';
    var string = content;    
    try{    
        string=string.replace(/\r\n/g, br)    
        string=string.replace(/\n/g, br);    
    }catch(e) {    
        alert(e.message);    
    }    
    return string;    
}

function form_data(id) {
	var frm = document.getElementById(id);
	var input = frm.getElementsByTagName('input');
	var npt;
	var data = [];
	for (var i = 0; i < input.length; i++) {
		npt = input[i];
		if (npt.name) {
			if ('checkbox' == npt.type) {
				if (npt.checked) {
					data.push([npt.name, npt.value]);
				}
			}
		}
	}
	//alert(JSON.stringify(data));
	return data;
}

function _form_data(frm) {
	var input = frm.elements;
	var npt;
	var data = [];
	for (var i = 0; i < input.length; i++) {
		npt = input[i];
		if (npt.name) {
			data.push([npt.name, npt.value]);
		}
	}
	//alert(JSON.stringify(data));
	return data;
}

function http_build_query(data) {
	var row;
	var query = [];
	for (var i = 0; i < data.length; i++) {
		row = data[i];
		row[0] = encodeURIComponent(row[0]);
		row[1] = encodeURIComponent(row[1]);
		query.push(row.join('='));
	}
	return query.join('&');
}

// 改变表格单元数据
function table_change_td(id, chk, html, col) {
	html = html || 'TEST';
	col = col || 0;
	var table = document.getElementById(id);
	var tr = table.getElementsByTagName('tr');
	for (var i = 0; i < tr.length; i++) {
		var row = tr[i];
		var input = row.getElementsByTagName('input');
		var td = row.getElementsByTagName('td');
		var npt = input[0];
		if (npt.name) {
			if ('checkbox' == npt.type) {
				if (in_array(npt.value, chk)) {
					td[col].innerHTML = html;
				}
			}
		}
	}
}

/*  */
function htmlspecialchars(str) {            
  str = str.replace(/&/g, '&amp;');  
  str = str.replace(/</g, '&lt;');  
  str = str.replace(/>/g, '&gt;');  
  str = str.replace(/"/g, '&quot;');  
  str = str.replace(/'/g, '&#039;');  
  return str;  
}

function html_str(str) {            
  if ('null' == str) {
	  str = '';
  } else {
	  str = htmlspecialchars(str);
  }
  return str;  
}

function func(str) {
	var html = ('null' == str) ? '' : str;
	return html;
}

function auto(name, editor) {
	var html = '自动';
	if (0 < editor) {
		html = func(name);
	}
	return html;
}

/**
 * 扩展 String 函数
 */

 /* 日期格式化 */
String.prototype.date_format = function (format, ignore) {
	return _.date(format, String(this), 1000, ignore);
}

/* 填充 */
String.prototype.str_pad = function (length, pad_string, pad_type, string) {
	length = length || 2;
	pad_string = pad_string || 0;
	pad_type = pad_type || 'left';
	string = string || this.trim();
	
	var arr = Array(length);
	var str = arr.join(pad_string);
	var s = pad = '';
	var n = 0;
	if ('left' == pad_type) {
		s = str + string;
		n = -length;
		pad = s.slice(n);
	} else if ('right' == pad_type) {
		s = string + str;
		pad = s.substr(0, length);
	}
	//return JSON.stringify([length, string, arr, str, s, pad]);
	return pad;
}

/* 获取数组的值 */
String.prototype.array_value = function (var_name, zeng) {
	zeng = zeng || 0;
	eval('var arr = ' + var_name + ';');
	var key = this.trim();
	if (zeng) {
		key = Number(key) + zeng;
	}
	
	return arr[key];
}
