# projectAjax
ajax jquery wrapper

``` javascript
$(document).on('click', 'a.no-ajax', function (e) {
            e.preventDefault();
});
```
``` javascript
excludePjaxArrayElem = ['class1','class2','class3'];
```
``` javascript
$(document).off('click', 'a:not(.no-ajax)');
```
``` javascript
$(document).on('click', 'a:not(.no-ajax)', function (e) {
            if (e.isDefaultPrevented()) {
                console.log('Событие уже обрабатывается другим обработчиком');
                return;
            }
            if (self.hasClassPrevented(e.currentTarget)) {
                console.log('Совпадение по названию класса');
                return;
            }
            e.preventDefault();
            e.stopPropagation();

            console.log(e.currentTarget, 'e.currentTarget Ajax query handler starts');

            if ($(e.currentTarget).attr('type') == 'button') {
                return;
            }
            if ($(e.currentTarget).attr('href') === undefined) {
                return;
            }
            if (self.helper.stripos($(e.currentTarget).attr('href'), '/rights') !== false) {
                self.ajax.forceRefresh($(e.currentTarget).attr('href'));
                return;
            }
            var i = 0,
                j = 0,
                flagNoQuery = false,
                strClass;

            if (strClass = $(this).attr('class')) {
                var arrClass = strClass.split(' ');
                for (j; j <= arrClass.length; j++) {
                    if (self.helper.in_array(arrClass[i], self.excludePjaxArrayElem) !== false) {
                        flagNoQuery = true;
                        break;
                    }
                }
            }
            // если не совпало
            if (false === flagNoQuery) {
                var url;
                if (url = self.getUrl(e.currentTarget)) {
                    // url, container, callback, context, callbackArgs
                    self.ajax.query(url, null, null, self, [], $(e.currentTarget));
                }
            }
            return false;
});
```
