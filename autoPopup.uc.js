// ==UserScript==
// @name           AutoPopup.uc.js
// @description    Auto popup menulist/menupopup
// @compatibility  Firefox 2.0+
// @author         GOLF-AT
// @modify         zephyrer
// @include        main
// @include        chrome://*
// @version        1.7.0.20130927
// ==/UserScript==
/*
 * 131003：增加支持没有 menupopup 子节点但设置了 popup 特性的 toolbarbutton[type="menu"]
 */

(function() {
    var PopElt = null;    var DropElt = null;
    var PopTimer = null;  var HideTimer = null;
    var AlwaysPop = false;
    var nPopDelay = 100;  var nHideDelay = 1500;

    function AutoPopup()
    {
        let anchor = null;
        PopTimer = null;
        if (DropElt) {
            if (DropElt.hasAttribute('popup')) {
                PopElt = DropElt.ownerDocument.
                         getElementById(DropElt.getAttribute('popup'));
                anchor = DropElt;
            }
            else if (DropElt.localName!='dropmarker') {
                var v = null;
                try {
                    v = DropElt.ownerDocument.getAnonymousNodes(DropElt);
                }catch(ex) {}
                if (v!=null && v.length!=0 && v[0].localName=='menupopup')
                    PopElt = v[0];
                else
                    PopElt = DropElt.childNodes[0];
                anchor = PopElt.parentNode;
            }
            else {
                PopElt = DropElt;
                anchor = PopElt.parentNode;
            }
            try {
                PopElt.showPopup(anchor,
                    -1, -1, 'popup', 'bottomleft',
                    'topleft'); 
            }catch(e) { PopElt = null; }
        }
    }

    function HidePopup()
    {
        try {
            if (PopElt.localName=='dropmarker')
                PopElt.parentNode.closePopup();
            else
                PopElt.hidePopup();
        }catch(e) {}
        HideTimer = null; DropElt = null;
        PopElt = null;
    }

    function MouseOver(e)
    {
        if (!AlwaysPop && !document.hasFocus())
            return;

        if (IsButton(e.target)) {
            let type = e.target.getAttribute('type');
            if (type == 'menu-button') {
                if (e.originalTarget!=e.target)
                    return;
            }
            else {
                if (type != 'menu') return;
            }
        }

        if (HideTimer) {
            window.clearTimeout(HideTimer);
            HideTimer = null;
        }
        
        try {
            if ('PopupAutoComplete'==e.target.id.substr(0,17))
                return;
            for(var elt=e.target; elt!=null; elt=
                elt.parentNode) {
                if (elt.localName=='popup' || elt.localName=='menupopup')
                    return;
            }
        }catch(ex) {}

        if (PopElt) {
            if (DropElt!=null && e.target==DropElt)
                return;
            try { 
                if (PopElt.localName=='dropmarker')
                    PopElt.parentNode.closePopup();
                else {
                    for(var elt=e.target; elt!=null; elt=elt.parentNode) {
                        if (elt == PopElt) return;
                    }
                    PopElt.hidePopup();
                }
            }catch(ex) {}
            PopElt = null;
        }
        
        DropElt = e.target;
        PopTimer = setTimeout(AutoPopup, nPopDelay);
    }

    function MouseOut(e)
    {
        if (PopTimer) {
            window.clearTimeout(PopTimer);
            PopTimer = null;
        }
        if (PopElt && HideTimer==null)
            HideTimer = window.setTimeout(HidePopup, nHideDelay);
    }

    function IsButton(elt) {
        try {
            return elt.localName=='toolbarbutton' || elt.localName=='button';
        }catch(e) { return false; }
    }

    function IsMenuButton(elt) {
        if (!IsButton(elt)) return false;
        for(var i=0; i<2; i++) {
            try {
                var nodes = (i==0x01) ? elt.childNodes : elt.ownerDocument.getAnonymousNodes(elt);
                if (nodes!=null && nodes.length && nodes[0].localName=='menupopup')
                    return true;
            }catch(e) {}
        }
        if (elt.getAttribute('type') == 'menu' && elt.hasAttribute('popup'))
          return true;
        return false;
    }

    function EnumElement(elt) {
        try {
            if (elt.localName == 'prefpane') {
                elt.addEventListener('paneload', function(e) {
                    setTimeout(function() { EnumElement(e.target); }, 100); 
                }, false);
            }
            else if(elt.id && elt.id=='sidebar' && !elt.hasAttribute('AutoPopup')) {
                elt.setAttribute('AutoPopup', true)
                elt.addEventListener('SidebarFocused', function(e) { EnumElement(elt); }, false);
            }
            else if(elt.id && elt.id == 'editBookmarkPanel')
                return;
        }catch(e) {}

        for(var i=0; i<2; i++) {
            var nodes = null;
            try {
                if (elt.localName == 'browser') {
                    i = 1;
                    nodes = elt.contentDocument.childNodes;
                }
                else
                    nodes = (i==0x01) ? elt.childNodes : elt.ownerDocument.getAnonymousNodes(elt);
            }catch(e) { nodes = null; }
            if (nodes == null) continue;

            for(var n=0; n<nodes.length; n++) {
                try {
                    var node = nodes[n];
                    if (node.hasAttribute('AutoPopup')) continue;
                    //if (node.id&&node.id=='stylish-toolbar-button') ucx.log('#stylish-toolbar-button process');
                    if ('PopupAutoComplete'==node.getAttribute('id').substr(0,17) || 
                        'menupopup'==node.localName || node.localName=='popup'){
                    }
                    else if (node.localName != 'dropmarker') {
                        if (node.localName=='menu' && 'menubar'==node.parentNode.localName){
                        }
                        else if(!IsMenuButton(node))
                            node = null;
                    }
                    else if(node.getAttribute('type')=='menu') {
                        node = node.parentNode;
                        if (!node.firstChild || node.firstChild.localName!='menupopup')
                            continue;
                    }
                    if (node == null) {
                        EnumElement(nodes[n]); continue;
                    }
                    //if (node.id&&node.id=='stylish-toolbar-button') ucx.log('#stylish-toolbar-button autopopup');
                    //if (node.id&&node.id=='stylish-toolbar-button') ucx.log('#stylish-toolbar-button showPopup is '+('showPopup' in node));
                    node.addEventListener("mouseout", MouseOut, false);
                    node.addEventListener("mouseover",MouseOver, false);
                    node.setAttribute('AutoPopup', true)
                }catch(e) {}
            }
        }
    }

    setTimeout(function() { EnumElement(document); }, 500);
})();
