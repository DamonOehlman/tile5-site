DocReader = (function() {
    var apiIndex = null;
    
    function getIndexList() {
        globalIndex = apiIndex;
        var content = '';
        
        for (var ii = 0; ii < apiIndex.length; ii++) {
            content += '<a href="' + apiIndex[ii].url + '" id="apiindex_' + ii + '">' + apiIndex[ii].term + '</a>\n';
        } // for 
        
        return content;
    } // getIndexList
    
    function showDoco() {
        var index = this.id.replace(/^apiindex\_(\d+)$/i, '$1');
        
        $('#index').hide();
        $('#content').load(apiIndex[index].url).show();
        
        return false;
    } // showDoco
    
    function displayIndex() {
        var indexVisible = $('#index :visible').get(0);
        
        if (! indexVisible) {
            if (! apiIndex) {
                $.ajax({
                    url: '/media/js/tile5/dist/docs/_index.json',
                    dataType: 'json',
                    success: function(data) {
                        apiIndex = data;
                        $('#index').html(getIndexList()); // .find('a').click(showDoco);

                        displayIndex();
                    }
                });

                return false;
            } // if

            $("#index").slideDown('fast');
            $("a[href=#index]").html('Hide Index');
        }
        else {
            $('#index').slideUp();
            $("a[href=#index]").html('Show Index');
        } // if..else
        
        return false;
    } // displayIndex
    
    $(document).ready(function() {
        $("a[href=#index]").click(displayIndex);
    });
})();