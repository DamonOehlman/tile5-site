SIDELAB = (function() {
    var WUFOO_IDS = {
        "contact[name]": "Field1",
        "contact[email]": "Field3",
        "contact[enquiry]": "Field5"
    };
    
    function getWufooId(fieldName) {
        return WUFOO_IDS[fieldName] ? WUFOO_IDS[fieldName] : 0;
    } // getWufooId
    
    function sendToWufoo(url, form) {
        var formData = {};
        
        // get the form data
        $(form).find(":input").each(function() {
            if (this.name) {
                formData[getWufooId(this.name)] = $(this).val();
            } // if
        });
        
        jQuery.ajax({
            url: url,
            type: "POST",
            data: formData,
            success: function(data) {
                $("#contactus").html("<strong>Thank you for your enquiry.</strong>");
            }
        });
    } // sendToWufoo
    
    function pageError(message) {
        
    } // pageError
    
    var module = {
        displayTwitterStream: function(args) {
            args = jQuery.extend({
                container: "#tweets"
            }, args);
         
            return new module.TwitterStream(args);
        },
        
        initContactForm: function(selector) {
            $(selector).validate({
                submitHandler: function(form) {
                    var formData = {};
                    $("#loader").show();
                    
                    // get the form data
                    $(form).find(":input").each(function() {
                        formData[this.name] = $(this).val();
                    });
                    
                    jQuery.ajax({
                        url: "/contact/send",
                        type: "POST",
                        data: formData,
                        success: function(data) {
                            if (data == "OK") {
                                $("#loader").hide();
                                $("#contactus").html("<strong>Thank you for your enquiry.</strong>");
                            }
                            else {
                                pageError("Error submitting the form");
                                $("#loader").hide();
                            }
                        },
                        error: function(data) {
                            pageError("Error submitting the form");
                            $("#loader").hide();
                        }
                    });
                },
                showErrors: function(errorMap, errorList) {
                    // initialise an empty errors map
                    var haveErrors = false;
                    
                    // clear any error classes
                    $(selector + " li").removeClass("error");
                    $(selector + " li .errorMessage").remove();

                    // iterate through the jQuery validation error map, and convert to 
                    // something we can use
                    for (var elementName in errorMap) {
                        // find the element
                        var jqElement = $(selector).find(":input[name='" + elementName + "']");

                        // add the error message to the field
                        jqElement.parent().addClass("error");
                        jqElement.parent().append("<div class='errorMessage'>" + errorMap[elementName] + "</div>");
                        
                        haveErrors = true;
                    } // for

                    /*
                    // now display the errors
                    // alert("we've got errors");
                    if (haveErrors) {
                        $("#contact-image").fadeOut("fast", function() {
                            $("#error-image").fadeIn();
                        });
                    }
                    else {
                        $("#error-image").fadeOut("fast", function() {
                            $("#contact-image").fadeIn();
                        });
                    } // if..else
                    */
                }
            });            
        },
        
        TwitterStream: function(params) {
            params = jQuery.extend({
                container: "",
                screenName: "sidelab",
                msgCount: 3
            }, params);
            
            // get the container
            var tweetsContainer = $(params.container).get(0);
            
            var self = {
                update: function() {
                    // get the data from twitter
                    jQuery.ajax({
                        method: "GET",
                        dataType: "jsonp",
                        url: "http://twitter.com/statuses/user_timeline.json?screen_name=" + params.screenName + "&page=0&count=" + params.msgCount,
                        success: function(data) {
                            $(tweetsContainer).html("");
                            
                            // create some list items in the container
                            for (var ii = 0; ii < data.length; ii++) {
                                if (data[ii].text) {
                                    // parse the urls
                                    var tweetText = data[ii].text.replace(/(https?\S+)/, "<a href='$1' rel='nofollow'>$1</a>");
                                    
                                    $(tweetsContainer).append("<li>" + tweetText + "</li>");
                                } // if
                            } // for
                        }
                    });
                } 
            };
            
            // if the tweets container exists, then update
            if (tweetsContainer) {
                self.update();
            } // if
            
            return self;
        }
    };
    
    $(document).ready(function() {
        module.displayTwitterStream();
    });
    
    return module;
})();