// ==UserScript==
// @name           tabRemoveX.uc.js
// @namespace      https://github.com/zephyrer
// @description    Remove tabs with the same domain/host as current
// @include        main
// @exclude        about:*
// @author         Zephyrer
// @compatibility  72
// @version        2020/05/22 08:28 locale detection logic enhanced: support "intl.accept_languages" pref
// @version        2020/05/21 00:45 1.0
// @version        2020/05/20 19:28 initial
// ==/UserScript==

var tabRemoveX = {
  get tabContext() {
    return document.getElementById("tabContextMenu");
  },

  init: function(){
    console.log("init");
    this.tabContextMenu();
    window.addEventListener('unload', this, false);
  },

  get locale() {
    let locale = "";
    /*
    let prefs = ["general.useragent.locale",
                 "intl.locale.requested",
                 "intl.accept_languages",
                 "font.language.group"
                ];
    let i = 0;
    for (i=0; i<prefs.length; i++) {
      locale = Services.prefs.getCharPref(prefs[i], "");
      if (locale !== "") break;
    }
    if (/^chrome:\/\/.+\/locale\/.+\.properties/.test(locale))
      locale = Services.prefs.getComplexValue(prefs[i], Components.interfaces.nsIPrefLocalizedString).data;
    if (locale.includes(',')) {
      locale = locale.substring(0, locale.indexOf(','));
    }
    */
    //Get the currently active Browser Window
    let activeWindow = Services.wm.getMostRecentWindow("navigator:browser");
    //Get the window.navigator from current window/tab
    //activeWindow.document.defaultView is the <window> you want to use
    let defaultViewNavigator = activeWindow.document.defaultView.navigator;
    locale = defaultViewNavigator.language;

    return locale;
  },

  uninit: function(){
    window.removeEventListener('unload', this, false)
    this.tabContext.removeEventListener('popupshowing', this, false);

  },

  handleEvent: function(event) {
    switch(event.type) {
      case "unload":
        this.uninit(event);
        break;
      case "popupshowing":
        this.popupshowing(event);
        break;
    }
  },

  tabContextMenu: function(){
    //tab context menu
    var tabContext = this.tabContext;
    var menuitem = tabContext.appendChild(
                        document.createXULElement("menuitem"));
    menuitem.id = "tabRemoveSameDomain";
    menuitem.setAttribute("type", "command");
    menuitem.setAttribute("accesskey", "D");
    menuitem.setAttribute("oncommand","gBrowser.removeTabsSameDomainAs(TabContextMenu.contextTab);");
    switch(this.locale) {
      case "zh-CN":
        menuitem.setAttribute("label", "\u5173\u95ED\u540C\u4E00\u57DF\u540D\u6807\u7B7E\u9875");//关闭同一域名标签页
        break;
      default:
        menuitem.setAttribute("label", "Close all tabs w/ the same domain");
        break;
    }

    menuitem = tabContext.appendChild(
                        document.createXULElement("menuitem"));
    menuitem.id = "tabRemoveSameHost";
    menuitem.setAttribute("type", "command");
    menuitem.setAttribute("accesskey", "H");
    menuitem.setAttribute("oncommand","gBrowser.removeTabsSameHostAs(TabContextMenu.contextTab);");
    switch(this.locale) {
      case "zh-CN":
        menuitem.setAttribute("label", "\u5173\u95ED\u540C\u4E00\u4E3B\u673A\u540D\u6807\u7B7E\u9875");//关闭同一主机名标签页
        break;
      default:
        menuitem.setAttribute("label", "Close all tabs w/ the same host");
        break;
    }

    tabContext.addEventListener('popupshowing', this, false);
  },

  popupshowing: function(event) {
    ;
  },

  getHostName: function(url) {
    let match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
      return match[2];
    }
    else {
      return null;
    }
  },

  getDomain: function(url) {
    let hostName = this.getHostName(url);
    let domain = hostName;
    if (hostName != null) {
      let parts = hostName.split('.').reverse();
      if (parts != null && parts.length > 1) {
        domain = parts[1] + '.' + parts[0];
        if (/co|com|edu|gov|mil|net|org/i.test(parts[1]) && parts.length > 2) {
          domain = parts[2] + '.' + domain;
        }
      }
    }
    return domain;
  }
}

  gBrowser.removeTabsSameDomainAs = function(aTab){
    let domain = tabRemoveX.getDomain(aTab.linkedBrowser.currentURI.spec);
    let tabsToRemove = [];
    for (let tab of this.tabs) {
      if (tab.pinned) continue;
      if ("isLockTab" in gBrowser && this.isLockTab(tab)) continue;
      if (tabRemoveX.getDomain(tab.linkedBrowser.currentURI.spec) == domain) {
        tabsToRemove.push(tab);
      }
    }
    if (
      !this.warnAboutClosingTabs(
        tabsToRemove.length,
        this.closingTabsEnum.MULTI_SELECTED
      )
    ) {
      return;
    }
    this.removeTabs(tabsToRemove);
  };

  gBrowser.removeTabsSameHostAs = function(aTab){
    let host = aTab.linkedBrowser.currentURI.host;
    let tabsToRemove = [];
    for (let tab of this.tabs) {
      if (tab.pinned) continue;
      if ("isLockTab" in gBrowser && this.isLockTab(tab)) continue;
      if (tab.linkedBrowser.currentURI.host == host) {
        tabsToRemove.push(tab);
      }
    }
    if (
      !this.warnAboutClosingTabs(
        tabsToRemove.length,
        this.closingTabsEnum.MULTI_SELECTED
      )
    ) {
      return;
    }
    this.removeTabs(tabsToRemove);
  };

  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    tabRemoveX.init();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        tabRemoveX.init();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
