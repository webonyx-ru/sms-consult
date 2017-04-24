(function() {

    function YOURAPPNAME(doc) {
        var _self = this;

        _self.doc = doc;
        _self.window = window;
        _self.html = _self.doc.querySelector('html');
        _self.body= _self.doc.body;
        _self.location = location;
        _self.hash = location.hash;
        _self.Object = Object;
        _self.scrollWidth = 0;

        _self.bootstrap();
    }

    YOURAPPNAME.prototype.bootstrap = function() {
        var _self = this;

        // Initialize window scollBar width
        _self.scrollWidth = _self.scrollBarWidth();
    };

    // Window load types (loading, dom, full)
    YOURAPPNAME.prototype.appLoad  = function (type, callback) {
        var _self = this;

        switch(type) {
            case 'loading':
                if (_self.doc.readyState === 'loading') callback();

                break;
            case 'dom':
                _self.doc.onreadystatechange = function () {
                    if (_self.doc.readyState === 'complete') callback();
                };

                break;
            case 'full':
                _self.window.onload = function(e) {
                    callback(e);
                };

                break;
            default:
                callback();
        }
    };

    // Detect scroll default scrollBar width (return a number)
    YOURAPPNAME.prototype.scrollBarWidth = function() {
        var _self = this,
            outer = _self.doc.createElement("div");
            outer.style.visibility = "hidden";
            outer.style.width = "100px";
            outer.style.msOverflowStyle = "scrollbar";

        _self.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;

        outer.style.overflow = "scroll";

        var inner = _self.doc.createElement("div");

        inner.style.width = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;

        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    };

    YOURAPPNAME.prototype.initSwitcher = function () {
        var _self = this;

        var switchers = _self.doc.querySelectorAll('[data-switcher]');

        if(switchers && switchers.length > 0) {
            for(var i=0; i<switchers.length; i++) {
                var switcher = switchers[i],
                    switcherOptions = _self.options(switcher.dataset.switcher),
                    switcherElems = switcher.children,
                    switcherTargets = _self.doc.querySelector('[data-switcher-target="' + switcherOptions.target + '"]').children;

                for(var y=0; y<switcherElems.length; y++) {
                    var switcherElem = switcherElems[y],
                        parentNode = switcher.children,
                        switcherTarget = switcherTargets[y];

                    if(switcherElem.classList.contains('active')) {
                        for(var z=0; z<parentNode.length; z++) {
                            parentNode[z].classList.remove('active');
                            switcherTargets[z].classList.remove('active');
                        }
                        switcherElem.classList.add('active');
                        switcherTarget.classList.add('active');
                    }

                    switcherElem.children[0].addEventListener('click', function (elem, target, parent, targets) {
                        return function (e) {
                            e.preventDefault();
                            if(!elem.classList.contains('active')) {
                                for(var z=0; z<parentNode.length; z++) {
                                    parent[z].classList.remove('active');
                                    targets[z].classList.remove('active');
                                }
                                elem.classList.add('active');
                                target.classList.add('active');
                            }
                        };

                    }(switcherElem, switcherTarget, parentNode, switcherTargets));
                }
            }
        }
    };

    YOURAPPNAME.prototype.str2json = function(str, notevil) {
        try {
            if (notevil) {
                return JSON.parse(str
                    .replace(/([\$\w]+)\s*:/g, function(_, $1){return '"'+$1+'":';})
                    .replace(/'([^']+)'/g, function(_, $1){return '"'+$1+'"';})
                );
            } else {
                return (new Function("", "var json = " + str + "; return JSON.parse(JSON.stringify(json));"))();
            }
        } catch(e) { return false; }
    };

    YOURAPPNAME.prototype.options = function(string) {
        var _self = this;

        if (typeof string !='string') return string;

        if (string.indexOf(':') != -1 && string.trim().substr(-1) != '}') {
            string = '{'+string+'}';
        }

        var start = (string ? string.indexOf("{") : -1), options = {};

        if (start != -1) {
            try {
                options = _self.str2json(string.substr(start));
            } catch (e) {}
        }

        return options;
    };

    YOURAPPNAME.prototype.popups = function (options) {
        var _self = this;

        var defaults = {
            reachElementClass: '.js-popup',
            closePopupClass: '.js-close-popup',
            currentElementClass: '.js-open-popup',
            changePopupClass: '.js-change-popup'
        };

        options = $.extend({}, options, defaults);

        var plugin = {
            reachPopups: $(options.reachElementClass),
            bodyEl: $('body'),
            topPanelEl: $('.top-panel-wrapper'),
            htmlEl: $('html'),
            closePopupEl: $(options.closePopupClass),
            openPopupEl: $(options.currentElementClass),
            changePopupEl: $(options.changePopupClass),
            bodyPos: 0
        };

        plugin.openPopup = function (popupName) {
            plugin.reachPopups.filter('[data-popup="' + popupName + '"]').addClass('opened');
            plugin.bodyEl.css('overflow-y', 'scroll');
            plugin.topPanelEl.css('padding-right', scrollSettings.width);
            plugin.htmlEl.addClass('popup-opened');
        };

        plugin.closePopup = function (popupName) {
            plugin.reachPopups.filter('[data-popup="' + popupName + '"]').removeClass('opened');
            setTimeout(function () {
                plugin.bodyEl.removeAttr('style');
                plugin.htmlEl.removeClass('popup-opened');
                plugin.topPanelEl.removeAttr('style');
            }, 500);
        };

        plugin.changePopup = function (closingPopup, openingPopup) {
            plugin.reachPopups.filter('[data-popup="' + closingPopup + '"]').removeClass('opened');
            plugin.reachPopups.filter('[data-popup="' + openingPopup + '"]').addClass('opened');
        };

        plugin.init = function () {
            plugin.bindings();
        };

        plugin.bindings = function () {
            plugin.openPopupEl.on('click', function (e) {
                e.preventDefault();
                var pop = $(this).attr('data-open-popup');
                plugin.openPopup(pop);
            });

            plugin.closePopupEl.on('click', function (e) {
                var pop;
                if (this.hasAttribute('data-close-popup')) {
                    pop = $(this).attr('data-close-popup');
                } else {
                    pop = $(this).closest(options.reachElementClass).attr('data-popup');
                }

                plugin.closePopup(pop);
            });

            plugin.changePopupEl.on('click', function (e) {
                var closingPop = $(this).attr('data-closing-popup');
                var openingPop = $(this).attr('data-opening-popup');

                plugin.changePopup(closingPop, openingPop);
            });

            plugin.reachPopups.on('click', function (e) {
                var target = $(e.target);
                var className = options.reachElementClass.replace('.', '');
                if (target.hasClass(className)) {
                    plugin.closePopup($(e.target).attr('data-popup'));
                }
            });
        };

        if (options)
            plugin.init();

        return plugin;
    };

    var app = new YOURAPPNAME(document);

    app.appLoad('loading', function () {
        console.log('App is loading... Paste your app code here.');
        // App is loading... Paste your app code here. 4example u can run preloader event here and stop it in action appLoad dom or full
    });


    app.appLoad('dom', function () {
        /*-----------------------------------------------------------------------------------*/
        /*	GO TO TOP
         /*-----------------------------------------------------------------------------------*/
        ! function (a, b, c) {
            a.fn.scrollUp = function (b) {
                a.data(c.body, "scrollUp") || (a.data(c.body, "scrollUp", !0), a.fn.scrollUp.init(b))
            }, a.fn.scrollUp.init = function (d) {
                var e = a.fn.scrollUp.settings = a.extend({}, a.fn.scrollUp.defaults, d),
                    f = e.scrollTitle ? e.scrollTitle : e.scrollText,
                    g = a("<a/>", {
                        id: e.scrollName,
                        href: "#top",
                        title: f
                    }).appendTo("body");
                e.scrollImg || g.html(e.scrollText), g.css({
                    display: "none",
                    position: "fixed",
                    zIndex: e.zIndex
                }), e.activeOverlay && a("<div/>", {
                    id: e.scrollName + "-active"
                }).css({
                    position: "absolute",
                    top: e.scrollDistance + "px",
                    width: "100%",
                    borderTop: "1px dotted" + e.activeOverlay,
                    zIndex: e.zIndex
                }).appendTo("body"), scrollEvent = a(b).scroll(function () {
                    switch (scrollDis = "top" === e.scrollFrom ? e.scrollDistance : a(c).height() - a(b).height() - e.scrollDistance, e.animation) {
                        case "fade":
                            a(a(b).scrollTop() > scrollDis ? g.fadeIn(e.animationInSpeed) : g.fadeOut(e.animationOutSpeed));
                            break;
                        case "slide":
                            a(a(b).scrollTop() > scrollDis ? g.slideDown(e.animationInSpeed) : g.slideUp(e.animationOutSpeed));
                            break;
                        default:
                            a(a(b).scrollTop() > scrollDis ? g.show(0) : g.hide(0))
                    }
                }), g.click(function (b) {
                    b.preventDefault(), a("html, body").animate({
                        scrollTop: 0
                    }, e.topSpeed, e.easingType)
                })
            }, a.fn.scrollUp.defaults = {
                scrollName: "scrollUp",
                scrollDistance: 600,
                scrollFrom: "top",
                scrollSpeed: 600,
                easingType: "linear",
                animation: "fade",
                animationInSpeed: 400,
                animationOutSpeed: 400,
                scrollText: "Scroll to top",
                scrollTitle: !1,
                scrollImg: !1,
                activeOverlay: !1,
                zIndex: 2147483647
            }, a.fn.scrollUp.destroy = function (d) {
                a.removeData(c.body, "scrollUp"), a("#" + a.fn.scrollUp.settings.scrollName).remove(), a("#" + a.fn.scrollUp.settings.scrollName + "-active").remove(), a.fn.jquery.split(".")[1] >= 7 ? a(b).off("scroll", d) : a(b).unbind("scroll", d)
            }, a.scrollUp = a.fn.scrollUp
        }(jQuery, window, document);

        $(document).ready(function () {
            $.scrollUp({
                scrollName: 'scrollUp', // Element ID
                scrollDistance: 600, // Distance from top/bottom before showing element (px)
                scrollFrom: 'top', // 'top' or 'bottom'
                scrollSpeed: 600, // Speed back to top (ms)
                easingType: 'linear', // Scroll to top easing (see http://easings.net/)
                animation: 'fade', // Fade, slide, none
                animationInSpeed: 400, // Animation in speed (ms)
                animationOutSpeed: 400, // Animation out speed (ms)
                scrollText: '<i class="icon-up-open"></i>', // Text for element, can contain HTML
                scrollTitle: false, // Set a custom <a> title if required. Defaults to scrollText
                scrollImg: false, // Set true to use image
                activeOverlay: false, // Set CSS color to display scrollUp active point, e.g '#00FFFF'
                zIndex: 1001 // Z-Index for the overlay
            });
        });

        /*-----------------------------------------------------------------------------------*/
        /*	TOOLTIP
         /*-----------------------------------------------------------------------------------*/

        if ($("[rel=tooltip]").length) {
            $("[rel=tooltip]").tooltip();
        }

        /*-----------------------------------------------------------------------------------*/
        /*	TABS
         /*-----------------------------------------------------------------------------------*/

        $('.tabs.services').easytabs({
            animationSpeed: 300,
            updateHash: false,
            cycle: 15000
        });


        $('.tabs.tabs-top, .tabs.tabs-side').easytabs({
            animationSpeed: 500,
            updateHash: false
        });

        /*-----------------------------------------------------------------------------------*/
        /*	TESTIMONIALS
         /*-----------------------------------------------------------------------------------*/

        $('#testimonials').easytabs({
            animationSpeed: 500,
            updateHash: false,
            cycle: 5000
        });


        $(".js-open-menu").click(function(){
            if ($(".js-menu").hasClass("js-open")) {
                $(".js-menu").stop().slideUp(400).removeClass("js-open");
            } else {
                $(".js-menu").stop().slideDown(400).addClass("js-open");
            }
        });

        var resizeTime;
        $(window).resize(function(){
            clearTimeout(resizeTime);
            resizeTime = setTimeout(function(){
                var siteWrapper = $(".js-site-wrapper");
                if (siteWrapper.outerWidth() > 992) {
                    $(".js-menu").show();
                } else if ((siteWrapper.outerWidth() < 992) && (!$(".js-menu").hasClass("js-open")) ) {
                    $(".js-menu").hide(10);
                }
            },100);
        });


        var headerHeight = $(".header-top").outerHeight(),
            headerNavHeight = $(".header__navigation").outerHeight();

        $(window).scroll(function(){
            var siteWrapper = $(".js-site-wrapper");
            if (siteWrapper.outerWidth() > 992) {
                var windowScrollTop = $(window).scrollTop();
                if (windowScrollTop > headerHeight) {
                    $(".header").addClass("fixed");
                    $(".header-fixed-line").css("height", headerNavHeight );
                } else {
                    $(".header").removeClass("fixed");
                    $(".header-fixed-line").css("height", 0 );
                }
            }
        });

        $(".js-dropdown-toggle").click(function(e){
            var siteWrapper = $(".js-site-wrapper");
            if (siteWrapper.outerWidth() < 992) {
                e.preventDefault();
                var thisParent = $(this).closest(".js-dropdown");
                thisParent.find(".js-dropdown-menu").stop().slideToggle(400);
                thisParent.toggleClass("open");
            }

        });


        var revapi;
        jQuery(document).ready(function () {

            revapi = jQuery('.fullwidthbanner').revolution({
                delay: 15000,
                startwidth: 1170,
                startheight: 600,
                hideThumbs: 200,
                fullWidth: "on"
            });

        });

        /*-----------------------------------------------------------------------------------*/
        /*	OWL CAROUSEL
         /*-----------------------------------------------------------------------------------*/
        $("#owl-clients").owlCarousel({

            autoPlay: 9000,
            rewindNav: false,
            items: 6,
            itemsDesktop: [1200, 6],
            itemsDesktopSmall: [1024, 4],
            itemsTablet: [768, 3],
            itemsMobile: [480, 2],
            navigation: false,
            pagination: false

        });


        console.log('DOM is loaded! Paste your app code here (Pure JS code).');
        // DOM is loaded! Paste your app code here (Pure JS code).
        // Do not use jQuery here cause external libs do not loads here...

        app.initSwitcher(); // data-switcher="{target='anything'}" , data-switcher-target="anything"
    });

    app.appLoad('full', function (e) {
        console.log('App was fully load! Paste external app source code here... For example if your use jQuery and something else');
        // App was fully load! Paste external app source code here... 4example if your use jQuery and something else
        // Please do not use jQuery ready state function to avoid mass calling document event trigger!
    });

})();
