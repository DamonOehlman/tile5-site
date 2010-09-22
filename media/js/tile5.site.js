(function() {
    function initTopMenu() {
        var topMenu = $("#topmenu").get(0),
            totalWidth = 0;
            
        if (topMenu) {
            $(topMenu).find("li").each(function() {
                totalWidth += $(this).width();
            });

            $(topMenu)
                .width(totalWidth)
                .hide()
                .css('position', 'relative')
                .css('top', '0px')
                .fadeIn();
        } // if
    } // initPageMenu
    
    $(document).ready(function() {
        setTimeout(initTopMenu, 50);
    });
})();