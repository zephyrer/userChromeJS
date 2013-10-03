// ==UserScript==
// @name            autoopen Bookmark Details pane
// @id              autoopenBookmarkDetailsPane@zephyrer
// @namespace       zephyrer@msn.com
// @description     enable Bookmarks Details rows display permanently
// @author          zephyrer
// @require         000-ucx.uc.js
// @include         chrome://browser/content/places/places.xul
// @version         1.0
// ==/UserScript==

(function () {
    "use strict"
    //"editBMPanel_keywordRow", "editBMPanel_descriptionRow", "editBMPanel_loadInSidebarCheckbox"]
    
    ucx.hookFunction(PlacesOrganizer, "_detectAndSetDetailsPaneMinimalState", 
                     "if (aNode.itemId", 
                     "infoBox.removeAttribute('minimal');\n"+
                     "infoBox.removeAttribute('wasminimal');\n"+
                     "infoBoxExpanderWrapper.hidden = true;\n"+
                     "additionalInfoBroadcaster.removeAttribute('hidden');\n"+
                     "if (document.getElementById('editBMPanel_tagsSelectorRow') &&\n"+
                     "    !document.getElementById('editBMPanel_tagsRow').hasAttribute('collapsed') &&\n"+
                     "    document.getElementById('editBMPanel_tagsSelectorRow').getAttribute('collapsed') == 'true')\n"+
                     "  gEditItemOverlay.toggleTagsSelector();\n"+
                     "return;"+
                     "$&");
})();
