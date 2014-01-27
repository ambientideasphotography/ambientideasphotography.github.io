=== Lumebox ===
Plugin Homepage: http://anders.zakrisson.se/projects/lumebox
Author: Anders Zakrisson
Author website: http://anders.zakrisson.se
Author contact: contact-anders@zakrisson.se

The Lumebox is an Open-Source (GPL) Lightbox clone written as a JavaScript jQuery
plugin with a few added features. One of the main features is that it can parse
RSS feeds just as easily as displaying images. The plugin searches the post or
page for all links leading to images and opens them in a popup instead of
following them.

== Prerequisites ==

The Lumebox was written using jQuery 1.3.2 so I recommend that it is used in
combination with this or a later version but it might very well work with
previous versions as well, I just haven't tested it.

== Installation ==

1. Load the lumebox.css or copy the classes to another file that'll be loaded
2. Copy the stop32.png-file to the same folder as the css-file or change the
   url in the #lumebox-close class
3. Load the Lumebox Javascript file somewhere on the page after jQuery has been
   loaded

== Usage ==

Call the function $.lumebox.init(); to load the plugin and traverse the page.
Add rel="lightbox" to any links that you want to be parsed by the Lumebox and
the title with the caption. It'll find the target of the link and use it for
source to the image in the popup and the content of the title attribute as
caption. Images and feeds can be grouped by naming them
rel="lightbox[groupName]". To avoid potential confusion between images and
feeds all RSS-feeds have to be grouped in a name starting with "rss", for
example rel="lightbox[rssGroup1]".

== Options ==

Options are passed as an object when initializing the Lumebox. All have default
values to the only ones that has to be specified are the ones which need to
change, defaults are shown in the parentheses.

* showAsList (false): If true all items in a group will be shown in a list in
  the Lumebox.
* rss (empty array): An array of urls to RSS-feeds.
* proxy (empty string): path/url to local proxy to use when fetching external
  feeds.
* duration ("fast"): Keyword (slow, normal, fast) or duration in milliseconds
  used for animating transitions.
* popupMaxWidth (680): The max total width of the popup including margins.
* opacity (0.7): The opacity of the overlay.
* loop (true): Whether to start over at item number one after pressing next at
  the last item.
* scrollToTop (false): Force scroll to the top of the popup everytime it's
  opened.
* autoNext (false): Loads the next item after autoNext milliseconds if the
  Lumebox is open.
* infoText ("Use left and right arrow keys to jump to the other items, close
  with Esc."): Text to display at the bottom of the popup.
* parentElementId (false): The id of an element to use as a parent for the
  popup, it will be inserted just before this element is closed. If no element
  id is passed the Lumebox is inserted right before the closing body-tag.
* useGestures (true): Whether to use gestures for post navigation in addition to
  keys. Click and left loads the previous post, click and right the next.
  
== RSS Parser ==

The RSS parser that's built into the plugin is compatible with RSS and ATOM
feeds and can be used on its own. It takes two parameters, the URL to parse and
a function to execute when it has fetched and parsed the feed. Since it uses
Ajax the URL must be local or go through a local proxy, since it fetches XML
jsonp callbaks can't be used. The following example will hopefully clear up
how it can be used:

jQuery.lumebox.parseFeed({
    url: "/rss",
    success: function(feed){
        console.log("Feed title: " + feed.title);
        jQuery.each(feed.items, function(j, post){
            console.log("Post title: " + post.title);
        });
    }
});

The feed in an object containing the following attributes:

* title
* link
* description
* version
* items

All attributes except items are extracted from the header in the RSS feed.
Items is an array containing objects representing the items in RSS feeds and
entries in ATOM feeds:

* title
* link
* description
* updated
* id
* media

The parser always tries to exctract as much information as possible to use as
description, if both a summary and content is specified in an ATOM feed it uses
content, for example.

== Changelog ==

= 1.03 =
* Fixed the sample in the release

= 1.02 =
* The close button was removed. Everyone clicks outside, right?
* Better resizing, the size and position are now animated simultaneously
* Fixed the bug that resized the popup with the content visible when using the
  next() or previous() functions
* Added basic gesture control, click and drag left to go to previous, click and
  go right to load the next post

= 1.01 =
* Clicks on links are now intercepted instead of changed to onCLicks
* The popup uses the browser scroll bar instead of adding a new one
* Some browser compatibility issues concerning size and position of
  the popup were fixed


= 1.0 =
* The first official release of Lumebox

== Known Issues ==

* Due to Firefox not returning any values (other than 0) when using
  jQuery.offset() the popup isn't correctly centered when the parent element is
  positioned (usually the body)

== License ==

Lumebox Wordpress Plugin - The jQuery Lumebox plugin for Wordpress.org
Copyright (C) 2010 Anders Zakrisson, Sogeti

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.