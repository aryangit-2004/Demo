/* Colio Wordpress Plugin # JS */

jQuery(document).ready(function($) {

    // Equalize height of item titles in portfolio grid for proper flow
    var equalize_titles = (function() {
        var titles = $('.colio-list .colio-summary h4'),
            max_height;
        return function() {
            max_height = 0;
            $.each(titles, function() {
                $(this).css('min-height', 0);
                if ($(this).height() > max_height) {
                    max_height = $(this).height();
                }
            }).css('min-height', max_height);
        }
    })();

    equalize_titles();
    $(window).resize(function() {
        equalize_titles();
    }).load(function() {
        equalize_titles();
    });

    // Fix problem with vertical centering of a button inside of ".colio-view" DIV	
    $(window).bind('resize orientationchange', function() {
        $('.colio-list > li:visible').each(function() {
            var img = $('.colio-thumb img', this);
            $('.colio-view', this).css('height', img.height());
        });
    });


    if ('colio_options' in window) {

        // loop every portfolio configuration
        for (var portfolio_id in window.colio_options) {

            // convert JSON options to JavaScript object
            var options = $.parseJSON(window.colio_options[portfolio_id]);

            // get ID of "colio-wrap" DIV
            var wrap = $('#colio_' + portfolio_id);

            // check if ".colio-wrap" DIV exist in document
            if (wrap.length == 0) {
                continue;
            }

            // closure with portfolio $wrap element and options
            (function(wrap, options) {

                var list = wrap.find('.colio-list'),
                    filters = wrap.find('.colio-filters');

                // COLIO JQUERY PLUGIN 

                $.extend(options, {
                    hiddenItems: ':hidden',
                    onExpand: function(container, content_id) {
                        filters.fadeTo(300, 0, function() {
                            $(this).css('visibility', 'hidden');
                        });
                        // set URL hash to the viewing item
                        var item_hash = list.find('.colio-active-item').attr('data-hash');
                        if (window.history && 'replaceState' in window.history) {
                            window.history.replaceState({}, document.title, item_hash);
                        } else {
                            window.location.hash = item_hash;
                        }
                    },
                    onCollapse: function() {
                        filters.css('visibility', 'visible').fadeTo(300, 1);
                        // remove hash part from URL
                        if (window.history && 'replaceState' in window.history) {
                            window.history.replaceState({}, document.title, '#');
                        } else {
                            window.location.hash = '';
                        }
                    },
                    onContent: function(content) {
                        window.setTimeout(function() {
                            external_plugins.call(content);
                            // load images in content and trigger reflow for viewport and adjust its height
                            $(content).imagesLoaded(function() {
                                $(window).trigger('orientationchange');
                            });
                        }, options.contentDelay + options.contentFadeIn);

                        /** 
                        	All 3rd-party plugins should be inside external_plugins() 
                        	function. Keyword "this" refers to the content in viewport 
                        	and should be used as context for selectors 
                        */

                        function external_plugins() {
                            // fancybox
                            if (typeof $.fn.fancybox === 'function') {
                                $('.fancybox', this).fancybox({
                                    helpers: {
                                        title: {
                                            type: 'inside'
                                        },
                                        buttons: {
                                            position: 'top'
                                        }
                                    }
                                });
                            }
                            // flexslider
                            if (typeof $.fn.flexslider === 'function') {
                                $('.flexslider', this).flexslider({
                                    animation: 'fade',
                                    easing: 'swing',
                                    animationSpeed: 300,
                                    slideshow: false,
                                    smoothHeight: true,
                                    after: function(slider) {
                                        $(window).trigger('orientationchange');
                                    }
                                });
                            }
                        } // external_plugins()

                    }
                });

                // init Colio
                list.colio(options);


                // PAGINATION

                var pagination = function(tag) {

                    // check if pagination is enabled in configuration
                    if (!options.pagination) {
                        return;
                    }

                    // remove existing pagination
                    wrap.find('.colio-pagination').remove();

                    // get items that match filter tag
                    var items = list.children(tag ? '[data-tags~="' + tag + '"]' : '*');

                    // check if we need pagination, otherwise return
                    if (items.length <= options.paginationNum) {
                        return;
                    }

                    // assign page number to every item via "data-page=" attribute
                    items.each(function(index) {
                        $(this).attr('data-page', Math.floor(index / options.paginationNum) + 1);
                    });

                    // add pagination
                    var pagination = $('<div class="colio-pagination"></div>').
                    append('<a class="colio-prev-page" href="#">Previous</a>').
                    append('<ul></ul>').
                    append('<a class="colio-next-page" href="#">Next</a>');

                    for (var page_num = 1; page_num <= Math.ceil(items.length / options.paginationNum); page_num++) {
                        pagination.find('ul').append('<li class="' + (page_num === 1 ? 'colio-page-active' : '') +
                            '"><a href="#">' + page_num + '</a></li>');
                    }

                    wrap.append(pagination);

                    // click handler to switch pages
                    pagination.on('click', 'ul a', function() {

                        // get page number
                        var page_num = parseInt($(this).text(), 10);

                        // set current page active
                        $(this).parent().addClass('colio-page-active').siblings().removeClass('colio-page-active');

                        // collapse Colio viewport
                        list.trigger('colio', 'collapse');

                        // filter items by page number
                        isotope_filter(tag, page_num);

                        // return to top
                        $('body, html').stop().delay(options.transitionDuration).
                        animate({
                            scrollTop: wrap.offset().top - options.scrollOffset
                        }, options.scrollDuration, options.scrollEasing);

                        return false;
                    });

                    // click handler for next/prev arrows
                    pagination.find('.colio-prev-page, .colio-next-page').click(function() {

                        // get active page
                        var active = pagination.find('li.colio-page-active');

                        if ($(this).hasClass('colio-next-page')) {
                            active.next().find('a').trigger('click');
                        } else {
                            active.prev().find('a').trigger('click');
                        }

                        return false;
                    });

                };


                // ISOTOPE FILTERING

                function isotope_filter(tag, page) {

                    // selector to filter items by #tag
                    var tag_filter = tag ? '[data-tags~="' + tag + '"]' : '*';

                    // set page to "1" if page argument is not set
                    if (!page && wrap.find('.colio-pagination').length) {
                        page = 1;
                    }

                    // if page is set, filter by tag and by page number
                    // otherwise only by tag
                    if (page > 0) {
                        list.isotope({
                            filter: function() {
                                return $(this).is(tag_filter) && $(this).is('[data-page="' + page + '"]');
                            }
                        });
                    } else {
                        list.isotope({
                            filter: tag_filter
                        });
                    }

                }

                // ISOTOPE PLUGIN

                var isotope_init = function() {

                    // isotope options
                    var isotope_options = {
                        layoutMode: options.layout,
                        transitionDuration: options.transitionDuration / 1000 + 's'
                    };

                    // check which grid transition effect to use
                    if (options.transitionEffect == 'fade') {
                        $.extend(isotope_options, {
                            hiddenStyle: {
                                opacity: 0
                            },
                            visibleStyle: {
                                opacity: 1
                            }
                        });
                    } else if (options.transitionEffect == 'rotate') {
                        $.extend(isotope_options, {
                            hiddenStyle: {
                                opacity: 0,
                                transform: "rotateY(90deg)"
                            },
                            visibleStyle: {
                                opacity: 1,
                                transform: "rotateY(0deg)"
                            }
                        });
                    }


                    // override Isotope default "_positionItem" function to
                    // disable position animation for items in grid and just
                    // snap them in place
                    if (!options.animatePosition) {
                        var _isotope_position_item = Isotope.prototype._positionItem;
                        Isotope.prototype._positionItem = function(item, x, y) {
                            _isotope_position_item(item, x, y, true);
                        }
                    }

                    list.isotope(isotope_options).on('arrangeComplete', function() {
                        list.trigger('colio', 'excludeHidden');
                    }).trigger('colio', 'excludeHidden');

                }; // isotope_init


                // init isotope
                list.imagesLoaded(function() {
                    pagination();
                    isotope_init();
                    isotope_filter();
                });


                // PORTFOLIO FILTERS

                if (filters.is('UL')) {
                    filters.on('click', 'a', function() {
                        filters.find('.colio-active-filter').removeClass('colio-active-filter');
                        $(this).addClass('colio-active-filter');
                        var tag = $(this).attr('href').substr(1);
                        pagination(tag);
                        isotope_filter(tag);
                        return false;
                    });
                } else {
                    filters.change(function() {
                        var tag = $(this).find('option:selected').val();
                        pagination(tag);
                        isotope_filter(tag);
                    });
                }

                // DEEPLINKING
                window.setTimeout(function() {

                    // if no hash in URL, return
                    if (window.location.hash == '') {
                        return;
                    }

                    // look for item 
                    var target_item = list.find('[data-hash="' + window.location.hash + '"]');

                    // return if there is no matching item
                    if (target_item.length == 0) {
                        return;
                    }

                    list.imagesLoaded(function() {

                        // get item page and index
                        var target_index = target_item.index(),
                            target_page = target_item.attr('data-page');

                        // switch to correct page and update item index												
                        if (target_page) {
                            target_index = list.children('[data-page="' + target_page + '"]').index(target_item);
                            wrap.find('.colio-pagination ul').find('a:eq(' + (target_page - 1) + ')').trigger('click');
                        }

                        // wait for page switch transition to end and expand item
                        window.setTimeout(function() {
                            list.trigger('colio', 'excludeHidden').trigger('colio', ['expand', target_index]);
                        }, options.transitionDuration + 1000);

                    });

                }, 1500);

            })(wrap, options);

        } // "window.colio_options" loop

    } // if "colio_options"

});