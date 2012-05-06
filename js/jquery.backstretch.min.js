/*
 * jQuery Backstretch
 * Version 1.3.0
 * Original version : http://srobbin.com/jquery-plugins/jquery-backstretch/
 *
 * Add a dynamically-resized background image to the page
 *
 * Copyright (c) 2011 Scott Robbin (srobbin.com)
 * Dual licensed under the MIT and GPL licenses.
 *
 * Version 1.3.0
 * Copyright (c) 2011 Christophe Desguez (eidolon-labs.com)
*/

;(function($) {

    var rootElement = ("onorientationchange" in window) ? $(document) : $(window); // hack to account for iOS position:fixed shortcomings
    var container;

    // Initialize
    function initContainer() {
        container = $("<div>")
            .attr("id", "backstretch")
            .css({
                position: "fixed",
                left: 0, top: 0,
                margin: 0, padding: 0,
                overflow: "hidden",
                zIndex: -999999,
                height: "100%", width: "100%"
            })
            .appendTo("body");
    }

    var defaultSettings = {
        centeredX: true,         // Should we center the image on the X axis?
        centeredY: true,         // Should we center the image on the Y axis?
        stretchX:  false,        // Should we occupy full screen width
        speed: 0,                // fadeIn speed for background after image loads (e.g. "fast" or 500)
        transition: function(image, speed, oldies, callback) {
            oldies.fadeOut(speed);
            image.fadeIn(speed, function() {
                // Remove the old images
                oldies.remove();
                // Callback
                if (typeof callback == "function") callback();
            });
        }
    };


    $.backstretch = function(src, options, callback) {

        if (!container) { // first call
            initContainer();
            // Adjust the background size when the window is resized or orientation has changed (iOS)
            $(window).resize(adjustBG);
        }

        var settings = container.data("settings") || defaultSettings; // If this has been called once before, use the old settings as the default

        // Extend the settings with those the user has provided
        if (options && typeof options == "object") {
            $.extend(settings, options);
            container.data("settings", settings);

        } else if (options && typeof options == "function") {// Just in case the user passed in a function without options
            callback = options;
        }


        // Prepare to delete any old images
        var oldies = container.find("img").addClass("deleteable");

        var $img = $("<img>")
            .css({
                position: "absolute",
                display: "none",
                margin: 0,
                zIndex: -999999,
                width: "auto", height: "auto"
            }).bind("load", function imageLoaded() {
                $img.data("ratio", $img.width() / $img.height()); // store the native image ratio when just loaded
                container.data("image", $img);
                adjustBG(function transition() {
                    settings.transition($img, settings.speed, oldies, callback);
                });

            }).appendTo(container);


        $img.attr("src", src); // Hack for IE img onload event

        function adjustBG(next) {
            try {
                // resize the container first
                container.width(rootElement.width()).height(rootElement.height());

                if (settings.stretchX) stretchImage(); else centerImage();
            } catch(err) {
                // IE7 seems to trigger _adjustBG before the image is loaded.
                // This try/catch block is a hack to let it fail gracefully.
            }

            // Executed the callback function if passed
            if (typeof next == "function") next();
        }

        function centerImage() {

            container.data("image").css({
                margin: (settings.centeredX) ? "0 auto" : "0 auto 0 0",
                height: rootElement.height()
            });
        }
        function stretchImage() {
            var $img = container.data("image"),
                imgRatio = $img.data("ratio"), // the native image ratio
                bgCSS = {left: 0, top: 0},
                bgWidth  = rootElement.width(),
                bgHeight = bgWidth / imgRatio,
                bgOffset;

            // Make adjustments based on image ratio
            // Note: Offset code provided by Peter Baker (http://ptrbkr.com/). Thanks, Peter!
            if (bgHeight >= rootElement.height()) {
                bgOffset = (bgHeight - rootElement.height()) /2;
                if (settings.centeredY) $.extend(bgCSS, {top: "-" + bgOffset + "px"});

            } else {
                bgHeight = rootElement.height();
                bgWidth = bgHeight * imgRatio;
                bgOffset = (bgWidth - rootElement.width()) / 2;
                if (settings.centeredX) $.extend(bgCSS, {left: "-" + bgOffset + "px"});
            }

            $img.width(bgWidth).height(bgHeight).css(bgCSS);
        }


        // For chaining
        return this;

    };
  
})(jQuery);
