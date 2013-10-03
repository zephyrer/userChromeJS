// ==UserScript==
// @name         Restart Firefox
// @namespace    http://www.xuldev.org/
// @description  Adds Restart menu and shortcut key.
// @include      main
// @author       Gomita
// @modify       zephyrer
// @require      000-ucx.uc.js
// @version      1.0.20131003
// @homepage     http://www.xuldev.org/misc/ucjs.php
// ==/UserScript==
/*
 * 131003： 界面汉化，改用自己的 loadOverlay 载入以避免错误
 */
 
function ucjsRestartApp() {
    var appStartup = Cc["@mozilla.org/toolkit/app-startup;1"]
                     .getService(Ci.nsIAppStartup);
    appStartup.quit(appStartup.eRestart | appStartup.eAttemptQuit);
}
 
(function() {
    var overlay = '<overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" xmlns:html="http://www.w3.org/1999/xhtml">\
            <commandset id="mainCommandSet">\
                <command id="cmd_RestartApp" oncommand="ucjsRestartApp();" />\
            </commandset>\
            <keyset id="mainKeyset">\
                <key id="key_RestartApp" key="Z" modifiers="accel,alt" command="cmd_RestartApp" />\
            </keyset>\
            <menu id="appmenuPrimaryPane">\
                <menuitem id="appmenu_restartApp" label="\u91CD\u65B0\u542F\u52A8" insertbefore="appmenu-quit"\
                          key="key_RestartApp" command="cmd_RestartApp" />\
            </menu>\
            <menu id="menu_FilePopup">\
                <menuitem id="menu_restartApp" label="\u91CD\u65B0\u542F\u52A8" insertbefore="menu_FileQuitItem"\
                          accesskey="R" key="key_RestartApp" command="cmd_RestartApp" />\
            </menu>\
        </overlay>';
      ucx.loadOverlay(overlay, null);
/*
  let XULNS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
  let ele = document.createElementNS(XULNS, "key");
  ele.setAttribute("id", "key_RestartApp");
  ele.setAttribute("key", "Z");
  ele.setAttribute("modifiers", "accel,alt");
  ele.setAttribute("command", "cmd_RestartApp");

  let set = document.getElementById("mainKeyset");
  set.appendChild(ele);
  
  let ele = document.createElementNS(XULNS, "command");
  ele.setAttribute("id", "cmd_RestartApp");
  ele.setAttribute("oncommand", "ucjsRestartApp();");

  set = document.getElementById("mainCommandSet");
  set.appendChild(ele);
  
  ele = document.createElementNS(XULNS, "menuitem");
  ele.setAttribute("id", "appmenu_restartApp");
  ele.setAttribute("label", "\u91CD\u65B0\u542F\u52A8");
  ele.setAttribute("command", "cmd_RestartApp");
  ele.setAttribute("key", "key_RestartApp");

  set = document.getElementById("appmenuPrimaryPane");
  set.insertBefore(ele, document.getElementById("appmenu-quit"));
  
  ele.setAttribute("id", "menu_restartApp");
  set = document.getElementById("menu_FilePopup");
  set.insertBefore(ele, document.getElementById("menu_FileQuitItem"));
*/
})();