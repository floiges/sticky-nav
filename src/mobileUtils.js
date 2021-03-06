window.mobileUtil = (function(win, doc) {
	var UA = navigator.userAgent,
		isAndroid = /android|adr/gi.test(UA),
		isIos = /iphone|ipod|ipad/gi.test(UA) && !isAndroid,
		isMobile = isAndroid || isIos;
	return {
		isAndroid: isAndroid,
		isIos: isIos,
		isMobile: isMobile,
		isNewsApp: /NewsApp\/[\d.]+/gi.test(UA),
		isWeixin: /MicroMessenger/gi.test(UA),
		isQQ: /QQ\/\d/gi.test(UA),
		isYixin: /YiXin/gi.test(UA),
		isWeibo: /Weibo/gi.test(UA),
		isTXWeibo: /T(?:X|encent)MicroBlog/gi.test(UA),
		tapEvent: isMobile ? "tap" : "click",
		fixScreen: function(config) {
			var metaEl = doc.querySelector('meta[name="viewport"]'),
				metaCtt = metaEl ? metaEl.content : "",
				matchScale = metaCtt.match(/initial-scale=([\d.]+)/),
				matchWidth = metaCtt.match(/width=([^,\s]+)/);
			if (!metaEl) {
				let docEl = doc.documentElement,
					maxwidth = docEl.dataset.mw || 750,
					dpr = isIos ? Math.min(win.devicePixelRatio, 3) : 1,
					scale = 1 / dpr,
					tid;
				docEl.removeAttribute("data-mw");
				docEl.dataset.dpr = dpr;
				metaEl = doc.createElement("meta");
				metaEl.name = "viewport";
				metaEl.content = fillScale(scale, config);
				docEl.firstElementChild.appendChild(metaEl);
				var refreshRem = function() {
					let width = docEl.getBoundingClientRect().width;
					if (width / dpr > maxwidth) {
						width = maxwidth * dpr;
					}
					let rem = width / 10;
					docEl.style.fontSize = rem + "px";
				};
				win.addEventListener(
					"resize",
					function() {
						clearTimeout(tid);
						tid = setTimeout(refreshRem, 300);
					},
					false
				);
				win.addEventListener(
					"pageshow",
					function(e) {
						if (e.persisted) {
							clearTimeout(tid);
							tid = setTimeout(refreshRem, 300);
						}
					},
					false
				);
				refreshRem();
			} else if (
				isMobile &&
				!matchScale &&
				(matchWidth && matchWidth[1] != "device-width")
			) {
				// 定宽
				let width = parseInt(matchWidth[1]),
					iw = win.innerWidth || width,
					ow = win.outerWidth || iw,
					sw = win.screen.width || iw,
					saw = win.screen.availWidth || iw,
					ih = win.innerHeight || width,
					oh = win.outerHeight || ih,
					ish = win.screen.height || ih,
					sah = win.screen.availHeight || ih,
					w = Math.min(iw, ow, sw, saw, ih, oh, ish, sah),
					scale = w / width;
				if (scale < 1) {
					metaEl.content = metaCtt + "," + fillScale(scale, config);
				}
			}

			function fillScale(scale, config) {
				//用以谷歌模拟时候用百分比做适配的兼容
				if (config && config.usingPercentage) {
					scale = 1;
				}
				return (
					"initial-scale=" +
					scale +
					",maximum-scale=" +
					scale +
					",minimum-scale=" +
					scale +
					",user-scalable=no"
				);
			}
			return dpr;
		}
	};
})(window, document);

window.mobileUtil.fixScreen();

var $html=document.querySelector("html");
var $viewport = document.querySelector("meta[name=viewport]");
var dpr = $html.dataset.dpr,htmlFontSize = $html.style.fontSize.split("px")[0];
$viewport.setAttribute("content",'initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no');
$html.setAttribute("style",'font-size: '+ htmlFontSize/dpr +'px!important;');