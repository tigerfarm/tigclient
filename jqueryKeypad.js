/*
 * jQuery.NumPad
 *
 * Copyright (c) 2015 Andrej Kabachnik
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 * https://github.com/kabachello/jQuery.NumPad
 *
 * Version: 1.0
 *
    From:
        https://www.jqueryscript.net/other/Mobile-friendly-Numeric-Keypad-Plugin-For-jQuery-NumPad.html

 */
(function ($) {
    $.fn.numpad = function (options) {

        options = $.extend({}, $.fn.numpad.defaults, options);
        var id = 'nmpd' + $('.nmpd-wrapper').length + 1;


        return this.each(function () {
            $(this).attr("readonly", true);
            $(this).bind(options.openOnEvent, function () {
                nmpd.open(options.target ? options.target : $(this));
            });

            if ($('#' + id).length == 0) {
                var nmpd = $('<div id="' + id + '"></div>').addClass('nmpd-wrapper');
                var table = $(options.gridTpl).addClass('nmpd-grid');
                var display = $(options.displayTpl).addClass('nmpd-display').attr('id', 'nmpd-display');
                nmpd.display = display;
                nmpd.grid = table;
                table.append(
                        $(options.rowTpl)
                        .append($(options.cellTpl).append($(options.buttonFunctionTpl).html(1).click(function () {sendDigits("1");})))
                        .append($(options.cellTpl).append($(options.buttonFunctionTpl).html(2).click(function () {sendDigits("2");})))
                        .append($(options.cellTpl).append($(options.buttonFunctionTpl).html(3).click(function () {sendDigits("3");})))
                        .append($(options.cellTpl).append($(options.buttonFunctionTpl).html(options.textDone).addClass('done').click(function () {
                            nmpd.close(false);
                        })))
                        ).append(
                        $(options.rowTpl)
                        .append($(options.cellTpl).append($(options.buttonFunctionTpl).html(4).click(function () {sendDigits("4");})))
                        .append($(options.cellTpl).append($(options.buttonFunctionTpl).html(5).click(function () {sendDigits("5");})))
                        .append($(options.cellTpl).append($(options.buttonFunctionTpl).html(6).click(function () {sendDigits("6");})))
                        ).append(
                        $(options.rowTpl)
                        .append($(options.cellTpl).append($(options.buttonFunctionTpl).html(7).click(function () {sendDigits("7");})))
                        .append($(options.cellTpl).append($(options.buttonFunctionTpl).html(8).click(function () {sendDigits("8");})))
                        .append($(options.cellTpl).append($(options.buttonFunctionTpl).html(9).click(function () {sendDigits("9");})))

                        ).append(
                        $(options.rowTpl)
                        .append($(options.cellTpl).append($(options.buttonFunctionTpl).html("*").click(function () {sendDigits("*");})))
                        .append($(options.cellTpl).append($(options.buttonFunctionTpl).html(0).click(function () {sendDigits("0");})))
                        .append($(options.cellTpl).append($(options.buttonFunctionTpl).html("#").click(function () {sendDigits("#");})))
                        );
                
                nmpd.append($(options.backgroundTpl).addClass('nmpd-overlay').attr('id', 'nmpd-overlay').click(function () {
                    nmpd.close(false);
                }));
                nmpd.append(table);
                if (options.onKeypadCreate) {
                    nmpd.on('numpad.create', options.onKeypadCreate);
                }
                (options.appendKeypadTo ? options.appendKeypadTo : $(document.body)).append(nmpd);

                $('#' + id + ' .numero').bind('click', function () {
                    if ($('#' + id + ' .dirty').val() == '0') {
                        display.val($(this).text());
                        $('#' + id + ' .dirty').val(1);
                    } else {
                        display.val(display.val() + $(this).text());
                    }
                });

                nmpd.trigger('numpad.create');
            } else {
                nmpd = $('#' + id);
                nmpd.display = $('#' + id + ' input.nmpd-display');
            }

            nmpd.close = function (target) {
                if (target) {
                    if (target.prop("tagName") == 'INPUT') {
                        target.val(nmpd.display.val());
                    } else {
                        target.html(nmpd.display.val());
                    }
                }
                nmpd.hide('fast');
                return nmpd;
            };

            nmpd.open = function (target, initialValue) {
                if (initialValue) {
                    nmpd.display.val(initialValue);
                } else {
                    if (target.prop("tagName") == 'INPUT') {
                        nmpd.display.val(target.val());
                    } else {
                        nmpd.display.val(parseFloat(target.text()));
                    }
                }
                $('#' + id + ' .dirty').val(0);
                nmpd.show('fast');
                position(nmpd.grid, options.position, options.positionX, options.positionY);
                $('#' + id + ' .done').one('click', function () {
                    nmpd.close(target);
                });
                return nmpd;
            };
        });
    };

    function position(element, mode, posX, posY) {
        var x = 0;
        var y = 0;
        if (mode == 'fixed') {
            element.css('position', 'fixed');

            if (posX == 'left') {
                x = 0;
            } else if (posX == 'right') {
                x = $(window).width() - element.outerWidth();
            } else if (posX == 'center') {
                x = ($(window).width() / 2) - (element.outerWidth() / 2);
            } else if ($.type(posX) == 'number') {
                x = posX;
            }
            element.css('left', x);

            if (posY == 'top') {
                y = 0;
            } else if (posY == 'bottom') {
                y = $(window).height() - element.outerHeight();
            } else if (posY == 'middle') {
                y = ($(window).height() / 2) - (element.outerHeight() / 2);
            } else if ($.type(posY) == 'number') {
                y = posY;
            }
            element.css('top', y);
        }
        return element;
    }

    $.fn.numpad.defaults = {
        target: false,
        openOnEvent: 'click',
        backgroundTpl: '<div></div>',
        gridTpl: '<table></table>',
        displayTpl: '<input type="number" />',
        displayCellTpl: '<td colspan="4"></td>',
        rowTpl: '<tr></tr>',
        cellTpl: '<td></td>',
        buttonNumberTpl: '<button></button>',
        buttonFunctionTpl: '<button></button>',
        gridTableClass: '',
        textDone: 'Done',
        textDelete: 'Del',
        textClear: 'Clear',
        textCancel: 'Cancel',
        appendKeypadTo: false,
        position: 'fixed',
        positionX: 'center',
        positionY: 'middle',
        onKeypadCreate: false
    };
})(jQuery);