(function() {
    // initialise constants
    var FEED_ACCOUNTS = 'https://www.google.com/analytics/feeds/accounts/default?max-results=50';
    
    // initialise variables
    var accounts = null,
        map,
        service, 
        scope;
    
    /* private functions */
    
    function checkLoginStatus() {
        var loggedIn = google.accounts.user.checkLogin(scope);

        $('#authButton')
            .unbind('click')
            .html(loggedIn ? 'Log Out' : 'Login')
            .click(function() {
                if (loggedIn) {
                    google.accounts.user.logout();
                    checkLoginStatus();
                }
                else {
                    google.accounts.user.login(scope);
                } // if..else
            });
            
        if (loggedIn && (! accounts)) {
            loadAccounts();
        } // if
    } // checkLoginStatus
    
    function googLoad() {
        service = new google.gdata.analytics.AnalyticsService('gaExportAPI_acctSample_v2.0');
        scope = 'https://www.google.com/analytics/feeds';

        checkLoginStatus();
    } // googLoad
    
    function handleFeedError(e) {
        alert('Encountered an error');
    } // handleFeedError
    
    function loadAccounts() {
        service.getAccountFeed(
            FEED_ACCOUNTS,
            function(result) {
                var entries = result.feed.getEntries(),
                    listEntries = '';
                
                for (var ii = entries.length; ii--; ) {
                    listEntries += '<option value="' + entries[ii].getTableId().getValue() + '">' + entries[ii].getTitle().getText() + '</option>';
                } // for
                
                $('#accounts select').html(listEntries);
                $('#accounts').show();
                $('#login-helper').hide();
            },
            handleFeedError);
    } // loadAccounts
    

    // Load the Google data JavaScript client library  
    google.load('gdata', '2.x', {packages: ['analytics']});

    // Set the callback function when the library is ready  
    google.setOnLoadCallback(googLoad); 

    $(document).ready(function() {
        // initialise the map
        map = T5.Map({
            container: 'mapContainer'
        });

        map.setLayer('tiles', new T5.ImageLayer('osm.cloudmade', {
                // demo api key, register for an API key
                // at http://dev.cloudmade.com/
                apikey: '7960daaf55f84bfdb166014d0b9f8d41',
                styleid: 999
        }));
        
        map.gotoPosition(new T5.Geo.Position(10, 30), 2);
    });
})();
