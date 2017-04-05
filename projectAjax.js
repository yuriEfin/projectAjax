/**
 * Created by gambit on 05.04.17.
 */
ProjectAjax = function () {
    var self = this;

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
ProjectAjax.prototype.query = function (url, container, callback, context, callbackArgs) {
    if (!context) {
        context = window;
    }
    var self = this;
    var selector = container ? container : '.page-content';

    var urlQuery = url ? url : window.location.href;

    $.ajax({
        url: urlQuery,
        type: 'GET',
        beforeSend: function (xhr) {

        },
        success: function (data, textStatus, jqXHR) {
            var redirect;
            if (redirect = jqXHR.getResponseHeader('AJAX-REDIRECT-URL')) {
                var selector = jqXHR.getResponseHeader('AJAX-CONTAINER');
                selector = selector ? selector : container;
                self.query(redirect, selector);
            } else {
                $(selector).html('');
                $(selector).html(data);
            }
            self.applyCallback('success', data, jqXHR, callback, callbackArgs, context);
        },
        complete: function (jqXHR, textStatus) {

        },
        error: function (jqXHR, textStatus, errorThrown) {
            self.forceRefresh();
        }
    });
};

/**
 * Аварийная принудительная перезагрузка текущей страницы
 */
ProjectAjax.prototype.forceRefresh = function () {
    window.location.reload();
};

/**
 * Run callback after get response ajax query
 * @param mixed data
 * @param XMLHttpRequest object jqXHR
 * @param object OR array callback
 * @param array callbackArgs
 */
ProjectAjax.prototype.applyCallback = function (data, jqXHR, callback, callbackArgs, context) {
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

ProjectAjax.prototype.reloadPage = function (url, container, callback, context, callbackArgs, context) {
    var self = this;
    var selector = container ? container : '.page-content';

    var urlQuery = url ? url : window.location.href;
    self.query(url, container, callback, context, callbackArgs, context);
};
ProjectAjax.prototype.setSettings = function () {
    var self = this;
    // settings
    $.ajaxSetup({
        timeout: 5000,
        // headers: {
        //     'X-Requested-With': 'XMLHttpRequest',
        // },
        beforeSend: function (e) {
            self.showLoader();
        },
        complete: function (data) {
            var processGlueLead = new GlueLead().init().listenSubmit();
            self.hideLoader();
            try {
                $('[data-toggle="tooltip"]').tooltip();

                $('.editable').editable({
                    sourceCache: true,
                    ajaxOptions: {
                        cache: false,
                        type: 'POST'
                    },
                    'emptytext': 'Не задано'
                });

                $(document).off('click', '#chat-link');
                $(document).on('click', '#chat-link', function () {
                    $('#chatbar').toggleClass('open');
                });

                $('.fancy').fancybox();
                $('input.phone').mask("+9 (999) 999-99-99");
                $('textarea').autosize({append: "\n"});

                setEventHandlers();
            } catch (ex) {
                if (YII_DEBUG) {
                    console.log(ex, 'ex');
                }
            }
        },
        error: function () {
            self.hideLoader();
        }
    });

    $(document).ajaxComplete(function (data) {
        $('.editable').editable({
            sourceCache: true,
            form: 'plain', //form style: 'bootstrap', 'jqueryui', 'plain'
            ajaxOptions: {
                cache: false,
                type: 'POST'
            },
            'emptytext': 'Не задано'
        });
        $('.editable').on('save', function (e, params) {
            self.reloadPage();
            console.log('Event ');
        });
    });
}
