/**
 * 设置提示数组
 * 
 * 用这种方式变量名不易冲突
 */
_.cache.set('apply_tip', 
	[
		'请输入支付宝账号', 
		'请输入正确的支付宝账号', 
		'请输入订单号', 
		'请输入正确的订单号', 
		'请选择要上传的图片', 
		'不支持的文件类型', 
		'生成预览失败', 
		'文档元素不存在',
		'文件不可用',
		'旺旺号或订单号有误',
	]
);

/**
 * 检测要上传的文件
 */
function check_screen_shot(e, preview, upload) {
	var val = e.value.trim();
	var result = -1;
	if (val) {
		var match = _.file.preview(preview);
		if (2 == match) {
			screen_shot_tip.innerHTML = '';
			if (!upload) {
				result = _.file.upload('screen_shot', order_no.value.trim());
			}
			
		} else if (1 == match) {
			result = 6;
			
		} else {
			result = 5;
		}
	} else {
		result = 4;
	}
	
	if (-1 < result) {
		screen_shot_tip.innerHTML = _.cache.get('apply_tip')[result];
	}
	return result;
}

/**
 * 检测会员名
 */
function check_alipay_id(e, ajax) {
	var val = e.value.trim();
	var result = -1;
	if (val) {
		var len = _.str.len(val);
		if (62 > len && 4 < len) {
			alipay_id_tip.innerHTML = '';
			if (!ajax) {
				result = ajax_check(result);
			}
			
		} else {
			result = 1;
		}
	} else {
		result = 0;
	}
	
	if (-1 < result) {
		alipay_id_tip.innerHTML = _.cache.get('apply_tip.' + result);
	}
	return result;
}

/**
 * 检测订单号
 */
function check_order_no(e, ajax) {
	var val = e.value.trim();
	var result = -1;
	if (val) {
		var len = val.length;
		if (18 <= len) {
			order_no_tip.innerHTML = '';
			if (!ajax) {
				result = ajax_check(null, result);
			}
			
		} else {
			result = 3;
		}
	} else {
		result = 2;
	}
	
	if (-1 < result) {
		order_no_tip.innerHTML = _.cache.get('apply_tip')[result];
	}
	return result;
}

/**
 * 查询订单
 */
function ajax_check(id, no) {
	id = id || check_alipay_id(alipay_id, 1);
	no = no || check_order_no(order_no, 1);
	var result = 9; //其中一个有错
	result = -1;
	
	/* 都验证通过则检查数据 */
	if (-1 == id && -1 == no) {
		var query = 'type=' + apply_types.value + '&no=' + encodeURIComponent(order_no.value) + '&id=' + encodeURIComponent(alipay_id.value);
		var key = 'check_order_no_id';
		if (query != _.cache.get(key)) { //同样参数只请求一次
			_.api('check_order', query);
			_.cache.set(key, query)
		}
		result = -1;
	}
	//alert(JSON.stringify(_.cache.object));
	submit_tip.innerHTML = '';
	return result;
}

/**
 * 检测表单
 */
function form_check(type) {
	var id = check_alipay_id(alipay_id, 1);
	var no = check_order_no(order_no, 1);
	var snap = -1;
	if (!type) {
		snap = check_screen_shot(screen_shot, null, 1);
	}
	
	if (-1 == id && -1 == no && -1 == snap) {
		var msg = alipay_id_tip.innerHTML + order_no_tip.innerHTML;
		if (!type) {
			msg += screen_shot_tip.innerHTML;
		}
		// document.title = msg;
		if (!msg) {
			return true;
		}
	}
	
	submit_tip.innerHTML = '';
	return false;
}
