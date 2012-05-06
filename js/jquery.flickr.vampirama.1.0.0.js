/*
 Vampirama - A Diaporama extracted from Flickr sets

 Usage :

    var vmp = new Vampirama({target: "#diapo-container", source: "flickr", api_key: "your_api_key"});
    vmp.start("set_id");
    vmp.stop({restore: "image_url"});

    ELRIC & CHRISTOPHE & MAYUKO
             2012
 */

var Vampirama = function(options) {

    // Store our self reference
    var self = this;

    // Default values for our diaporama
    var defaults = {
        source: "flickr",
        target: "#backstretch",
        autostart: false,
        image_size: "b",
        delay: 2000, // delay between slides
        transition: 500 // delay of the transition
    };

    /* Utility methods (private stuff) */

    var checkOptions = function(opt) {
        if (!opt.api_key) {
            throw "You must provide your own Flickr API key to use this plugin !";
        }
    };

    // Build the response structure from a Flickr set
    var getFlickrSet = function(setId, apiKey, callback) {

        var flickURL = "http://api.flickr.com/services/rest?format=json&method=flickr.photosets.getPhotos"
            + "&api_key=" + apiKey + "&photoset_id=" + setId + "&jsoncallback=?";

        var retrieveData = function(data) {
            var result = [];

            $.each(data.photoset.photo, function(i, photo) {
                var baseURL = "http://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret;

                result.push({
                    url:  baseURL + "_" + self.options.image_size + ".jpg",
                    thumb: baseURL + "_t.jpg",
                    caption: photo.title
                });
            });

            return result;
        };

        // Ajax call
        $.getJSON(flickURL).success(function(data) {
            callback(retrieveData(data));
        }).error(function(err) {
            console.err(err);
        });

    };

    var initSlides = function(slides) {
        self.slides = slides;
        self.slideCount = slides.length;
        self.index = -1;
        self.isRunning = false;
    };

    // do we have our set of slides ready ?
    var initialized = function() {
        return (self.slides && self.slideCount);
    };

    // register the next transition to occur
    var transition = function() {
        if (self.isRunning) self.nextTransition = setTimeout(self.next, self.options.delay);
    };


    /* == Public methods (all are chainable) == */

    // Load the slides array
    this.load = function(setId, autostart) {

        getFlickrSet(setId, self.options.api_key, function(data) {
            initSlides(data);
            if (autostart) self.start();
        });
        return self;
    };

    this.start = function() {
        if (initialized()) {
            self.isRunning = true;
            self.next();
        }
        return self;
    }

    this.stop = function(restore) {
        clearTimeout(self.nextTransition);
        self.isRunning = false;
        if (restore) $.backstretch(restore, {speed: self.options.transition});
        return self;
    };

    this.next = function() {
        self.index = ((self.index + 1) % self.slideCount);
        console.log("Displaying image #" + self.index + " : " + self.slides[self.index].url);
        $.backstretch(self.slides[self.index].url, {speed: self.options.transition}, transition);
        return self;
    };
    this.prev = function() {
        self.index = (self.index > 0) ? (self.index - 1) : (self.slideCount - 1);
        $.backstretch(self.slides[self.index].url, {speed: self.options.transition});
        return self;
    };
    this.playpause = function() {
        return (self.isRunning) ? self.stop() : self.start();
    };

    /*
     * Initialization
     */
    checkOptions(options);

    this.options = $.extend({}, defaults, options);

    if (this.options.flickrSet) this.load(this.options.flickrSet, this.options.autostart);

};

