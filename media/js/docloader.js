DocReader = (function() {
    var apiIndex = null;
    
    function getIndexList() {
        globalIndex = apiIndex;
        var content = '';
        
        for (var ii = 0; ii < apiIndex.length; ii++) {
            content += '<li><a href="' + apiIndex[ii].url + '" id="apiindex_' + ii + '">' + apiIndex[ii].term + '</a></li>';
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
        $.ajax({
            url: '/media/js/api_index.json',
            dataType: 'json',
            success: function(data) {
                apiIndex = data;
                $('#index').html(getIndexList()); // .find('a').click(showDoco);
                
                $("#main").css('min-height', $(".callout").height() + 20);
                $(".callout").show().css('margin-left', -$('#index').width() - 42);
            }
        });
    } // displayIndex
    
    // $(document).ready(displayIndex);
})();