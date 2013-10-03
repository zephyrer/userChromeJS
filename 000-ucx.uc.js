// ==UserScript==
// @name           userChromeX utility library
// @namespace      zephyrer@msn.com
// @description    provides helpers
// @compatibility  Firefox 4.0+
// @include        *
// @version        1.0
//
// 要求稍微修改下 Sub-Script/Overlay Loader：将 !/^chrome:/.test 搜索替换为 !/^(about|chrome):/i.test （共两处）
// ==/UserScript==
var ucx = {
  loadStyle: function(href){
    if (!/^[\w\-]+:\/\//i.test(href)) href = 'data:text/css;utf-8,' + encodeURIComponent(href);
    var pi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="' + href + '"'
    );
    return document.insertBefore(pi, document.documentElement);
  },

  loadOverlay: function(str, o){
    var overlay = "data:application/vnd.mozilla.xul+xml;utf-8," + encodeURIComponent(str);
    return window.userChrome_js?window.userChrome_js.loadOverlay(overlay, o, document):document.loadOverlay(overlay, o);
  },

  log: function() {
    Application.console.log(Array.slice(arguments).join('\n'));
  },

  rect: function(ele) {
    return ele.getBoundingClientRect();
  },

  rectById: function(id) {
    return $(id).getBoundingClientRect();
  },

  finalStyle: function(ele,prop) {
    return document.defaultView.getComputedStyle(ele, "").getPropertyValue(prop);
  },

  finalStyleById: function(id,prop) {
    return document.defaultView.getComputedStyle($(id), "").getPropertyValue(prop);
  },

  width: function(ele) {
    return parseInt(this.finalStyle(ele,'width'));
  },

  height: function(ele) {
    return parseInt(this.finalStyle(ele,'height'));
  },

  widthById: function(id) {
    return parseInt(this.finalStyleById(id,'width'));
  },

  heightById: function(id) {
    return parseInt(this.finalStyleById(id,'height'));
  },

  reportEventProps: function(e) {
    var s = '', wantedprops= ',type,target,currentTarget,bubbles,cancelable,windowObject,detail,screenX,screenY,clientX,clientY,ctrlKey,altKey,shiftKey,metaKey,button,relatedTarget,';
    for(p in e){
      if(wantedprops.indexOf(','+p+',')+1){
        s += '\n' +p + ': ';
        if(typeof(e[p])=='object'){
          if(e[p].tagName){s+=e[p].tagName;
            if(e[p].id)s+='[id="'+e[p].id+'"]';
          }else{
            s+='object';
          }
        }else{
          s+=e[p];
        }
      }
    }
    this.alert('Event fired:\n' + s + '\nThere may be more, but I have not included all of it.');
  },

  alert: function(msg, title) {
    let theWindow = (gBrowser && gBrowser.selectedTab) ?
            gBrowser.getBrowserForTab(gBrowser.selectedTab).contentWindow.getInterface(Components.interfaces.nsIDOMWindow) : null;

    if (!theWindow) {alert(msg, title);return;}

    let prompt = Components.classes["@mozilla.org/prompter;1"]
            .getService(Components.interfaces.nsIPromptFactory)
            .getPrompt(theWindow, Components.interfaces.nsIPrompt);

    let bag = prompt.QueryInterface(Components.interfaces.nsIWritablePropertyBag2);
    bag.setPropertyAsBool("allowTabModal", true);

    prompt.alert(title, msg);
  },
  
	hookFunction: function(obj, name, matchCode, replaceCode) {
	  if('undefined' == name)
	    throw TypeError('ucx.hookFunction: Name of function-to-hook is not string!\n');
		try {
			var _proto_ = obj[name].prototype;
			var orgCode = obj[name].toString();
			var regex = (typeof matchCode == "string") ? new RegExp(matchCode.replace(/\W/g, "\\$&").replace(/\\\*/g, ".*?"), "i") : matchCode;
			var newCode = obj[name].toString().replace(regex, replaceCode);
			if (orgCode == newCode) {
				throw "ucx.hookFunction: Error occurs when hooking functon "+obj+"."+name+":\n@match-pattern: "+matchCode+"\n@function-body: "+newCode;
			} else {
				eval("obj[name]="+newCode);
				obj[name].prototype = _proto_;
			}
		} catch(ex) { Components.utils.reportError(ex); }
	}
}

function $(id) document.getElementById(id)



