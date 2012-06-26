/*
 Vampirama - A Diaporama of images extracted from Flickr sets
 Based on Backstretch 1.3 : https://github.com/zipang/jquery-backstretch

 Usage :

    var vmp = new Vampirama({target: "#diapo-container", source: "flickr", api_key: "your_api_key"});
    vmp.start("set_id");
    vmp.stop({restore: "image_url"});

 Author : Christophe Desguez
 Web site : http://eidolon-labs.com

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
        if (!(opt.set || opt.gallery || opt.favorites)) {
            throw "Unknown source param for flickr. Supported params are :\n"
                + "'set', 'gallery', 'favorites' with their value : set_id, gallery_id, user_id.";
        }
        return opt;
    };

    // Build the response structure from a Flickr set
    var retrieveImagesData = function(params, callback) {

        var flickURL;

        if (params.set) {
            flickURL = "http://api.flickr.com/services/rest?format=json&method=flickr.photosets.getPhotos"
                + "&api_key=" + params.api_key + "&photoset_id=" + params.set + "&jsoncallback=?";

        } else if (params.gallery) {
            flickURL = "http://api.flickr.com/services/rest?format=json&method=flickr.galleries.getPhotos"
                + "&api_key=" + params.api_key + "&gallery_id=" + params.gallery + "&jsoncallback=?";

        } else if (params.favorites) {
            flickURL = "http://api.flickr.com/services/rest?format=json&method=flickr.favorites.getList"
                + "&api_key=" + params.api_key + "&user_id=" + params.favorites + "&jsoncallback=?";

        }

        var buildData = function(data) { // build a light representations
            var result = [], photos = (data.photos) ? data.photos.photo : data.photoset.photo;

            $.each(photos, function(i, photo) {
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
            callback(buildData(data));
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
    this.load = function () {
        var options = self.options;

        retrieveImagesData(options, function(data) {
            initSlides(data);
            if (options.autostart) self.start();
        });
        return self;
    };

    this.start = function () {
        if (initialized()) {
            self.isRunning = true;
            self.next();
        }
        return self;
    }

    this.stop = function (restore) {
        clearTimeout(self.nextTransition);
        self.isRunning = false;
        if (restore) $.backstretch(restore, {speed: self.options.transition});
        return self;
    };

    this.next = function () {
        self.index = ((self.index + 1) % self.slideCount);
        console.log("Displaying image #" + self.index + " : " + self.slides[self.index].url);
        $.backstretch(self.slides[self.index].url, {speed: self.options.transition}, transition);
        return self;
    };
    this.prev = function () {
        self.index = (self.index > 0) ? (self.index - 1) : (self.slideCount - 1);
        $.backstretch(self.slides[self.index].url, {speed: self.options.transition});
        return self;
    };
    this.playpause = function () {
        return (self.isRunning) ? self.stop() : self.start();
    };

    /*
     * Initialization
     */
    this.options = $.extend({}, defaults, checkOptions(options));

    this.load();

};

