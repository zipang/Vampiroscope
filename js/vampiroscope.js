/**
 * Page Event handling
 * Dependancies :
 *  jQuery Hotkeys (register events on special key combinaisons) :
 *  Backstretch (stretch images on the background) : https://zipang.github.com/jquery-backstretch
 *  Vampirama (a flickr diaporama build on top of backstretch) :
 *  ICanHaz (simple client-sides templates with mustache) : http://icanhazjs.com/
 *
 */
$(function onload() {

    var vampirsets = { // index the sets by their keywords
        "#punkrockcity": {set: "72157629532299982"},
        "#citylights": {set: "72157629219615600"},
        "#pagode": {set: "72157627781608636"},
        "#dreams": {set: "72157629533102062"},
        "#nightride": {set: "72157629917483407"},

        "#bedrooms": {gallery: "1526666-72157629543719549"},
        "#heroins": {gallery: "1526666-72157629179103784"},
        "#elsewhere": {gallery: "1526666-72157629473504865"},
        "#elsewhere2": {gallery: "1526666-72157629118463060"},

        "#favorites": {favorites: "1526666-72157629118463060"},

    };

    var vampirama; // the current running diaporama
    var video; // the current video (if running)

    // Display our Vampir logo in a few moments
    setTimeout(function () {
        $.backstretch("images/vampir-logo.png", {speed:1000, stretchMode:"adapt"});
    }, 200);

    // Preload each diaporama refered by the menu links (a[href])
    $("#menu a.diaporama").each(function (i, anchor) {
        var $a = $(anchor), source = $.extend({
            api_key:"ef8c4448373a66b477d0a3ffe745edae", transition:1000
        }, vampirsets[$a.attr("href")]);
        // store the preloaded vampirama object on our link
        $a.data("diapo", new Vampirama(source));
    });

    var next = function () {
        if (vampirama) vampirama.stop().next();
    };
    var previous = function () {
        if (vampirama) vampirama.stop().prev();
    };
    var playpause = function () {
        if (vampirama) vampirama.playpause();
    };
    // Register keyboard events to control play/pause of the diaporamas
    $(document).bind('keydown', 'right', next);
    $(document).bind('keydown', 'left', previous);
    $(document).bind('keydown', 'space', playpause);

    /* Attach the event handler to the menu */
    $("#menu").delegate("a.diaporama", "click", function (evt) {

        var $this = $(this);

        if (video) {
            $("#backstretch iframe").remove();
            video = false;
        }

        if ($this.hasClass("active")) {
            vampirama.stop("images/vampir-logo.png");
            $("#header").removeClass("hidden");
            $this.removeClass("active");
            vampirama = false;

        } else {
            $("#menu a").removeClass("active");
            if (vampirama) vampirama.stop();
            vampirama = $this.data("diapo").start();
            $("#header").addClass("hidden");
            $this.addClass("active");
        }

        evt.preventDefault();
        return false;
    });

    // Now do the stuff for the videos
    $("#menu").delegate("a.video", "click", function (evt) {

        var $a = $(this);

        if (video) $("#backstretch iframe").remove();
        video = {id:$a.attr("href").split("/").pop(), title:$a.text() };
        $("#menu a").removeClass("active");


        $a.addClass("active");
        $("#header").addClass("hidden");
        if (vampirama) vampirama.stop();
        vampirama = false;

        var videoframe = ich.videoframe(video); // load the video template with our video
        $("#backstretch").html(videoframe);

        evt.preventDefault();
        return false;
    });

});

