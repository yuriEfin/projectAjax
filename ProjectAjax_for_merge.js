/**
 * Created by gambit on 05.04.17.
 */
ProjectAjax = function (context, isPushHistory, isShowLoader, typeQuery, dataQuery, dataType) {
    self = this;
    this.isShowLoader = typeof isShowLoader !== "undefined" ? isShowLoader : true;
    this.pageBreadcrumbsContainer = '.page-breadcrumbs';
    this.clickedUrl;
    this.typeQuery = typeQuery ? typeQuery : 'GET';
    this.dataType = dataType ? dataType : undefined;
    /**
     * post data Query
     * @type {}
     */
    this.dataQuery = dataQuery ? dataQuery : {};
    // context call
    this.context = context ? context : this;

    this.pushHistory = isPushHistory !== undefined ? isPushHistory : true;

    this.setEventHandler = function () {
        $(document).on('dblclick', '[data-dblclick]', function () {
            if ($(this).attr('data-dblclick')) {
                self.reloadPage($(this).attr('data-dblclick'));
            }
        });
    };
}
// уникальные значения в истории
if (typeof set === "undefined") {
    var set = new Set();
}
/**
 * Set history url
 * @param string url
 * @param string container
 * @param object callback
 * @param object context
 * @param array callbackArgs
 */
ProjectAjax.prototype.setHistory = function (url) {
    if (typeof set === "undefined") {
        set = new Set();
    }
    if (!set.has({url: url})) {
        history.pushState({}, '', url);
    }
    set.add({url: url});
    // set.forEach( user => alert(user.url));
};

var processAjax = false,
    processAjaxUrl = undefined;

/**
 * Применение плагинов к динамическому контенту
 * вызывается после получения response data
 * @param jqXHR
 * @param target
 */
ProjectAjax.prototype.commonPluginSuccessAjax = function (jqXHR, target) {

    if (typeof GCrm == "undefined") {
        GCrm = new CrmClient();
    }
    GCrm.setAjaxEvt();
    GCrm.setEventHandler();

    $('.contact-left-col').removeClass('blur');
    $('.contact-right-col').removeClass('blur');
    $('body').removeClass('blur');

    console.log('aplly plugins js default to dynamic content', 'commonPluginSuccessAjax');
}

/**
 * update breadcrumbs
 */
ProjectAjax.prototype.renderBreadcrumbs = function (urlQuery) {
    if (urlQuery) {
        self.clickedUrl = urlQuery;
    }
    $.ajax({
        url: '/site/breadcrumbs?url=' + self.clickedUrl,
        dataType: 'JSON',
        async: true,
        success: function (data) {
            if (data.success) {
                $('.page-breadcrumbs').html('');
                $('.page-breadcrumbs').html(data.success);
            }
            console.log(data, 'data breadcrumbs');
        }
    });
};

ProjectAjax.prototype.query = function (url, container, callback, context, callbackArgs, target) {
    var self = this;
    if (!context) {
        context = window;
    }
    var selector = container ? container : '.page-body';
    var urlQuery = url ? url : window.location.href;
    var urlObject = new CrmUrl(urlQuery);
    self.clickedUrl = urlQuery;
    if (self.pushHistory) {
        self.setHistory(url);
        window.removeEventListener("popstate", self.popstateHandler);
        window.addEventListener("popstate", self.popstateHandler);
    }
    if (false === processAjax && processAjaxUrl === undefined) {
        $.ajax({
            url: urlQuery,
            type: self.typeQuery,
            data: self.dataQuery,
            dataType: self.dataType,
            statusCode: {
                301: function (jqXHR) {
                    console.log(jqXHR.getAllResponseHeaders(), '301:getAllResponseHeaders()');
                    self.forceRefresh();
                },
                302: function (jqXHR) {
                    alert('jqXHR.status = ' + jqXHR.status);
                    console.log(jqXHR.getAllResponseHeaders(), '302:getAllResponseHeaders()');
                    self.forceRefresh();
                },
                200: function () {
                    var pathname = window.location.pathname;
                }
            },
            beforeSend: function (xhr) {
                console.log(xhr.getAllResponseHeaders(), 'beforeSend::getAllResponseHeaders()');
                processAjax = true;
                processAjaxUrl = urlQuery;
                self.renderBreadcrumbs(urlQuery);
            },
            success: function (data, textStatus, jqXHR) {
                self.controlRedirect(jqXHR);

                $(selector).html('');
                $(selector).html(data);

                self.applyCallback(data, jqXHR, callback, callbackArgs, context, urlObject, target);
                self.applyDefaulCallback(context, data, textStatus, jqXHR, urlObject, target);
            },
            complete: function (jqXHR, textStatus) {
                // apply common plugin js
                self.commonPluginSuccessAjax(jqXHR, target);

                console.log(jqXHR.getAllResponseHeaders(), 'complete::getAllResponseHeaders()');
                var flash = $.parseJSON($.ajax({
                    url: '/site/getFlash',
                    async: false,
                    dataType: "JSON"
                }).responseText);

                $('body').tooltip({
                    selector: '[rel=tooltip]'
                });
                processAjax = false;
                processAjaxUrl = undefined;
                // self.applyDefaulCallback(context, '', textStatus, jqXHR, urlObject, target);
                self.initScrollPage();
                // notifications
                updateNotify();
                self.renderBreadcrumbs();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.getAllResponseHeaders(), 'error:getAllResponseHeaders()');

                processAjax = false;
                processAjaxUrl = undefined;
                self.forceRefresh();
            }
        }).done(function (data, textStatus, xhr) {
            console.log(xhr.getAllResponseHeaders(), 'done:getAllResponseHeaders()');
            self.controlRedirect(xhr)
        });
    } else {
        console.log('Наложение AJAX запросов, URL: ' + urlQuery);
    }

};
/**
 * Контроль заголовков ответа - xhr response Header
 * @param xhr
 */
ProjectAjax.prototype.controlRedirect = function (xhr) {
    // reload ajax
    if (xhr.getResponseHeader('Project-ajax-url')) {
        self.reloadPage(xhr.getResponseHeader('Project-ajax-url'));
    }
    // reload
    if (xhr.getResponseHeader('Project-force-ajax-url')) {
        self.forceRefresh(xhr.getResponseHeader('Project-force-ajax-url'));
    }
};
/**
 * Инициализация подгрузки контента при скролле
 */
ProjectAjax.prototype.initScrollPage = function () {
    if (YII_DEBUG) {
        console.log('initScrollPage', 'initScrollPage');
    }
    scrollPage = new ScrollLoadContent();
    if (Helper.prototype.in_array(window.location.pathname, scrollPage.initLocation.route)) {
        scrollPage.run();
    }
};
/**
 * Применение методов по умолчанию после отработки ajax запроса
 * @param context - this OR called class
 * @param data - response data
 * @param textStatus
 * @param jqXHR
 * @param CrmUrl urlObject - object
 * @param target
 */
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
ProjectAjax.prototype.forceRefresh = function (url, xhr) {
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

/**
 * Asynch reload page
 * @param url
 * @param container
 * @param callback
 * @param context
 * @param callbackArgs
 */
ProjectAjax.prototype.reloadPage = function (url, container, callback, context, callbackArgs) {
    var selector = container ? container : '.page-body';
    var urlQuery = url ? url : window.location.href;
    self.query(url, container, callback, context, callbackArgs, context);
    self.applyDefaulCallback(context, new CrmUrl());
    if (typeof GCrm == "undefined") {
        GCrm = new CrmClient();
    }
    GCrm.setAjaxEvt();
    GCrm.setEventHandler();
    console.log(GCrm, 'GCrm');
};

/**
 * перезагрузка содержимого страницы после клика по кнопке "назад"
 */
ProjectAjax.prototype.popstateHandler = function () {
    setTimeout(function () {
        self.reloadPage();
    }, 250);
};

ProjectAjax.prototype.showLoader = function () {
    NProgress.start();
};

ProjectAjax.prototype.hideLoader = function () {
    NProgress.done();
};
/**
 * Ajax settings
 */
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
