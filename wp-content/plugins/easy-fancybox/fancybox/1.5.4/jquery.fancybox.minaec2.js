!function(e){var t,n,o,i,a,r,c,d,l,s,f,h,u,p,b,g=0,m={},v=[],y=0,w={},x=[],_=null,C=new Image,k=/\.(jpg|gif|png|bmp|jpeg|webp)(.*)?$/i,I=/[^\.]\.(svg)\s*$/i,N=/[^\.]\.(pdf)\s*$/i,S=0,O="",T=!1,j=!1,A=(window.devicePixelRatio,"ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0);_abort=function(){e.fancybox.hideActivity(),C.onerror=C.onload=null,_&&_.abort(),t.empty()},_error=function(n){if(!1===m.onError(v,g,m))return e.fancybox.hideActivity(),void(T=!1);void 0===n&&(n=m.txt.error.later),m.type="html",m.enableSwipeNav=!1,m.titleShow=!1,m.width="auto",m.height="auto",t.html('<p id="fancybox-error">'+m.txt.error.content+"<br />"+n+"</p>"),_process_inline()},_start=function(){var n,o,i,a,c=v[g];if(_abort(),m=e.extend({},e.fn.fancybox.defaults,void 0===e(c).data("fancybox")?m:e(c).data("fancybox")),e("html").addClass("fancybox-active"),e(document).trigger("fancybox-start",[v,g,m]),!1!==(a=m.onStart(v,g,m)))if("object"==typeof a&&(m=e.extend(m,a)),i=m.title||(c.nodeName?e(c).attr("title"):c.title)||"",c.nodeName&&!m.orig&&(m.orig=e(c).find("img:first").length?e(c).find("img:first"):e(c)),""===i&&m.orig&&(i=m.orig.attr("title")||(m.titleFromAlt?m.orig.attr("alt"):"")),n=m.href||(c.nodeName?e(c).attr("href"):c.href)||null,(/^(?:javascript)/i.test(n)||"#"==n)&&(n=null),m.type?(o=m.type,n||(n=m.content)):m.content?o="html":e(c).hasClass("iframe")?o="iframe":n&&(o=n.match(k)||e(c).hasClass("image")?"image":n.match(I)?"svg":n.match(N)?"pdf":0===n.indexOf("#")?"inline":"ajax"),o)switch(e(c).hasClass("modal")&&(m.modal=!0),"inline"==o&&(c=n.substr(n.indexOf("#")),o=e(c).length>0?"inline":"ajax"),m.type=o,m.href=n,m.title=i,m.autoDimensions&&("html"==m.type||"inline"==m.type||"ajax"==m.type?(m.width="auto",m.height="auto"):m.autoDimensions=!1),m.modal&&(m.overlayShow=!0,m.hideOnOverlayClick=!1,m.hideOnContentClick=!1,m.enableEscapeButton=!1,m.showCloseButton=!1),m.padding=parseInt(m.padding,10),m.margin=parseInt(m.margin,10),t.css("padding",m.padding+m.margin),m.enableEscapeButton&&e(document).on("keydown.fb",(function(t){if(27==t.keyCode)return t.preventDefault(),e.fancybox.cancel(),!1})),o){case"html":t.html(m.content),m.enableSwipeNav=!1,_process_inline();break;case"inline":if(!0===e(c).parent().is("#fancybox-content"))return void(T=!1);m.enableSwipeNav=!1,e(c).clone().attr("id",e(c).attr("id")+"-tmp").insertBefore(e(c)),e(document).on("fancybox-cleanup fancybox-change",(function(){let t=r.children().children();e("#"+t.attr("id")+"-tmp").replaceWith(t)})).on("fancybox-cancel",(function(){let n=t.children();n.length||(n=r.children().children()),e("#"+n.attr("id")+"-tmp").replaceWith(n)})),e(c).appendTo(t),_process_inline();break;case"image":m.keepRatio=!0,T=!1,(C=new Image).onerror=function(){_error(m.txt.error.image)},C.onload=function(){T=!0,e.fancybox.hideActivity(),C.onerror=C.onload=null,m.width=C.width,m.height=C.height,e("<img />").attr({id:"fancybox-img",src:C.src,alt:m.title}).appendTo(t),_show()},C.src=n,e.fancybox.showActivity();break;case"svg":m.scrolling="no",m.keepRatio=!0;var d='<object type="image/svg+xml" width="'+m.width+'" height="'+m.height+'" data="'+n+'"></object>';t.html(d),_process_inline();break;case"pdf":m.scrolling="no",m.enableSwipeNav=!1;d='<object type="application/pdf" width="100%" height="100%" data="'+n+'"><a href="'+n+'" style="display:block;position:absolute;top:48%;width:100%;text-align:center">'+e(c).html()+"</a></object>";t.html(d),_process_inline();break;case"ajax":m.enableKeyboardNav=!1,m.showNavArrows=!1,m.enableSwipeNav=!1,T=!1,e.fancybox.showActivity(),m.ajax.win=m.ajax.success,_=e.ajax(e.extend({},m.ajax,{url:n,data:m.ajax.data||{},error:function(){arguments[0].status>0&&_error(arguments[2])},success:function(o,i,r){if(200==("object"==typeof r?r:_).status){if("function"==typeof m.ajax.win){if(!1===(a=m.ajax.win(n,o,i,r)))return void e.fancybox.hideActivity();"string"!=typeof a&&"object"!=typeof a||(o=a)}o.indexOf("<!DOCTYPE")>-1||o.indexOf("<html")>-1||o.indexOf("<body")>-1?_error(m.txt.error.unexpected):(t.html(o),_process_inline())}}}));break;case"iframe":m.enableSwipeNav=!1,e.fancybox.showActivity(),_show();break}else _error(m.txt.error.type);else T=!1},_process_inline=function(){var n=m.width,o=m.height;e.fancybox.hideActivity(),n=n.toString().indexOf("%")>-1?parseInt((window.innerWidth-2*m.margin)*parseFloat(n)/100,10)+"px":"auto"==n?"auto":n+"px",o=o.toString().indexOf("%")>-1?parseInt((window.innerHeight-2*m.margin)*parseFloat(o)/100,10)+"px":"auto"==o?"auto":o+"px",t.wrapInner('<div style="width:'+n+";height:"+o+';overflow:hidden;position:relative;"></div>'),m.width=t.width(),m.height=t.height(),_show()},_show=function(){if(T=!0,e(r.add(o)).off(),e(window).off("resize.fb"),h=w.type,x=v,y=g,(w=m).overlayShow?(o.css({"background-color":w.overlayColor,opacity:w.overlayOpacity,cursor:w.hideOnOverlayClick?"pointer":"auto"}),o.is(":visible")||o.fadeIn("fast")):o.hide(),_process_title(),u=_get_zoom_to(),i.is(":visible"))return e(c.add(l).add(s)).hide(),void("image"===h&&"image"===w.type?(r.prepend(t.contents()),r.children().first().next().fadeOut(w.changeSpeed,(function(){e(this).remove()})),r.css("border-width",w.padding),i.animate(u,{duration:w.changeSpeed,easing:w.easingChange,complete:_finish})):r.fadeTo(w.changeFade,.3,(function(){r.css("border-width",w.padding),i.animate(u,{duration:w.changeSpeed,easing:w.easingChange,complete:function(){r.html(t.contents()).fadeTo(w.changeFade,1,_finish)}})})));i.removeAttr("style"),r.css("border-width",w.padding),r.html(t.contents()),"elastic"==w.transitionIn?(i.css(_get_orig_pos()).show(),u.opacity=1,i.attr("aria-hidden","false").animate(u,{duration:w.speedIn,easing:w.easingIn,complete:_finish})):i.css(u).attr("aria-hidden","false").fadeIn("none"==w.transitionIn?0:w.speedIn,_finish)},_format_title=function(e){return!(!e||!e.length)&&'<div id="fancybox-title">'+e+"</div>"},_process_title=function(){if(O=w.title||"",S=0,d.empty().removeAttr("style").removeClass(),!1!==w.titleShow)if((O=e.isFunction(w.titleFormat)?w.titleFormat(O,x,y,w):_format_title(O))&&""!==O){switch(d.addClass("fancybox-title-"+w.titlePosition).html(O).appendTo("body").show(),w.titlePosition){case"outside":case"inside":S=d.outerHeight(!0),d.appendTo(a);break;case"over":r.is(":visible")?d.appendTo(r):d.appendTo(t);break;default:d.css({paddingLeft:w.padding,paddingRight:w.padding}).appendTo(i)}d.hide()}else d.hide();else d.hide()},_swipe=function(){let t=p-b;p=b=0,Math.abs(t)<w.swipeThreshold||(t<0?e.fancybox.prev():e.fancybox.next())},_set_navigation=function(){1!==x.length&&(w.enableSwipeNav&&(i.css("cursor","move"),i.on("mousedown.fb",(function(e){e.preventDefault(),p=b=void 0!==e.clientX?e.clientX:e.originalEvent.clientX,i.on("mousemove.fb",(function(e){b=void 0!==e.clientX?e.clientX:e.originalEvent.clientX}))})),i.on("mouseup.fb",(function(){i.off("mousemove.fb"),_swipe()})),A&&(i.on("touchstart.fb",(function(e){j=1===e.touches.length,p=b=void 0!==e.touches?e.touches[0].clientX:e.originalEvent.touches[0].clientX,i.on("touchmove.fb",(function(e){1===e.touches.length?b=void 0!==e.touches?e.touches[0].clientX:e.originalEvent.touches[0].clientX:(j=!1,i.off("touchmove.fb"))}))})),i.on("touchend.fb",(function(){i.off("touchmove.fb"),j&&(j=!1,_swipe())})))),e.fn.mousewheel&&i.on("mousewheel.fb",(function(t,n){T?t.preventDefault():"image"!=w.type||0!=e(t.target).outerHeight()&&e(t.target).prop("scrollHeight")!==e(t.target).outerHeight()||(t.preventDefault(),e.fancybox[n>0?"prev":"next"]())})),e(document).off("keydown.fb"),(w.enableEscapeButton||w.enableKeyboardNav)&&e(document).on("keydown.fb",(function(t){if(w.enableEscapeButton&&27==t.keyCode)return t.preventDefault(),e.fancybox.close(),!1;!w.enableKeyboardNav||37!=t.keyCode&&39!=t.keyCode||"INPUT"===t.target.tagName||"TEXTAREA"===t.target.tagName||"SELECT"===t.target.tagName?w.enableKeyboardNav&&9==t.keyCode&&"INPUT"!==t.target.tagName&&"TEXTAREA"!==t.target.tagName&&"SELECT"!==t.target.tagName&&(t.preventDefault(),e.fancybox[t.shiftKey?"prev":"next"]()):(t.preventDefault(),e.fancybox[37==t.keyCode?"prev":"next"]())})),w.showNavArrows&&((w.cyclic||0!==y)&&l.attr("title",w.txt.prev).show(),(w.cyclic||y!=x.length-1)&&s.attr("title",w.txt.next).show()))},_finish=function(){O&&O.length&&d.fadeIn(),w.showCloseButton&&c.attr("title",w.txt.close).show(),_set_navigation(),w.hideOnContentClick&&r.on("click",e.fancybox.close).css("cursor","pointer"),w.hideOnOverlayClick&&o.on("click",e.fancybox.close),w.autoResize&&e(window).on("resize.fb",e.fancybox.resize),"iframe"==w.type&&e('<iframe id="fancybox-frame" name="fancybox-frame'+(new Date).getTime()+'" style="border:0;margin:0;overflow:'+("auto"==w.scrolling?"auto":"yes"==w.scrolling?"scroll":"hidden")+'" src="'+w.href+'"'+(!1===w.allowfullscreen?"":" allowfullscreen")+' allow="autoplay; encrypted-media" tabindex="999"></iframe>').appendTo(r).on("load",(function(){e.fancybox.hideActivity()})),"inline"!=w.type&&"html"!=w.type||e(r).children().css("overflow","auto"==w.scrolling?"auto":"yes"==w.scrolling?"scroll":"hidden"),i.show().focus(),T=!1,e(document).trigger("fancybox-complete",[x,y,w]),w.onComplete(x,y,w),x.length>1&&(_preload_next(),_preload_prev())},_preload_next=function(){var e="number"==typeof arguments[0]?arguments[0]:y+1;if(e>=x.length){if(!w.cyclic)return;e=0}if(e==y)return w.enableKeyboardNav=!1,w.enableSwipeNav=!1,i.off("mousewheel.fb touchstart.fb touchmove.fb touchend.fb mousedown.fb mousemove.fb mouseup.fb"),void s.hide();_preload_image(e)||_preload_next(e+1)},_preload_prev=function(){var e="number"==typeof arguments[0]?arguments[0]:y-1;if(e<0){if(!w.cyclic)return;e=x.length-1}if(e==y)return w.enableKeyboardNav=!1,w.enableSwipeNav=!1,i.off("mousewheel.fb touchstart.fb touchmove.fb touchend.fb mousedown.fb mousemove.fb mouseup.fb"),void l.hide();_preload_image(e)||_preload_prev(e-1)},_preload_image=function(t){var n=x[t];return!(void 0===n||void 0===n.href||n.href===w.href||!n.href.match(k)&&!e(n).hasClass("image"))&&((new Image).src=n.href,!0)},_get_zoom_to=function(){var t=[window.innerWidth-2*w.margin,window.innerHeight-2*w.margin-S,e(document).scrollLeft()+w.margin,e(document).scrollTop()+w.margin],n={},o=w.keepRatio&&w.height?w.width/w.height:1;return w.width.toString().indexOf("%")>-1?n.width=parseInt(t[0]*parseFloat(w.width)/100,10):n.width=w.width+2*w.padding,w.height.toString().indexOf("%")>-1?n.height=parseInt(t[1]*parseFloat(w.height)/100,10):n.height=w.height+2*w.padding,n.width>t[0]&&(w.autoScale?(n.width=t[0]-2*w.padding,n.height=parseInt(n.width/o,10)):e("html").addClass("fancybox-allowscroll")),w.autoScale&&n.height>t[1]&&(w.autoScale?(n.height=t[1]-2*w.padding,n.width=parseInt(n.height*o,10)):e("html").addClass("fancybox-allowscroll")),n.left=parseInt(Math.max(t[2],t[2]+(t[0]-n.width)/2),10),n.top=parseInt(Math.max(t[3],t[3]+(t[1]-n.height)/2),10),n},_get_orig_pos=function(){if(!m.orig)return!1;var t=e(m.orig);if(!t.length)return!1;var n=t.offset();return n.top+=parseInt(t.css("paddingTop"),10)||parseInt(t.css("border-top-width"),10)||0,n.left+=parseInt(t.css("paddingLeft"),10)||parseInt(t.css("border-left-width"),10)||0,{width:t.width()+2*w.padding,height:t.height()+2*w.padding,top:n.top-w.padding,left:n.left-w.padding,opacity:0}},_closed=function(){o.fadeOut("fast"),e(document).trigger("fancybox-closed",[x,y,w]),w.onClosed(x,y,w),_cleanup()},_cleanup=function(){o.hide(),d.empty().hide(),i.hide().attr("aria-hidden","true"),r.empty(),x=v=[],y=g=0,w=m={},e("html").css({"--vertical-scrollbar":"","--horizontal-scrollbar":""}),e("html").removeClass("fancybox-active fancybox-allowscroll"),e(document).off("fancybox-cancel fancybox-change fancybox-cleanup fancybox-closed"),T=!1},e.fn.fancybox=function(t){if(!e(this).length)return this;let n=e.extend({},t,e.metadata?e(this).metadata():{});return(!n.minViewportWidth||document.documentElement.clientWidth>=n.minViewportWidth)&&e(this).data("fancybox",n).attr({"aria-controls":"fancybox-wrap","aria-haspopup":"dialog"}).off("click.fb").on("click.fb",(function(t){if(t.preventDefault(),T)return!1;T=!0,e(this).blur(),v=[],g=0;var n=e(this).attr("rel")||"";return""==n||""==n.replace(/alternate|external|help|license|nofollow|noreferrer|noopener|\s+/gi,"")?v.push(this):(v=e('a[rel="'+n+'"], area[rel="'+n+'"]'),g=v.index(this)),e("html").css({"--vertical-scrollbar":window.innerWidth-e(window).width()+"px","--horizontal-scrollbar":window.innerHeight-e(window).height()+"px"}),_start(),!1})),this},e.fancybox=function(t){var n;if(!T){if(T=!0,n=void 0!==arguments[1]?arguments[1]:{},v=[],g=parseInt(n.index,10)||0,e.isArray(t)){for(var o=0,i=t.length;o<i;o++)"object"==typeof t[o]?e(t[o]).data("fancybox",e.extend({},n,t[o])):t[o]=e({}).data("fancybox",e.extend({content:t[o]},n));v=jQuery.merge(v,t)}else"object"==typeof t?e(t).data("fancybox",e.extend({},n,t)):t=e({}).data("fancybox",e.extend({content:t},n)),v.push(t);(g>v.length||g<0)&&(g=0),e("html").css({"--vertical-scrollbar":window.innerWidth-e(window).width()+"px","--horizontal-scrollbar":window.innerHeight-e(window).height()+"px"}),_start()}},e.fancybox.showActivity=function(){n.attr("title",m.txt.loading).show()},e.fancybox.hideActivity=function(){n.hide()},e.fancybox.next=function(){var t,n="number"==typeof arguments[0]?arguments[0]:y+1;if(n>=x.length){if(!w.cyclic)return;n=0}t=x[n],n!=y&&void 0!==t&&void 0!==t.href&&t.href===w.href?e.fancybox.next(n+1):e.fancybox.pos(n)},e.fancybox.prev=function(){var t,n="number"==typeof arguments[0]?arguments[0]:y-1;if(n<0){if(!w.cyclic)return;n=x.length-1}t=x[n],n!=y&&void 0!==t&&void 0!==t.href&&t.href===w.href?e.fancybox.prev(n-1):e.fancybox.pos(n)},e.fancybox.pos=function(t){T||(t=parseInt(t),x.length>1&&t!=y&&t>-1&&t<x.length&&(e(document).trigger("fancybox-change"),v=x,g=t,i.off("mousewheel.fb touchstart.fb touchmove.fb touchend.fb mousedown.fb mousemove.fb mouseup.fb").css("cursor","initial"),r.off("click"),_start()))},e.fancybox.cancel=function(){T=!0,_abort(),e(document).trigger("fancybox-cancel",[v,g,m]),m&&!1===m.onCancel(v,g,m)?T=!1:(e(v[g]).focus(),e(c.add(l).add(s)).hide(),e(r.add(o)).off(),e(window).off("resize.fb"),e(i).off("mousewheel.fb touchstart.fb touchmove.fb touchend.fb mousedown.fb mousemove.fb mouseup.fb"),e(document).off("keydown.fb"),/MSIE|Trident/.test(window.navigator.userAgent)&&r.find("iframe#fancybox-frame").attr("src","//about:blank"),i.stop(),_cleanup())},e.fancybox.close=function(){T||i.is(":hidden")||(T=!0,_abort(),e(document).trigger("fancybox-cleanup",[x,y,w]),w&&!1===w.onCleanup(x,y,w)?T=!1:(e(x[y]).focus(),e(c.add(l).add(s)).hide(),e(r.add(o)).off(),e(window).off("resize.fb"),e(i).off("mousewheel.fb touchstart.fb touchmove.fb touchend.fb mousedown.fb mousemove.fb mouseup.fb"),e(document).off("keydown.fb"),/MSIE|Trident/.test(window.navigator.userAgent)&&r.find("iframe#fancybox-frame").attr("src","//about:blank"),"inside"!==w.titlePosition&&d.empty(),i.stop(),"elastic"==w.transitionOut?(d.empty().hide(),i.animate(_get_orig_pos(),{duration:w.speedOut,easing:w.easingOut,complete:_closed})):i.fadeOut("none"==w.transitionOut?0:w.speedOut,_closed)))},e.fancybox.resize=function(){clearTimeout(f),f=setTimeout((function(){var e=[];T=!0,_process_title(),u=_get_zoom_to(),c.is(":visible")&&e.push(c)&&c.hide(),l.is(":visible")&&e.push(l)&&l.hide(),s.is(":visible")&&e.push(s)&&s.hide(),i.animate(u,{duration:w.changeSpeed,easing:w.easingChange,complete:function(){O&&O.length&&d.fadeIn(),e.forEach((function(e){e.show()})),T=!1}})}),500)},e.fancybox.init=function(){e("#fancybox-wrap").length||(e("body").append(t=e('<div id="fancybox-tmp"></div>'),n=e('<div id="fancybox-loading" title="Cancel"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>'),o=e('<div id="fancybox-overlay"></div>'),i=e('<div id="fancybox-wrap" role="dialog" aria-hidden="true" aria-labelledby="fancybox-title" tabindex="-1"></div>')),i.append(a=e('<div id="fancybox-outer"></div>')),a.append(r=e('<div id="fancybox-content"></div>'),c=e('<a id="fancybox-close" href="javascript:;" title="Close" class="fancy-ico" tabindex="1"><span></span></a>'),s=e('<a id="fancybox-next" href="javascript:;" title="Next" class="fancy-ico" tabindex="2"><span></span></a>'),l=e('<a id="fancybox-prev" href="javascript:;" title="Previous" class="fancy-ico" tabindex="3"><span></span></a>'),d=e('<div id="fancybox-title-wrap"></div>')),c.on("click",e.fancybox.close),n.on("click",e.fancybox.cancel),l.on("click",(function(t){t.preventDefault(),e.fancybox.prev()})),s.on("click",(function(t){t.preventDefault(),e.fancybox.next()})))},e.fn.fancybox.defaults={padding:10,margin:40,modal:!1,cyclic:!1,allowfullscreen:!1,scrolling:"auto",width:560,height:340,autoScale:!0,autoDimensions:!0,autoResize:!0,keepRatio:!1,minViewportWidth:0,swipeThreshold:100,ajax:{},svg:{wmode:"opaque"},hideOnOverlayClick:!0,hideOnContentClick:!1,overlayShow:!0,overlayColor:"#000",overlayOpacity:.6,titleShow:!0,titlePosition:"float",titleFormat:null,titleFromAlt:!0,transitionIn:"fade",transitionOut:"fade",speedIn:400,speedOut:400,changeSpeed:200,changeFade:200,easingIn:"swing",easingOut:"swing",showCloseButton:!0,showNavArrows:!0,enableEscapeButton:!0,enableKeyboardNav:!0,enableSwipeNav:!0,txt:{error:{content:"The requested content cannot be loaded.",later:"Please try again later.",type:"No content type found.",image:"No image found.",unexpected:"Unexpected response."},loading:"Cancel",close:"Close",next:"Next",prev:"Previous"},onStart:function(){},onCancel:function(){},onComplete:function(){},onCleanup:function(){},onClosed:function(){},onError:function(){}},e(document).ready((function(){e.fancybox.init()}))}(jQuery);