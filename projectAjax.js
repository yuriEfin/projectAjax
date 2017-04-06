/**
 * Created by gambit on 05.04.17.
 */
ProjectAjax = function (context, isPushHistory) {
    self = this;

    // context call
    this.context = context ? context : this;

    this.pushHistory = isPushHistory !== undefined ? isPushHistory : true;

    this.setEventHandler = function () {
        $(document).on('dblclick', '[data-dblclick]', function () {
            self.reloadPage($(this).attr('data-dblclick'));
        });
    };
}


/**
 * Wrapper Ajax query
 * @param string url
 * @param string container
 * @param object callback
 * @param object context
 * @param array callbackArgs
 */
ProjectAjax.prototype.setHistory = function (url) {
    history.pushState({}, '', url);
};

var processAjax = false,
    processAjaxUrl = undefined;

ProjectAjax.prototype.query = function (url, container, callback, context, callbackArgs, target) {
    if (!context) {
        context = window;
    }
    var selector = container ? container : '.page-body';
    var urlQuery = url ? url : window.location.href;
    var urlObject = new CrmUrl(urlQuery);
    if (self.pushHistory) {
        self.setHistory(url);
        window.removeEventListener("popstate", self.popstateHandler);
        window.addEventListener("popstate", self.popstateHandler);
    }
    if (false === processAjax && processAjaxUrl === undefined) {
        $.ajax({
            url: urlQuery,
            type: 'GET',
            statusCode: {
                301: function () {
                    self.forceRefresh();
                },
                302: function () {
                    self.forceRefresh();
                },
                200: function () {

                }
            },
            beforeSend: function (xhr) {
                processAjax = true;
                processAjaxUrl = urlQuery;
                $('.page-container').addClass('opacity04');
            },
            success: function (data, textStatus, jqXHR) {
                console.log(jqXHR.status, 'xhr.status');
                console.log(textStatus, 'xhr.textStatus');

                var redirect;
                if (redirect = jqXHR.getResponseHeader('AJAX-REDIRECT-URL')) {
                    if (selector = jqXHR.getResponseHeader('AJAX-CONTAINER')) {
                        container = selector;
                    }
                    return self.forceRefresh(redirect);
                } else {
                    $(selector).html('');
                    $(selector).html(data);
                }

                self.applyCallback(data, jqXHR, callback, callbackArgs, context, urlObject, target);
                self.applyDefaulCallback(context, data, textStatus, jqXHR, urlObject, target);
            },
            complete: function (jqXHR, textStatus) {
                var flash = $.parseJSON($.ajax({
                    url: '/site/getFlash',
                    async: false,
                    dataType: "JSON"
                }).responseText);
                if (flash) {
                    alert(flash.message);
                }
                console.log(jqXHR.getAllResponseHeaders(), 'complete getAllResponseHeaders');
                console.log(jqXHR.getResponseHeader('AJAX-REDIRECT-URL'), "complete jqXHR.getResponseHeader('AJAX-REDIRECT-URL')");
                $('.page-container').removeClass('opacity04');
                processAjax = false;
                processAjaxUrl = undefined;
                $('body').animate({scrollTop: 150}, '1000');
                self.applyDefaulCallback(context, '', textStatus, jqXHR, urlObject, target);
                self.initScrollPage();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                processAjax = false;
                processAjaxUrl = undefined;
                self.forceRefresh();
            }
        }).done(function (data, textStatus, xhr) {
            console.log(xhr.getAllResponseHeaders(), 'getAllResponseHeaders');
            console.log(xhr.getResponseHeader('AJAX-REDIRECT-URL'), "xhr.getResponseHeader('AJAX-REDIRECT-URL')");
        });
    } else {
        console.log('Наложение AJAX запросов, URL: ' + urlQuery);
    }
};

ProjectAjax.prototype.initScrollPage = function () {
    if (YII_DEBUG) {
        console.log('initScrollPage', 'initScrollPage');
    }
    scrollPage = new ScrollLoadContent();
    if (Helper.prototype.in_array(window.location.pathname, scrollPage.initLocation.route)) {
        scrollPage.run();
    }
};
ProjectAjax.prototype.applyDefaulCallback = function (context, data, textStatus, jqXHR, urlObject, target) {
    if (!context && YII_DEBUG) {
        console.log(context, 'The context is not defined, the applyAjaxSuccess && applyAjaxComplete method is not used');
    }
    if (typeof context !== "undefined" && typeof context.applyAjaxSuccess !== "undefined") {
        context.applyAjaxSuccess(context, data, textStatus, jqXHR, urlObject, target);
    }
    if (typeof context !== "undefined" && typeof context.applyAjaxComplete !== "undefined") {
        context.applyAjaxComplete(context, data, textStatus, jqXHR, urlObject, target);
    }
};

/**
 * Аварийная принудительная перезагрузка страницы
 */
ProjectAjax.prototype.forceRefresh = function (url) {
    if (!url) {
        window.location.reload();
    } else {
        window.location.href = url;
    }
};

/**
 * Run callback after get response ajax query
 * @param mixed data
 * @param XMLHttpRequest object jqXHR
 * @param object OR array callback
 * @param array callbackArgs
 * @param CrmUrl urlObject
 */
ProjectAjax.prototype.applyCallback = function (data, jqXHR, callback, callbackArgs, context, urlObject) {
    if (callback) {
        if (!Array.isArray(callback)) {
            callback.call(context, callbackArgs);
        } else {
            var i = 0;
            for (i; i <= callback.length; i++) {
                callback[i].call(context, callbackArgs);
            }
        }
    }
}
ProjectAjax.prototype.showLoader = function () {
    NProgress.start();
};

ProjectAjax.prototype.hideLoader = function () {
    NProgress.done();
};
ProjectAjax.prototype.reloadPage = function (url, container, callback, context, callbackArgs) {
    var selector = container ? container : '.page-body';
    var urlQuery = url ? url : window.location.href;
    self.query(url, container, callback, context, callbackArgs, context);
    self.applyDefaulCallback(context, new CrmUrl());
};
ProjectAjax.prototype.popstateHandler = function () {
    setTimeout(function () {
        self.reloadPage();
    }, 500);
};
ProjectAjax.prototype.setSettings = function () {
    // settings
    $.ajaxSetup({
        statusCode: {
            301: function (xhr) {
                self.forceRefresh();
            },
            302: function (xhr) {
                self.forceRefresh();
            }
        },
        timeout: 5000,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
        async: true,
        beforeSend: function (e) {
            self.showLoader();
        },
        complete: function (data) {
            // var processGlueLead = new GlueLead().init().listenSubmit();
            self.hideLoader();
        },
        error: function () {
            self.hideLoader();
        }
    });
}
