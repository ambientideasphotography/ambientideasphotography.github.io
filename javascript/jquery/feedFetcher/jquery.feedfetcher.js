/*
* JQuery feed fetcher from Google Feed
*
* Makes easier feed fetch from any RSS or XML feed, with Google Feed API on the fly
*
* Adds the following methods to jQuery:
* 
* $('.blog_content').feedfetcher(); - append a feed list in the applied DOM element with link to the source of feed result.
*
* Parameters
*	feed_source: '[feed_source]' - the source of the feed
*	head_class: '[class]' - append a feed source link and name to the given DOM element
*
*
* Result
* 	- A list of paragraphs contain a feed title with a link to a feed soure
*
* WARNING
* You need to load the JS API from google to use this plug-in
*
*	<script type="text/javascript" src="http://www.google.com/jsapi"></script>
*	<script type="text/javascript">
*    google.load("feeds", "1");
*	</script>
*
* Copyright (c) 2009 Istvan Ferenc Toth
*
* Plugin homepage:
* http://adminlight.com/static/files/feedfetch.html
*
* Example:
* http://adminlight.com/static/files/feedfetch.html
*
* Version 0.1.0.0
*
* Tested with:
* - Linux: Firefox 2
* - Windows: Firefox 2, Internet Explorer 6+
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*
* Credits:
*   - http://code.google.com/: 
*   - http://adminlight.com: 
*	- http://www.learningjquery.com/2007/10/a-plugin-development-pattern
*/
 
  (function($) {
	//
	// plugin definition
	//
	$.fn.feedfetcher = function(options) {
	  // build main options before element iteration
	  var opts = $.extend({}, $.fn.feedfetcher.defaults, options);
	  // iterate and reformat each matched element
	  return this.each(function() {
		$this = $(this);
		// build element specific options
		var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
		// display feed
		var feed = new google.feeds.Feed(o.feed_source);
		feed.load(function(result) {
		debug('feed contact ok');
        if (!result.error) {
			debug('feed content loaded');
			$this.hide();
			if (o.head_class!='') $('.'+o.head_class).append('<a href="'+result.feed.link+'" target="_blank">'+result.feed.title+'</a>');
			for (i in result.feed.entries) {
            var entry = result.feed.entries[i];
				$this.append('<p><a href="'+entry.link+'">'+entry.title+'</a></p>');
			}
		} else {
			debug('feed error');
			$this.append('<p>'+result.error.message+'</p>');
		}
		$this.show("slow");
		});		
		
	  });
	};
	//
	// private function for debugging
	//
	function debug($obj) {
	  if (window.console && window.console.log)
		window.console.log('feedfetcher: ' + $obj);
	};
	//
	// plugin defaults
	//
	$.fn.feedfetcher.defaults = {
	  feed_source: 'http://adminlight.blogspot.com/feeds/posts/default',
	  head_class: '',
	};
//
// end of closure
//
})(jQuery);


