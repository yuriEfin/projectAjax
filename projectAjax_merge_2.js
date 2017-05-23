/**
 * Created by gambit on 05.04.17.
 */
ProjectAjax = function (context, isPushHistory, isShowLoader, typeQuery, dataQuery, dataType) {
    var self = this;
    // private
    var clickedUrl = window.location.href;
    // public
    this.isShowLoader = typeof isShowLoader !== "undefined" ? isShowLoader : true;
    this.pageBreadcrumbsContainer = '.page-breadcrumbs';
    this.isRenderContent = true;
    this.typeQuery = typeQuery ? typeQuery : 'GET';
    this.dataType = dataType ? dataType : undefined;
    this.statusCodeSettings = {
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
            if (pathname === '/notify/read' && pathname === 'crmTask/done'
                && pathname === 'crmTask/create') {
                self.forceRefresh();
            }
        }
    };
    /**
     * post data Query
     * @type {}
     */
    this.dataQuery = dataQuery ? dataQuery : {};

    console.log(dataQuery, 'dataQuery');
    // context call
    this.context = context ? context : this;

    this.pushHistory = isPushHistory !== undefined ? isPushHistory : true;

    /**
     * перезагрузка содержимого страницы после клика по кнопке "назад"
     */
    this.popstateHandler = function () {
        setTimeout(function () {
            self.reloadPage();
        }, 250);
    };

    this.init = function () {
        var self = this;
        window.removeEventListener("popstate", self.popstateHandler);
        window.addEventListener("popstate",
            self.popstateHandler
        );
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
    var self = this;
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
ProjectAjax.prototype.commonPluginSuccessAjax = function (jqXHR, target, data) {
    var self = this;
    if (typeof GCrm !== 'undefined') {
        GCrm.init();
    }
    $('.editable').on('save', function (e, params) {
        params.newValue = self.helper.strip_tags(params.newValue);
        self.reloadPage();
        if (YII_DEBUG) {
            console.log('Event ');
        }
    });
    // инициализация editable - редактирование
    $('.editable').editable({
        sourceCache: false,
        ajaxOptions: {
            cache: false,
            type: 'POST'
        },
        'emptytext': 'Не задано'
    });
    var config = {
        height: "95%",
        preloading: true,
        slideshow: false,
        href: $(this).attr('href')
    };
    $('.show-lead').colorbox(config);
    $('.show-lead').hover(function (e) {
        $(e.currentTarget).colorbox(config);
    });

    $('.contact-left-col').removeClass('blur');
    $('.contact-right-col').removeClass('blur');
    $('body').removeClass('blur');

    console.log('aplly plugins js default to dynamic content', 'commonPluginSuccessAjax');
}

/**
 * update breadcrumbs
 */
ProjectAjax.prototype.renderBreadcrumbs = function (urlQuery) {
    var self = this;
    if (urlQuery) {
        clickedUrl = urlQuery;
    }

    if (typeof(clickedUrl) !== "undefined")
        $.get('/site/breadcrumbs?url=' + clickedUrl, function (data) {
            if (data) {
                $('.page-breadcrumbs').html(data);
            }
        });
};

ProjectAjax.prototype.queryGet = function (url, container, isPushHistory) {
    var self = this;

    self.setSettings();
    self.typeQuery = 'GET';
    self.pushHistory = isPushHistory | false;
    var selector = container ? container : '.page-body';
    var urlQuery = url ? url : window.location.href;
    self.query(urlQuery, container);
    self.pushHistory = true;
}
ProjectAjax.prototype.queryPost = function (url, container, isPushHistory) {
    var self = this;

    self.setSettings();
    self.typeQuery = 'POST';
    self.pushHistory = isPushHistory | false;
    var selector = container ? container : '.page-body';
    var urlQuery = url ? url : window.location.href;
    self.query(urlQuery, container);
    self.pushHistory = true;
}
// ProjectAjax.prototype.setTokenData = function (dataQuery) {
//     var tokenName = $('body').data('csrfname'),
//         tokenValue = $('body').data('csrfvalue');
//     alert(self.dataQuery + ' self.dataQuery')
//     return dataQuery + '&' + tokenName + "=" + tokenValue;
// };
ProjectAjax.prototype.query = function (url, container, callback, context, callbackArgs, target) {
    var self = this;

    self.setSettings();
    if (!context) {
        context = window;
    }

    var selector = container ? container : '.page-body';
    var urlQuery = url ? url : window.location.href;
    var urlObject = new CrmUrl(urlQuery);

    clickedUrl = urlQuery;
    if (self.pushHistory) {
        self.setHistory(url);
    }

    if (processAjaxUrl === undefined && false === processAjax) {
        $.ajax({
            url: urlQuery,
            type: self.typeQuery,
            data: self.dataQuery,
            dataType: self.dataType,
            statusCode: self.statusCodeSettings,
            beforeSend: function (xhr) {
                processAjax = true;
                processAjaxUrl = urlQuery;
            },
            success: function (data, textStatus, jqXHR) {
                // self.controlRedirect(jqXHR);
                if (self.isRenderContent === true) {
                    $(selector).html('');
                    $(selector).html(data);

                    setTimeout(function () {
                        $("body").tooltip({
                            selector: '[data-toggle="tooltip"]'
                        });
                        $('[data-toggle="tooltip"]').tooltip();
                        $('[data-toggle="tooltip"]').each(function (el) {
                            $(this).tooltip();
                        });

                        $('body').on('click', function (e) {
                            $('[data-toggle="tooltip"]').each(function (el) {
                                $(this).tooltip();
                            });
                        });
                        $('.mail-header .header-buttons a').tooltip();
                    }, 1000);
                } else {
                    if (typeof data.success !== "undefined" && typeof data.message !== "undefined") {
                        // self.helper.dialog(data.message, 1500, 'success');
                    } else if (typeof data.errors !== "undefined" && typeof data.errors !== "undefined") {
                        // self.helper.dialog(data.errors, 1500, 'danger');
                    }
                }

                setTimeout(function () {
                    if ($.cookie('planning-container-scroll')) {
                        if (!$('#planning-container').scrollLeft) {
                            $('#planning-container').scrollLeft = 0;
                        }
                        $('#planning-container').animate({scrollLeft: parseInt($.cookie('planning-container-scroll'))}, 750);

                        if ($.cookie('planning-container-scroll-rows')) {
                            if (!$('#planning-container').scrollTop) {
                                $('#planning-container').scrollTop = 0;
                            }
                            $('#planning-container').animate({scrollTop: parseInt($.cookie('planning-container-scroll-rows'))}, 750);
                        }
                    }
                }, 750);

                $(document).on('click', '.input-search', function () {
                    $(this).addClass('active');
                }, function () {
                    $(this).removeClass('active');
                });

                // new CrmSortable().init();
                // apply common plugin js
                self.commonPluginSuccessAjax(jqXHR, target, data);
                self.applyCallback(data, jqXHR, callback, callbackArgs, context, urlObject, target);
                self.applyDefaulCallback(context, data, textStatus, jqXHR, urlObject, target);
            },
            complete: function (jqXHR, textStatus) {
                self.renderBreadcrumbs(processAjaxUrl);

                processAjax = false;
                processAjaxUrl = undefined;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (YII_DEBUG) {
                    console.log(jqXHR.getAllResponseHeaders(), 'error:getAllResponseHeaders()');
                }
                processAjax = false;
                if (!YII_DEBUG) {
                    // self.forceRefresh()
                }
                console.log(textStatus, 'errror textstatus');

            }
        }).done(function (data, textStatus, xhr) {
            self.renderBreadcrumbs(clickedUrl);
            self.controlRedirect(xhr)
            self.isRenderContent = true;
            self.pushHistory = true;
            self.typeQuery = 'GET';
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
    var self = this;
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
 * Применение методов по умолчанию после отработки ajax запроса
 * @param context - this OR called class
 * @param data - response data
 * @param textStatus
 * @param jqXHR
 * @param CrmUrl urlObject - object
 * @param target
 */
ProjectAjax.prototype.applyDefaulCallback = function (context, data, textStatus, jqXHR, urlObject, target) {
    var self = this;
    console.log(context, 'context');
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
    var self = this;
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
    var self = this;
    if (callback) {
        if (!Array.isArray(callback)) {
            callback.call(context, callbackArgs);
        } else {
            var i = 0;
            for (i; i <= callback.length; i++) {
                var f = callback[i];
                if (f) {
                    f(context, callbackArgs);
                }
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
    var self = this;
    if (YII_DEBUG) {
        console.log('start reloadPage', url);
    }
    var selector = container ? container : '.page-body';
    var urlQuery = url ? url : window.location.href;
    self.queryGet(url, container);
    GCrm.init();
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
ProjectAjax.prototype.helper = new Helper();

ProjectAjax.prototype.setSettings = function () {
    var self = this;
    // settings
    $.ajaxSetup({
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
