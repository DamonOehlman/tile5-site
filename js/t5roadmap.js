ROADMAP = (function() {
    var GITHUB_URL = 'https://github.com/',
        ISSUES_URL = 'http://github.com/api/v2/json/issues/list/';
    
    /* internals */
    
    function createIssuesList(issues, projectUrl) {
        var items = '';
        
        for (var ii = 0; ii < issues.length; ii++) {
            items += '<li class="' + issues[ii].labels.join(' ') + '">' + 
                '<a href="' + projectUrl + 'issues/' + issues[ii].number + '">' + issues[ii].title + '</a>' + 
                '</li>';
        } // for
        
        return items;
    } // createIssuesList
    
    function loadIssues(user, project, list) {
        var label = list.data('label'),
            projectUrl = GITHUB_URL + user + '/' + project + '/';
        
        if (label) {
            list.html('Retrieving items...');
            
            $.ajax({
                url: ISSUES_URL + user + '/' + project + '/label/' + label,
                dataType: 'jsonp',
                success: function(data) {
                    list.html(createIssuesList(data.issues, projectUrl));
                }
            });
        } // if
    } // 
    
    /* exports */
    
    function display(user, project) {
        $('ul.roadmap-items').each(function() {
            loadIssues(user, project, $(this));
        });
    } // display
    
    return {
        display: display
    };
})();