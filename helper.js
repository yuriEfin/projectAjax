/**
 *  Helper JS method
 */
var Helper = function (context) {
    self = this;
    this.context = context;
}
/**
 * Object cloning (don't work with functions) TODO: throw error if circular links
 * @param obj
 * @param useJSON
 * @return {*}
 */
Helper.prototype.cloneObject = function (obj, useJSON) { // don't work with functions as properties
    if (useJSON) {
        return JSON.parse(JSON.stringify(obj));
    } else {
        var c = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (typeof obj[i] == 'object') {
                    c[i] = cloneObject(obj[i], false);
                } else {
                    c[i] = obj[i];
                }
            }
        }
        return c;
    }
};

// Strip HTML and PHP tags from a string
Helper.prototype.strip_tags = function (str) {
    return str.replace(/<(.*)?>/g, '');
};


Helper.prototype.bootbox = function (title, message) {
    bootbox.alert({
        title: title,
        message: message,
        backdrop: true
    });
}

Helper.prototype.formatDate = function (date) {

    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    var yy = date.getFullYear() % 100;
    if (yy < 10) yy = '0' + yy;

    return dd + '.' + mm + '.' + yy;
}
/**
 * html attributes:
 * 'pk'
 * 'name'
 * 'value'
 * @param event
 * @param callback
 */
Helper.prototype.updateBySelect = function (event, callback) {
    var selfEvent = $(event.currentTarget);
    var self = this;
    $.ajax({
        url: selfEvent.data('url'),
        type: 'POST',
        dataType: 'JSON',
        data: {
            'pk': $(selfEvent).data('pk') || $(this).data('id'),
            'name': $(selfEvent).data('name'),
            'value': typeof $(selfEvent).data('value') !== 'undefined' ? $(selfEvent).data('value') : $(selfEvent).val(),
        },
        success: function (data) {
            if (typeof  callback.success !== "undefined") {
                callback.success(data);
            }
        },
        complete: typeof  callback.complete !== "undefined" ? callback.complete() : function () {
            if (typeof  callback.complete !== "undefined") {
                callback.complete();
            }
        },
        error: typeof  callback.error !== "undefined" ? callback.error(err) : function (err) {
            if (typeof  callback.error !== "undefined") {
                callback.error();
            }
        },
    });
}

/**
 * TODO: проверка на выходные дни
 * var day = yourDateObject.getDay();
 * var isWeekend = (day == 6) || (day == 0);
 */
Helper.prototype.bootboxDateTime = function (options, callbackButton) {
    var self = this;
    var config = {
        // 'useSeconds': false,
        'mask': false,
        'lang': 'ru',
        'format': 'Y-m-d H:i',
        // 'stepMinute': 0,
        // 'timepicker': true,
        // 'datepicker': true,
        // 'defaultSelect': true,
        'allowTimes': [
            // '00:00', '00:30', '01:00', '01:30', '02:00', '02:30',
            // '03:00', '03:30', '04:00', '04:30', '05:00', '05:30',
            '06:00', '06:30',
            '15:00', '15:30',
            '07:00', '07:30',
            '16:00', '16:30',
            '08:00', '08:30',
            '17:00', '17:30',
            '09:00', '09:30',
            '18:00', '18:30',
            '10:00', '10:30',
            '19:00', '19:30',
            '11:00', '11:30',
            '20:00', '20:30',
            '12:00', '12:30',
            '21:00', '21:30',
            '13:00', '13:30',
            '22:00', '22:30',
            '14:00', '14:30',
            '23:00', '23:30'
        ],
        onShow: function (e, b) {
            $('.datetimepicker').removeClass('active');
            $(b).addClass('active');
        }
    };
    $.extend(config, options);
    var callbacks = $.extend({
        success: function (e) {
            console.log(e, 'e success');
        },
        close: function (e) {
            console.log(e, 'e close');
        },
    }, callbackButton);
    bootbox.dialog({
        size: 'small',
        closeButton: false,
        title: options.title || 'Дата / время дела',
        message: '<input id="bootbox-datetime" name="name" type="text" placeholder="Дата и время" class="form-control input-md datetimepicker"> ',
        buttons: {
            success: {
                label: "Сохранить",
                className: "btn-success",
                callback: function (e) {
                    callbacks.success($('#bootbox-datetime').val());
                }
            },
            close: {
                label: 'Отмена',
                className: "closed-datetimepicker",
                callback: function (e) {
                    callbacks.success($('#bootbox-datetime').val());
                }
            }
        }
    });
    console.log(config, 'config datetimepicker bootbox');
    $('#bootbox-datetime').datetimepicker(config);
    $('#bootbox-datetime').click(function () {
        $('#bootbox-datetime').datetimepicker('show'); //support hide,show and destroy command
    });

    setTimeout(function () {
        $('#bootbox-datetime').trigger('click');
    }, 300);
}

Helper.prototype.isArray = function (obj) {
    /**
     * проверка на массив
     * @type boolean
     */
    if (Array.isArray) {
        return Array.isArray(obj);
    } else {
        return Object.prototype.toString.call(obj) == '[object Array]';
    }
}

// original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
Helper.prototype.in_array = function in_array(needle, haystack, strict) {	// Checks if a value exists in an array
    var found = false, key, strict = !!strict;

    for (key in haystack) {
        if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
            found = true;
            break;
        }
    }

    return found;
}
Helper.prototype.stripos = function (f_haystack, f_needle, f_offset) {	// Find position of first occurrence of a case-insensitive string
    //
    // +	 original by: Martijn Wieringa

    var haystack = f_haystack.toLowerCase();
    var needle = f_needle.toLowerCase();
    var index = 0;

    if (f_offset == undefined) {
        f_offset = 0;
    }

    if ((index = haystack.indexOf(needle, f_offset)) > -1) {
        return index;
    }

    return false;
};

Helper.prototype.search = function (elemListener, baseUrl, elemRenderContent, paramsUrl) {
    var param = typeof paramsUrl !== "undefined" ? paramsUrl : '';
    $(document).off('keyup change', elemListener);
    $(document).on('keyup change', elemListener, function (e) {
        console.log(e, 'e keyup ' + elemListener);
        var query = $(e.target).val();
        var isProcess = false;
        var highlightData = '';
        if (!isProcess) {
            $.ajax({
                'url': '/' + baseUrl + '/showList?' + param,
                'data': {'id': $(e.target).data('lead'), 'query': query},
                'success': function (data) {
                    if (data != 0) {
                        try {
                            highlightData = highlight(
                                data, // текст для поиска
                                [query], // слова для обрамления
                                'span' // тег обрамления
                            );
                        } catch (Err) {
                        }

                        $(elemRenderContent).html(parseInt($(e.target).val()) > 0 ? data : highlightData);
                    } else {
                        $(elemRenderContent).css('filter', 'blur(3px)');
                        dialog('Нет результатов', 500, 'danger');
                        setTimeout(function () {
                            $(elemRenderContent).css('filter', 'blur(0)');
                        }, 500);
                        var config = {
                            height: "95%",
                            preloading: true,
                            slideshow: false,
                            href: $(this).attr('href')
                        };
                        $('.show-lead').colorbox(config);
                        $('.show-lead').click(function (e) {
                            $(this).colorbox(config);
                        });
                        $('a[rel="gallery"]').colorbox(config);
                        $('a[rel="gallery"]').click(function (e) {
                            $(this).colorbox(config);
                        });
                    }

                },
                complete: function () {
                    isProcess = false;
                    var config = {
                        height: "95%",
                        preloading: true,
                        slideshow: false,
                        href: $(this).attr('href')
                    };
                    $('.wrap-items-lead .show-lead').colorbox(config);
                    $('.wrap-items-lead .show-lead').click(function (e) {
                        $(this).colorbox(config);
                    });
                    $('a[rel="gallery"]').colorbox(config);
                    $('a[rel="gallery"]').click(function (e) {
                        $(this).colorbox(config);
                    });
                }
            });
        }
    });
}

var tpl = '<div class="modal-dialog js-modal-dialod" style="display:none;"><div class="modal-content">' +
    '<div class="modal-body">' +
    '<button onclick="$(this).parents(\'.js-modal-dialod\').fadeOut()" type="button" class="bootbox-close-button close" data-dismiss="modal" aria-hidden="true" style="margin-top: -10px;">×</button>' +
    '<span class="js-text-flash w100"></span>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button onclick="$(this).parents(\'.js-modal-dialod\').fadeOut()" data-bb-handler="cancel" type="button" class="btn btn-default">Cancel' +
    '</button>' +
    '</div>' +
    '</div>' +
    '</div>';

Helper.prototype.dialog = function (message, delay, type) {
    delay = delay ? delay : 1500;
    var className = 'alert alert-' + type;

    if (!$('.js-text-flash').length == 0) {
        $('.js-text-flash').addClass(className).html(message);
        $('.js-modal-dialod').css({
            'opacity': 0.85,
            'display': 'block',
            'position': 'fixed',
            'top': '5%',
            'left': '55%',
            'z-index': 9999
        });
    } else {
        $('.mail-container').append(tpl);
        $('.js-text-flash').addClass(className).html(message);
        $('.js-modal-dialod').css({
            'opacity': 0.85,
            'display': 'block',
            'position': 'fixed',
            'top': '5%',
            'left': '55%',
            'z-index': 9999
        });
    }

    setTimeout(function () {
        $('.js-modal-dialod').animate({'opacity': 0, 'z-index': 1})
    }, delay, function () {
        $('.js-modal-dialod').css({'opacity': 0.65, 'display': 'none', 'z-index': 1})
    });
};
Helper.prototype.bootbox = function (title, message, cssClass) {
    var type = cssClass || 'info';
    $('.bootbox .modal-header').addClass(type);
    bootbox.alert({
        modal: false,
        title: title,
        message: message
    });
}
/**
 * Ограничение на количество кликов по временному интервалу
 * @param fn
 * @param timer
 * @returns {Function}
 */
Helper.prototype.limitExecByInterval = function (fn, timer) {
    var lock, execOnUnlock, args,
        time = timer ? timer : 1500;
    return function () {
        args = arguments;
        if (!lock) {
            lock = true;
            var scope = this;
            setTimeout(function () {
                lock = false;
                if (execOnUnlock) {
                    args.callee.apply(scope, args);
                    execOnUnlock = false;
                }
            }, time);
            return fn.apply(this, args);
        } else execOnUnlock = true;
    }
}
/**
 * @param string url
 * @param object config { method: "GET" | "POST" | "PUT" | "DELETE", dataType: "JSON" | "JSONP" | ...}
 * @param object data
 * @param object callback {success: function(){} | Crm.successHandler(data), error: function(){} | Crm.errorHandler}
 */
Helper.prototype.submitFormAction = function (form, context, afterSave) {
    var self = this;
    $(form).find('[type="submit"]').attr('disabled', 'disabled');
    $.ajax({
        url: $(form).attr('action'),
        type: 'POST',
        dataType: 'JSON',
        data: $(form).serializeArray(),
        success: function (data, textStatus, xhr) {
            if (YII_DEBUG) {
                console.log(data, 'submitFormAction success');
            }
            if (typeof data.errors !== "undefined") {
                self.bootbox('Ошибка сохранения', data.message);
            } else if (typeof data.success !== "undefined") {
                if (typeof afterSave !== "undefined" && typeof afterSave.success !== "undefined") {
                    afterSave.success(data, textStatus, xhr);
                } else {
                    console.log('Successfule submit form');
                }
            }
        },
        complete: function () {
            $(form).find('[type="submit"]').removeAttr('disabled');
        }
    });
}

/**
 * currentFolder
 * @param {type} name
 * @returns {MailCrm.getFolder.keys|keys|Boolean}
 */
Helper.prototype.getParam = function (name, defaultValue, delim) {
    var search = window.location.href,
        keys = {},
        delim = delim ? delim : '/';
    if (name === 'appRoute') {
        item = search.split(delim, 3);
        keys['appRoute'] = item[0] + '/' + item[1];
    } else {
        item = search.split(delim);
    }

    for (var i = 0; i <= item.length; i++) {
        switch (delim) {
            case '/':
                if (name == 'controller') {
                    keys[item[i]] = item[i];
                } else {
                    if (item[i] !== undefined) {
                        keys[item[i]] = item[++i];
                    }
                }
                break;
            case '&':
                var url = new CrmUrl(search),
                    queryParams = url.query();
                console.log(url, 'url getParam HELPER');
                if (Array.isArray(queryParams)) {
                    for (var x = 0; x <= queryParams.length; x++) {
                        if (typeof queryParams[x] !== "undefined" && typeof queryParams[x][0] !== "undefined" && typeof queryParams[x][1] !== "undefined") {
                            keys[queryParams[x][0]] = queryParams[x][1];
                        } else {
                            if (typeof queryParams[x] !== 'undefined' && typeof queryParams[x][0] !== 'undefined') {
                                keys[queryParams[x][0]] = false;
                            }
                        }
                    }
                }
                break;
        }
    }

    var value = keys[name] !== undefined ? keys[name] : defaultValue;

    return decodeURI(value);
}