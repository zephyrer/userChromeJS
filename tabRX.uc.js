// ==UserScript==
// @name           tabRX.uc.js
// @namespace      https://github.com/zephyrer
// @description    Remove/Refresh tabs with the same domain/host as current
// @include        main
// @exclude        about:*
// @author         Zephyrer
// @compatibility  72
// @version        2022/02/01 17:54 1.2
// @version        2020/06/07 16:54 1.0
// @version        2020/06/07 15:58 initial
// ==/UserScript==

var tabRX = {
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

  test: function(aTab){
    let ps = Services.prompt;
    window.focus();
    //let domain = tabRX.getDomain(aTab.linkedBrowser.currentURI.spec);
    //let msg = "The domain of current tab is " + domain + ".";
    let msg = "Current language is " + this.locale;
    ps.alert(null, "TabRX", msg);
  },

  tabContextMenu: function(){
    //tab context menu
    var tabContext = this.tabContext;
    tabContext = tabContext.appendChild(
                        document.createXULElement("menu"));
    tabContext.id = "context_tabRX";
    tabContext.setAttribute("label", (this.locale == "zh-CN") ? "\u540C\u6E90\u6807\u7B7E\u9875" : "Tabs From Same Source");//同源标签页
    tabContext.setAttribute("accesskey", "Y");
    tabContext = tabContext.appendChild(
                        document.createXULElement("menupopup"));
    tabContext.id = "tabRX";

    var menuitem = tabContext.appendChild(
                        document.createXULElement("menuitem"));
                        /*
    menuitem.id = "tabRX-test";
    menuitem.setAttribute("type", "command");
    menuitem.setAttribute("accesskey", "T");
    menuitem.setAttribute("oncommand","tabRX.test(TabContextMenu.contextTab);");
    menuitem.setAttribute("label", "Test");

    menuitem = tabContext.appendChild(
                        document.createXULElement("menuitem"));
                        */
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

    menuitem = tabContext.appendChild(
                        document.createXULElement("menuitem"));
    menuitem.id = "tabRefreshSameDomain";
    menuitem.setAttribute("type", "command");
    menuitem.setAttribute("accesskey", "H");
    menuitem.setAttribute("oncommand","gBrowser.refreshTabsSameDomainAs(TabContextMenu.contextTab);");
    switch(this.locale) {
      case "zh-CN":
        menuitem.setAttribute("label", "\u5237\u65B0\u540C\u4E00\u57DF\u540D\u6807\u7B7E\u9875");//刷新同一域名标签页
        break;
      default:
        menuitem.setAttribute("label", "Refresh all tabs w/ the same domain");
        break;
    }

    menuitem = tabContext.appendChild(
                        document.createXULElement("menuitem"));
    menuitem.id = "tabRefreshSameHost";
    menuitem.setAttribute("type", "command");
    menuitem.setAttribute("accesskey", "H");
    menuitem.setAttribute("oncommand","gBrowser.refreshTabsSameHostAs(TabContextMenu.contextTab);");
    switch(this.locale) {
      case "zh-CN":
        menuitem.setAttribute("label", "\u5237\u65B0\u540C\u4E00\u4E3B\u673A\u540D\u6807\u7B7E\u9875");//刷新同一主机名标签页
        break;
      default:
        menuitem.setAttribute("label", "Refresh all tabs w/ the same host");
        break;
    }

    this.tabContext.addEventListener('popupshowing', this, false);
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
    let domain = tabRX.getDomain(aTab.linkedBrowser.currentURI.spec);
    let tabsToRemove = [];
    for (let tab of this.tabs) {
      if (tab.pinned) continue;
      if ("isLockTab" in gBrowser && this.isLockTab(tab)) continue;
      if (tabRX.getDomain(tab.linkedBrowser.currentURI.spec) == domain) {
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

  gBrowser.refreshTabsSameDomainAs = function(aTab){
    let domain = tabRX.getDomain(aTab.linkedBrowser.currentURI.spec);
    let tabsToRefresh = [];
    for (let tab of this.tabs) {
      if (tabRX.getDomain(tab.linkedBrowser.currentURI.spec) == domain) {
        tabsToRefresh.push(tab);
      }
    }
    this.reloadTabs(tabsToRefresh);
  };

  gBrowser.refreshTabsSameHostAs = function(aTab){
    let host = aTab.linkedBrowser.currentURI.host;
    let tabsToRefresh = [];
    for (let tab of this.tabs) {
      if (tab.linkedBrowser.currentURI.host == host) {
        tabsToRefresh.push(tab);
      }
    }
    this.reloadTabs(tabsToRefresh);
  };

  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    tabRX.init();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        tabRX.init();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
