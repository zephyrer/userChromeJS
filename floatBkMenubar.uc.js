// ==UserScript==
// @name           toolboxSmartFloater.uc.js
// @namespace      http://erz.t3j4.com/
// @include        main
// @compatibility  Firefox 4+
// @version        0.1.7.220
// @note           
// ==/UserScript==


/*
 * Hierarchy
 *
 * #navigator-toolbox [toolbox]
 *   |
 *   +--- #toolbar-menubar [toolbar]
 *   |     |
 *   |     \---#menubar-items [toolbaritem]
 *   |        |
 *   |        \--- #main-menubar [menubar]
 *   |            |
 *   |            +--- #file-menu [menu]
 *   |            +--- #edit-menu [menu]
 *   |            +--- #view-menu [menu]
 *   |            +--- #history-menu [menu]
 *   |            +--- #bookmarksMenu [menu]
 *   |            +--- #tools-menu [menu]
 *   |            \--- #helpMenu [menu]
 *   |
 *   +--- #nav-bar [toolbar]
 *   |
 *   +--- #customToolbars [toolbarset]
 *   |
 *   +--- #PersonalToolbar [toolbar]
 *   |     |
 *   |     \--- #personal-bookmarks [toolbaritem]
 *   |        |
 *   |        \--- #PlacesToolbar [hbox]
 *   |
 *   +--- #TabsToolbar [toolbar]
 *   |     |
 *   |     \--- #tabbrowser-tabs [tabs]
 *   |
 *   ...... (customized toolbars)
 */

(function() {

  var tbsf = { //ToolBarSmartFloater
    FLOAT_BARS: ["toolbar-menubar", "PersonalToolbar"],   // ids for bars we cared
    hidingStatuses: {},
    trigger: null,
    running: false,
    floating: true,
    modifier: false,

    // trigger ID: panel-sep-ucjs-trigger
    installTrigger: function() {
      this.trigger = document.createElement("separator");
      this.trigger.setAttribute("id", "panel-sep-ucjs-trigger");
      this.trigger.setAttribute("orient", "horizontal");
      ucx.loadStyle('@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
\
#panel-sep-ucjs-trigger {\
  position: fixed;\
  top: 0px !important;\
  height: 2px;\
  width: 100% !important;\
  z-index: 100;\
  opacity: 0 !important;\
}\
\
#toolbar-menubar[autohide="true"] ~ #panel-sep-ucjs-trigger {\
  top: 8px !important;\
}\
\
#toolbar-menubar[floating] {\
  position: fixed;\
  z-index: 10;\
  overflow: visible !important;\
  border-bottom-right-radius: 5px !important;\
}\
\
#toolbar-menubar[floating][autohide="false"] .titlebar-placeholder {\
  display: none !important;\
}\
\
#PersonalToolbar[floating] {\
  position: fixed;\
  overflow: visible !important;\
  z-index: 10;\
  border-bottom-color: rgba(0, 0, 0, 0.32) !important;\
  border-bottom-left-radius: 2.5px !important;\
  border-bottom-right-radius: 2.5px !important;\
  border-bottom-style: solid !important;\
  border-bottom-width: 1px !important;\
}\
\
#toolbar-menubar[floating],\
#PersonalToolbar[floating] {\
  color: rgb(0, 0, 160) !important;\
  background-color: rgb(207, 219, 236) !important;\
}');
      let tb = $('toolbar-menubar');
      tb.parentNode.insertBefore(this.trigger, tb.nextSibling);
    },
    handleEvent: function(event) {
      switch (event.type) {
        case "mouseover":
          if (this.running) {
            if (event.target === this.trigger) return;
            gBrowser.mPanelContainer.removeEventListener('mouseover', this, true);
            this.running = false;
            if (!this.modifier != !this.floating) this.smartFloat(); else this.simpleToggle();
            this.modifier = false;
          } else {
            if (event.ctrlKey) this.modifier = true;
            gBrowser.mPanelContainer.addEventListener('mouseover', this, true);
            this.running = true;
            if (!this.modifier != !this.floating) this.smartFloat(); else this.simpleToggle();
          }
          break;
      }
    },
    smartFloat: function() {
      var that = this;
      if (this.running) {
        this.FLOAT_BARS.forEach(function(id){
          let toolbar = $(id);
          let hidingAttribute = toolbar.getAttribute("type") == "menubar" ? "autohide" : "collapsed";
          that.hidingStatuses[id] = toolbar.getAttribute(hidingAttribute);
          if (that.hidingStatuses[id] == 'true') {
            toolbar.setAttribute('floating', 'true');
            toolbar.setAttribute(hidingAttribute, 'false');
            that.MenuBarHelper();
            that.PlacesToolbarHelper();
          }
        });        
      } else {
        this.FLOAT_BARS.forEach(function(id){
          let toolbar = $(id);
          let hidingAttribute = toolbar.getAttribute("type") == "menubar" ? "autohide" : "collapsed";
          if (that.hidingStatuses[id] == 'true') {
            toolbar.setAttribute(hidingAttribute, that.hidingStatuses[id]);
            that.MenuBarHelper();
            that.PlacesToolbarHelper();
            toolbar.removeAttribute('floating');
          }
          delete that.hidingStatuses[id];
        });        
      }
    },
    MenuBarHelper: function() {
      let menubar = $('toolbar-menubar');
      if (!menubar.hasAttribute('floating')) return;
      if (this.running) {
        /* locate position */
        let mainWin = $('main-window');
        let isMaxmized = mainWin.getAttribute('sizemode') == 'maximized' || mainWin.getAttribute('fullscreen') == 'maximized';
        menubar.style.top = (isMaxmized ? 8 : 0) + 'px';
        /* width adjusting */
        let l = ucx.width($('titlebar'));
        // To cut the length of menubar to display system and additional buttons
        l = l - ucx.width($('titlebar-buttonbox-container')) - 54; // 115: Actual Window Manager 5 buttons; 27: 1 button; 
        menubar.style.width = l + 'px';
        /* enable spring */
        let springs = menubar.getElementsByTagName('toolbarspring');
        if (springs) {
          let w = 0;
          for (let i=0; i<menubar.childNodes.length; i++) {
            if (menubar.childNodes[i].tagName == 'toolbarspring' ||
                menubar.childNodes[i].className == 'titlebar-placeholder')
                continue;
            w += ucx.width(menubar.childNodes[i]);
          }
          // To move icons' locations only
          // if (isMaxmized) w += ucx.width($('titlebar-buttonbox-container'));// 90: Actual Window Manager buttons
          w = (l - w - 16) / springs.length;
//          let w = l - ucx.width($('menubar-items')) - (menubar.childNodes.length - springs.length - 3) * 42;// last number is Æ½¾ùÊý
//          w /= springs.length;
          for (let i=0; i<springs.length; i++)
            springs[i].style.width = w + 'px';
        }
      } else {
        menubar.style.top = '0px';
      }
    },
    PlacesToolbarHelper: function() {
      let pt = $('PersonalToolbar');
      if (!pt.hasAttribute('floating')) return;
      PlacesToolbarHelper.init();
      if (this.running) {
        let menubar = $('toolbar-menubar');
        if (menubar.hasAttribute('floating')) {
          pt.style.top = parseInt(menubar.style.top) + ucx.height(menubar) + 'px';
          pt.style.width = ucx.width($('titlebar')) + 'px';
        }
      } else {
        pt.style.top = '0px';
      }
    },
    simpleToggle: function() {
      var that = this;
      if (this.running) {// display all
        this.FLOAT_BARS.forEach(function(id){
          let toolbar = $(id);
          let hidingAttribute = toolbar.getAttribute("type") == "menubar" ? "autohide" : "collapsed";
          that.hidingStatuses[id] = toolbar.getAttribute(hidingAttribute);
          if (that.hidingStatuses[id] == 'true') {
            setToolbarVisibility(toolbar, true);
          }
        });
      } else {// restore original status
        this.FLOAT_BARS.forEach(function(id){
          let toolbar = $(id);
             if (that.hidingStatuses[id] == 'true') {
            setToolbarVisibility(toolbar, false);
          }
          delete that.hidingStatuses[id];
        });
      }
    },
    init: function() {
      this.installTrigger();
      this.trigger.addEventListener("mouseover", this, true);
    },
  };

  tbsf.init();

})();

