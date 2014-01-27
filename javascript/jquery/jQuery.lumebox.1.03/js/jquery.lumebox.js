/* Lumebox $ plugin
 * Copyright Anders Zakrisson/Sogeti 2009-2010
 * http://anders.zakrisson.se, http://www.sogeti.se
 * This software is released under the GPL License.
 */

(function($) {
    
    function lumeboxItem(params){
        this.title = null;
        this.link = null;
        this.description = null;
        this.updated = null;
        this.id = null;
        this.media = null;
    }

    /*
    * Media RSS and enclosures are not supported yet
    function lumeboxMediaItem(params){
        this.title = null;
        this.description = null;
        this.url = null;
        this.fileSize = null;
        this.type = null;
        this.medium = null;
        this.duration = null;
        this.height = null;
        this.width = null;
        this.isDefault = null;
        this.thumbnailUrl = null;
        this.thumbnailHeight = null;
        this.thumbnailWidth = null;
    }
    */

    function lumeboxFeed(){
        this.title = null;
        this.link = null;
        this.description = null;
        this.version = null;
        this.items = new Array();
    }

    $.lumebox = {
        settings: {
            showAsList: false,
            rss: new Array(),
            proxy: "",
            duration: "fast",
            popupMaxWidth: 680,
            opacity: "0.7",
            loop: true,
            scrollToTop: false,
            autoNext: false,
            infoText: "Use left and right arrow keys to jump to the other items, close with Esc or by clicking here.",
            parentElementId: false,
            useParentOffset: true,
            useGestures: true
        },

        data: {
            lumeboxItems: new lumeboxFeed(),
            lumeboxFeeds: new Object(),
            popupStatus: 0,
            group: null,
            timeoutId: null,
            index: 1
        },

        init: function(options){
            // Check for options and merge
            (options) ? $.lumebox.settings = $.extend({}, $.lumebox.settings, options) : options = {};

            var parentElement;
            if (this.settings.parentElementId) {
                parentElement = $("#" + this.settings.parentElementId);
            }
            else {
                parentElement = $("body").eq(0);
            }
            parentElement.append('<div id="lumebox-popup"><div id="lumebox-content"></div><div id="lumebox-footer"></div></div><div id="lumebox-bg"></div>');

            /* User interactions and events */
            // Close by clicking the footer
            $("#lumebox-footer").click(function(){
                $.lumebox.close();
            });

            // Close by clicking outside the content
            $("#lumebox-bg").click(function(){
                $.lumebox.close();
            });

            // Navigate using gestures
            if (this.settings.useGestures) {
                $("#lumebox-popup").quickGestures({
                    left: function () {$.lumebox.previous();},
                    right: function () {$.lumebox.next();}
                });
            }

            // keypress events
            $(document).keydown(function(e){
                if ($.lumebox.data.popupStatus == 1) {
                    switch (e.keyCode) {
                        case 27:
                            $.lumebox.close();
                            break; // Close by pressing Esc
                        case 39:
                            $.lumebox.next();
                            break; // Next by pressing left-arrow
                        case 78:
                            $.lumebox.next();
                            break; // Next by pressing n
                        case 37:
                            $.lumebox.previous();
                            break; // Previous by right-arrow
                        case 80:
                            $.lumebox.previous();
                            break; // Previous by right-arrow
                    }
                    switch (e.charCode) {
                        case 110:
                            $.lumebox.next();
                            break; // Next by pressing n
                        case 112:
                            $.lumebox.previous();
                            break; // Previous by pressing p
                    }
                }
            });

            // Center and resize if the window is resized
            $(window).bind('resize', function(){
                $.lumebox.resize();
            });

            // find all links with rel="lightbox[groupName]"
            var lFeed;
            $("a[rel^=lightbox]").each(function(){
                // Get Group-name
                var group = this.rel.match(/\[([a-zA-Z0-9\-]*)\]/i);
                group = (group) ? group[1] : null;

                // Create new group if it doesn't exist
                if (group && $.lumebox.data.lumeboxFeeds[group]) {
                    lFeed = $.lumebox.data.lumeboxFeeds[group];
                }
                else
                if (group) {
                    lFeed = new lumeboxFeed();
                    lFeed.title = group;
                    $.lumebox.data.lumeboxFeeds[group] = lFeed;
                }

                // Change the links to open the lightbox instead of hyperlinking

                if (this.href.search(/(\.jpg|\.jpeg|\.gif|\.png)$/i) != -1) {
                    var arrayIndex, lItem = new lumeboxItem();
                    // Createn new lumeboxItem in the form of an image and add to the list
                    lItem.description = '<p><a href="' + this.href + '"><img src="' + this.href + '" class="lumebox-img" /></a>' + '</p><p>' + this.title + '</p>';
                    lItem.link = this.href;
                    lItem.id = this.href;

                    // Push to the right group
                    arrayIndex = (group ? $.lumebox.data.lumeboxFeeds[group].items.push(lItem) - 1 : $.lumebox.data.lumeboxItems.items.push(lItem) - 1);

                    // Intercept clicks on the link
                    $(this).click(function() {
                        $.lumebox.open({
                            index: arrayIndex,
                            group: group
                        });
                        return false;
                    });
                }
                else
                if (this.rel.search(/lightbox\[(rss[a-zA-Z0-9\-]*)\]/i) != -1) {
                    $.lumebox.parseFeed({
                        url: $.lumebox.settings.proxy + this.href,
                        success: function(feed){
                            $.each(feed.items, function(j, post){
                                // Create item
                                lItem = $.extend({}, lItem, post);

                                // Push to the right group
                                (group) ? $.lumebox.data.lumeboxFeeds[group].items.push(lItem) - 1 : $.lumebox.data.lumeboxItems.items.push(lItem) - 1;
                            });
							
							// Intercept clicks on the link
							$(this).click(function() {
								$.lumebox.open({
									index: null,
									group: group
								});
								return false;
							});
                        }
                    });
                }
            });

            // Add RSS-posts and media from constructor
            $.each($.lumebox.settings.rss, function(i, item){
                $.lumebox.parseFeed({
                    url: $.lumebox.settings.proxy + item,
                    success: function(feed){
                        $.each(feed.items, function(j, post){
                            var lItem = $.extend({}, lItem, post);
                            $.lumebox.data.lumeboxItems.items.push(lItem);
                        });
                    }
                });
            });

            return this;
        },

        // Resize and center the popup
        resize: function(callback){
            if ($.lumebox.data.popupStatus == 1) {
                var windowWidth = $(window).width();
                var windowHeight = $(window).height();

                /* If the content is a lightboxed image in single item display we
                 * pick the image width as the width of the popup, otherwise we use
                 * the popupMaxWidth.
                 */
                var popupMaxWidth = ($.lumebox.settings.popupMaxWidth < windowWidth) ? $.lumebox.settings.popupMaxWidth : windowWidth;
                var contentWidth = ($("#lumebox-content").find("img.lumebox-img").attr("src") && !$.lumebox.settings.showAsList) ? $("#lumebox-content").find("img.lumebox-img").outerWidth(true) : popupMaxWidth;

                // limit the popupWidth if the content if wider than the popupMaxWidth
                var popupWidth = (contentWidth > popupMaxWidth) ? $.lumebox.settings.popupMaxWidth : contentWidth + $("#lumebox-content").css("padding-left").split("px")[0] * 2;

                // Set the background size
                $("#lumebox-bg").css({
                    "height": windowHeight
                });

                // Hide the contents, animate the width and x offset, then the height and y offset
                $("#lumebox-popup").animate({
                    width: popupWidth,
                    left: windowWidth / 2 - popupWidth / 2 - (($.lumebox.settings.useParentOffset) ? $("body").offset().left : 0)
                }, $.lumebox.settings.duration, function() {
                    var popupHeight = $("#lumebox-content").outerHeight(true) + $("#lumebox-footer").outerHeight(true);
                    // Animate and resize vertically
                    $(this).animate({
                        height: popupHeight,
                        top:  $(window).scrollTop() + ((popupHeight > windowHeight) ? 0 : windowHeight / 2 - popupHeight / 2)
                    },$.lumebox.settings.duration, function() {
                        // Scroll to top
                        if ($.lumebox.settings.scrollToTop)
                            $(this).scrollTop(0);
                        if ($.isFunction(callback))
                            callback();
                    });
                });
            }
        },

        // Open and show the popup
        open: function(options){
            if (!options)
                options = new Object();

            $.lumebox.data.group = (options.group) ? options.group : null;
            var group = (options.group) ? $.lumebox.data.lumeboxFeeds[options.group] : $.lumebox.data.lumeboxItems;
            $.lumebox.data.index = (options.index) ? options.index : 0;

            // Create HTML
            html = "";

            // ShowAsList =>  Multiple items in a long list
            if ($.lumebox.settings.showAsList) {
                $.lumebox.data.index = 0;
                $.each(group.items, function(j, item){
                    html += $.lumebox.createPostHtml(item);
                });
            }
            // Single items
            else {
                var item = group.items[$.lumebox.data.index];
                html = $.lumebox.createPostHtml(item);
            }

            // Load HTML into the DOM
            $("#lumebox-content").html(html);
            if ($.lumebox.settings.infoText) {
                var indexInfo = ($.lumebox.settings.showAsList ? "" : ($.lumebox.data.index + 1) + "/" + group.items.length + " ");
                $("#lumebox-footer").html(indexInfo + $.lumebox.settings.infoText);
            }


            // loads popup only if it is disabled
            if ($.lumebox.data.popupStatus == 0) {
                $("#lumebox-bg").css({
                    "opacity": $.lumebox.settings.opacity
                });
                // Fade in the background and show the popup
                $("#lumebox-bg").fadeIn($.lumebox.settings.duration, function() {
                    // Hide the content
                    $("#lumebox-popup").children().css("opacity", 0);
                    // Show the popup
                    $("#lumebox-popup").show();

                    // resize and center
                    $.lumebox.resize(function () {
                        //show the content again
                        $("#lumebox-popup").children().animate({
                            opacity: 1
                        }, $.lumebox.settings.duration);
                    });

                    // Load next post automatically if autoNext is a duration
                    if ($.lumebox.settings.autoNext && !isNaN($.lumebox.settings.autoNext) && !$.lumebox.settings.showAsList) {
                        //wait for duration and then load next
                        $.lumebox.data.timeoutId = setInterval ( "$.lumebox.next()", $.lumebox.settings.autoNext );
                    }
                });
                $.lumebox.data.popupStatus = 1;
            }
        },

        // Close the popup
        close: function(){
            // Close popup only if it is open
            if ($.lumebox.data.popupStatus == 1) {
                $("#lumebox-bg").fadeOut($.lumebox.settings.duration);
                $("#lumebox-popup").fadeOut($.lumebox.settings.duration);
                $.lumebox.data.popupStatus = 0;
            }
            // Cancel any intervals
            clearInterval($.lumebox.data.timeoutId);
        },

        next: function(){
            // Get the item
            var group = ($.lumebox.data.group ? $.lumebox.data.lumeboxFeeds[$.lumebox.data.group] : $.lumebox.data.lumeboxItems);
            $.lumebox.data.index = (($.lumebox.data.index < group.items.length - 1) ? $.lumebox.data.index + 1 : 0);
            var item = group.items[$.lumebox.data.index];

            // Switch to the new item
            $.lumebox._switchPost(item, group);
        },

        previous: function(){
            var group = ($.lumebox.data.group ? $.lumebox.data.lumeboxFeeds[$.lumebox.data.group] : $.lumebox.data.lumeboxItems);
            $.lumebox.data.index = (($.lumebox.data.index > 0) ? $.lumebox.data.index - 1 : group.items.length - 1);
            var item = group.items[$.lumebox.data.index];

            $.lumebox._switchPost(item, group);
        },

        _switchPost: function(item, group) {
            if ($.lumebox.data.popupStatus == 1) {
                if ($("#lumebox-content > .post").length == 1) {
                    // Fade out the old content
                    $("#lumebox-content > .post").fadeOut($.lumebox.settings.duration, function() {
                        // Load the HTML into the DOM and hide the content
                        $("#lumebox-content").html($.lumebox.createPostHtml(item)).css("opacity", 0);

                        // Info text and index information
                        if ($.lumebox.settings.infoText) {
                            var indexInfo = ($.lumebox.settings.showAsList ? "" : ($.lumebox.data.index + 1) + "/" + group.items.length + " ");
                            $("#lumebox-footer").html(indexInfo + $.lumebox.settings.infoText);
                        }

                        // Fade in the new content and resize
                        $.lumebox.resize(function () {
                            $("#lumebox-popup").children().animate({
                                opacity: 1
                            }, $.lumebox.settings.duration);
                        });
                    });
                }
            }
        },

        parseFeed: function(options){
            $.ajax({
                type: "GET",
                url: options.url,
                dataType: "xml",
                success: function(xml){
                    var feed = new lumeboxFeed();
                    // Identify the type of feed

                    // RSS 0.91, 0,92, 1.0, 2.0
                    if ($(xml).find("rss").length) {
                        feed.title = $(xml).find("rss > channel > title").text();
                        feed.link = $(xml).find("rss > channel > link").text();
                        feed.description = $(xml).find("rss > channel > description").text();
                        feed.lastBuildDate = $(xml).find("rss > channel > lastBuildDate").text();
                        feed.version = $(xml).find("rss").attr("version");

                        // Is it Media RSS?
                        var isMediaRss = ($(xml).find("rss").attr("version") == "2.0" && $(xml).find("rss").attr("xmlns:media") == "http://search.yahoo.com/mrss/" ? true : false);

                        $(xml).find("rss > channel > item").each(function(){
                            var lItem = new lumeboxItem();
                            lItem.title = $(this).find("title").text();
                            lItem.link = $(this).find("link").text();
                            lItem.updated = $(this).find("updated").text();
                            lItem.id = $(this).find("guid").text();

                            // Choose content if it's available, otherwise description
                            lItem.description = ($(this).find("content\\:encoded").eq(0).text()) ? $(this).find("content\\:encoded").eq(0).text() : $(this).find("description").text();

                            // RSS Enclosures or Enclosures
                            /*
                        if ($(this).find("enclosure").length) {
                            lMediaItem = new lumeboxMediaItem();
                            lMediaItem.url = $(this).find("enclosure").eq(0).attr("url");
                            lMediaItem.fileSize = $(this).find("enclosure").eq(0).attr("length");
                            lMediaItem.type = $(this).find("enclosure").eq(0).attr("type");
                            lItem.media = lMediaItem;
                        }
                        */
                            /* else if (isMediaRss && ($(this).find("media\\:group").length || $(this).find("media\\:content").length)) {
                         lMediaItem = new lumeboxMediaItem();
                         if ($(this).find("media\\:group").length) {
                         var content = $(this).filter("media\\:group").find("media\\:content").attr();
                         } else if ($(this).find("media\\:content").length) {
                         }
                         }*/
                            feed.items.push(lItem);
                        });


                    }
                    // Atom
                    else if ($(xml).find("feed").attr("xmlns") == "http://www.w3.org/2005/Atom") {
                        feed.title = $(xml).find("feed > title").text();
                        feed.link = $(xml).find("feed > link").attr("href");
                        feed.description = $(xml).find("feed > subtitle").text();
                        feed.lastBuildDate = $(xml).find("feed > updated").text();

                        $(xml).find("feed > entry").each(function(){
                            var lItem = new lumeboxItem();
                            lItem.title = $(this).find("title").eq(0).text();
                            lItem.link = $(this).find("link").eq(0).text();
                            lItem.updated = $(this).find("updated").eq(0).text();
                            lItem.id = $(this).find("id").eq(0).text();

                            if ($(this).find("content").eq(0).text()) {
                                lItem.description = $(this).find("content").eq(0).text();
                            }
                            else {
                                lItem.description = $(this).find("summary").eq(0).text();
                            }

                            feed.items.push(lItem);
                        });
                    }

                    // Execute the success-callback if present
                    if ($.isFunction(options.success))
                        options.success(feed);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    return false;
                }
            });
        },

        // Internal functions which outputs the HTML for an item
        createPostHtml: function(lumeboxItem){
            var title = "", html;
            if (lumeboxItem.title)
                title = '<div class="post-title"><h2><a href="' + lumeboxItem.link + '">' + lumeboxItem.title + '</a></h2></div>';
            return '<div class="post">' + title + '<div class="post-body>"><p>' + lumeboxItem.description + '</p></div></div>';
        }
    };

    // Gesture plugin
    $.fn.quickGestures = function(options) {
        settings = $.extend({
            left: function () {},
            right: function () {},
            threshold: 25
        }, options);

        this.each(function() {
            var data = {
                x: 0,
                y: 0
            };

            $(this).mousedown(function(e) {
                data.x = e.pageX;
                data.y = e.pageY;

                $(this).mousemove(function(e) {
                    var diffX = e.pageX - data.x;
                    if (diffX <= -settings.threshold) {
                        $(this).unbind("mousemove");
                        if ($.isFunction(settings.left)) settings.left();
                    } else if (diffX >= settings.threshold) {
                        $(this).unbind("mousemove");
                        if ($.isFunction(settings.right)) settings.right();
                    }
                });
            });
        });

        return this;
    };
})(jQuery);
