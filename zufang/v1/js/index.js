/*---- 定义 ------*/
// 全局变量
global = {
	page: server.page + 1,
	overflow: server.overflow,
	el_flt_select: panel_filter.getElementsByTagName('select')
}

XHR = []
AJAX = []
RESP = []
DATA = {
	category: {
		'': {'': '子类'}
	}
}

// 配置
config = {
	api_host: '',
	cdn_host: 'https://urlnk.host/'
}

//* window.onscroll = scroll

/*---- polyfill ------*/

if ( 'undefined' == typeof URLSearchParams ) {
	var URLSearchParams = function ( init ) {
		obj = new Object
		obj.data = {}
		
		obj.append = function ( key, value ) {
			obj.data[ key ] = value
		}
		
		obj.toString = function () {
			arr = []
			for ( key in obj.data ) {
				arr.push( key + '=' + encodeURIComponent( obj.data[ key ] ) )
			}
			return arr.join( '&' )
		}
		return obj
	}
}

/*---- 类库 ------*/
/**
 * 类库 - 主函数对象
 */
var _ = function () {
}

_.form = function () {
}

/**
 * 接口 - 调用
 */
_.api = function ( uri, formData, method, queryString, arg ) {
	method = method || 'get'
	method = method.toUpperCase()
	arg = arg || {}	
	
	if ( 'GET' == method && ! queryString && formData ) {
		params = new URLSearchParams
		for ( pair in formData ) {
		   params.append( pair, formData[ pair ] )
		}
		queryString = params.toString()		
	}
	
	url = config.api_host + 'api/' + uri
	if ( queryString ) {
		url += '?' + queryString
	}
	
	uri = uri.replace( /\//, '_' )
	req = XHR[ uri ] = new XMLHttpRequest
	req.onreadystatechange = function () {
		if ( 4 == req.readyState ) {
			if ( 200 == req.status ) {
				eval( "json = " + req.responseText + "; _.api.run( json, '" + uri + "', '" + encodeURI(JSON.stringify(arg)) + "' )" )
			} else {
				alert( 'Problem retrieving data: ' + req.statusText )
			}
		}
	}
	req.open( method, url, true )
	if ( 'POST' == method ) {
		req.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' )
	}
	req.send( formData )
}

/**
 * 接口 - 运行
 */
_.api.run = function (json, func, arg) {
	RESP[func] = json
	if (json) {
		if (3 < json.code) {
			alert(json.msg)
			
		} else {			
			eval("api_" + func + "('" + arg + "')")
		}
		
	} else {
		str = JSON.stringify([json, func, arg])
		alert('_.api.run() ERROR: ' + str)
	}
}

/**
 * DOM - 获取视口和文档尺寸及滚动条信息
 *
 */
_.viewport = function () {
	doc = document.body
	if ('BackCompat' == document.compatMode) {
		return {
			width: doc.clientWidth,
			height: doc.clientHeight,
			left: doc.scrollLeft,
			top: doc.scrollTop,
			scrollWidth: doc.scrollWidth,
			scrollHeight: doc.scrollHeight
		}
	}
	el = document.documentElement
	return {
		width: el.clientWidth,
		height: el.clientHeight,
		left: el.scrollLeft || doc.scrollLeft,
		top: el.scrollTop || doc.scrollTop,
		scrollWidth: el.scrollWidth,
		scrollHeight: el.scrollHeight
	}
}

/**
 * 表单 - 删除空值元素
 *
 */
_.form.removeNull = function (obj) {
	npt = obj.getElementsByTagName('input')
	len = npt.length
	i = 0
	for (; i < len; i++) {
		el = npt[i]
		if ('' === el.value) {
			el.removeAttribute('name')
		}
	}
	// return true
}

/*---- 自定义接口 ------*/
/**
 * API - 追加商品列表
 */
function api_item_list(arg) {
	position = 'beforeEnd'
	load_msg = ''
	json = RESP['item_list']
	code = json.code
	msg = json.msg	
	switch (code) {
		case 0:
			break
		case 1:
		case 2:
			load_msg = msg
			global.overflow = 1
			break
		case 3:
			alert(msg)
			return
		default:
			alert(code + ': ' + msg)
			return
	}
		
	data = json.data
	len = data.length
	i = 0
	list = [items_left, items_right]
	for (; i < len; i++) {
		odd = i % 2
		row = data[i]
		
		// 优惠券面额
		save = '券'
		cls = ''
		if ('3' == row.site) {
			save = '省'
		    cls = ' class="tuan"'
		}
		
		html = '<dl ' + cls + '>'
				+ '<a href="/item/' + row.excel_id + '" target="_blank">'
				    + '<menu>' + save + '￥' + row.save + '</menu>'
					+ '<img src="' + row.pic + '_200x200.jpg">'
					+ '<span>'						
						+ '<h4>' + row.title + '</h4>'
					+ '</span>'
					+ '<data>'
						+ '<p>￥' + row.price + '</p>'
						+ '<s>月销' + row.sold + '笔</s>'
					+ '</data>'
				+ '</a>'
			+ '</dl>'
		
		list[odd].insertAdjacentHTML(position, html)
	}
	load_info.innerHTML = load_msg
	global.page++
}

/**
 * API - 生成子分类列表
 */
function api_area(arg) {
	json = RESP['area']
	// console.log(json)
	data = json.data
	list = data.list
	len = list.length
	i = 0
	obj = {}
	for (; i < len; i++) {
		row = list[i]
		obj[row.area_id] = row.title
		
	}
	DATA.category[data.area_id] = obj
	// console.log(DATA)
	
	selectSubclass(data.area_id, '区域')
}




/**
 * AJAX - 加载数据
 *
 */
function loadData() {	
	uri = 'item/list'
	key = uri + ':' + global.page
	if ( server.count && ! global.overflow && ! AJAX[ key ] ) {
		AJAX[ key ] = 1		
		load_info.innerHTML = '玩命加载中……'
		
		formData = {}
		npt = search_form.getElementsByTagName( 'input' )
		len = npt.length
		i = 0
		for ( ; i < len; i++ ) {
			el = npt[ i ]
			if ( el.name && '' !== el.value ) {
				formData[ el.name ] = el.value
			}
		}
		if ( 1 < global.page ) {
			formData.page = global.page
		}
		// _.api( uri, formData )
	}
}

/*---- 页面函数 ------*/
/**
 * UI - 切换排序下拉菜单
 */
function order() {
	cls = order_first.className
	color = '_grey'
	if ('cur' == cls) {
		color = ''
	}

	display = 'none'
	url = 'ui/mobi/img/arr' + color + '.png'
	if ('block' != order_list.style.display) {
		display = 'block'
		url = 'ui/mobi/img/uarr' + color + '.png'
	}
	url = config.cdn_host + url
	order_list.style.display = glass.style.display = display
	order_first.style.backgroundImage = 'url(' + url + ')'
	return false
}

/**
 * UI - 切换筛选浮动面板
 */
function filter() {
	if ('block' != panel_filter.style.display) {
		panel_filter.style.display = 'block'
		body.style.overflow = 'hidden'
		
	} else {
		panel_filter.style.display = 'none'
		body.style.overflow = ''
		
	}
	return false
}

/**
 * UX - 滚动到顶部
 */
function goTop(step) {
	step = step || 3
	scrollTop = _.viewport().top	
	per = Math.ceil(scrollTop / step) + 1
	i = 1
	len = step + 1
	for (; i < len; i++) {
		y = scrollTop - per * i
		setTimeout("window.scrollTo(0, " + y + ")", 100 * i)
	}
	return false
}

/**
 * DOM - 生成子分类列表
 */
function selectSubclass(cid, title) {
	title = title || '子类'

	global.el_flt_select[1].innerHTML = ''
	if (cid) {
		global.el_flt_select[1].innerHTML = '<option value="">' + title + '</option>'
		global.el_flt_select[1].removeAttribute('disabled')
	} else {
		global.el_flt_select[1].setAttribute('disabled', 'disabled')
	}
	
	obj = DATA.category[cid]
	// console.log(obj)
	for (prop in obj) {
		// console.log(prop)
		option = document.createElement('option')
		option.value = prop
		option.innerHTML = obj[prop]
		global.el_flt_select[1].appendChild(option)
	}
}

/**
 * 窗口事件 - 滚动条
 */
function scroll() {
	viewport = _.viewport()
	scrollTop = viewport.top	
	clientHeight = viewport.height
	if (scrollTop > clientHeight) {
		got_top.style.display = 'block'
	} else {
		got_top.style.display = 'none'
	}
	
	height = viewport.scrollHeight - 144
	if (height <= clientHeight + scrollTop) {
		loadData()
	}
}

/**
 * onsubmit - 搜索
 */
function search() {
	// _.form.removeNull(search_form)
	//if ( server.category_id ) {
		hash = '#cat_' + server.category_id
		if (hash != location.hash) {
			search_form.action = hash
		}
	//}
	return true
}

/**
 * onsubmit - 过滤
 */
function filterSubmit( id, cat, sub ) {
	// 单选列表
	select = panel_filter.getElementsByTagName('select')
	len = select.length
	i = 0
	for (; i < len; i++) {
		row = select[i]
		nm = row.name
		val = row.value

		if ('subarea' == nm && row.value) {
			nm = 'area'
		} else if('area' == nm) {
			server.category_id = val
		}

		el = document.getElementsByName(nm)
		// console.log(el)
		if (1 < el.length) {
			el[1].value = val
		}
	}
	
	// 范围
	key = ['price', 'sqm']
	le = key.length
	j = 0
	for (; j < le; j++) {
		nm = key[j]
		price = document.getElementsByName(nm + '[]')

		min = price[0].value
		max = price[1].value

		val = (min || max) ? min + '_' + max : ''
		// console.log([min, max, val])
		document.getElementsByName(nm)[0].value = val
	}

	search()
	search_form.submit() // 
	return false
}

/**
 * onchange - 主分类
 */
function selectCategory(e) {
	el = e.target || e.srcElement
	key = el.value
	row = DATA.category[key]
	if ('undefined' == typeof row) {
		formData = {
			'area_id': key,
			'do': 'subarea'
		}
		_.api( 'area', formData )
	} else {
		// console.log([row, ])
		selectSubclass(key, '区域')
	}
}

/**
 * APP - 检测设备
 */
function appDevice() {
	if ( 'undefined' != typeof tip_bar ) {
		// 非特定设备
		if ( ! server.client ) {
			tip_bar.style.display = 'none'
			
		
		} else if ( 'undefined' != typeof tip_open) {
			// 微信
			if ( server.client.match( /^(MicroMessenger)$/i ) ) {				
				window.setTimeout( "tip_wx.style.display = 'none'", 700 )
			}
			window.setTimeout( "tip_open.style.display = 'block'", 700 )
		}
	}

	global.el_flt_select[0].addEventListener('change', selectCategory)
}
appDevice()