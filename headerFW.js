module.exports = function(app){
    var HeaderFW = Object.getPrototypeOf(app).HeaderFW = new app.Component("headerFW");
    // HeaderFW.debug = true;
    HeaderFW.createdAt      = "2.0.0";
    HeaderFW.lastUpdate     = "2.5.0";
    HeaderFW.version        = "1.1.6";
    // HeaderFW.factoryExclude = true;
    // HeaderFW.loadingMsg     = "This message will display in the console when component will be loaded.";
    // HeaderFW.requires       = [];

    HeaderFW.prototype.onCreate = function(){
        var header = this;
        header.$logo      = header.$el.find('.headerFW__logo__wrapper');
        header.$nav       = header.$el.find('.headerFW__nav__wrapper');
        header.$navInline = header.$nav.find('.headerFW__nav__inline').length ?  header.$nav.find('.headerFW__nav__inline') : header.$nav.find('nav.mod_navigation').addClass('headerFW__nav__inline');
        header.$navPanel  = $('<div class="headerFW__nav__panel"></div>').appendTo(header.$nav);
        header.$toggler   = $('<div class="headerFW__nav__toggler"><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>').appendTo(header.$nav);
        header.$loader    = $('<div class="loader"><i class="fas fa-circle-notch fa-spin"></i></div>').insertAfter(header.$nav);
        header.$topbar    = $('.headerFW__topbar').length  ? $('.headerFW__topbar')  : false;
        header.$search    = $('.headerFW__search').length  ? $('.headerFW__search')  : false;
        header.$lang      = $('.headerFW__lang').length    ? $('.headerFW__lang')    : false;
        header.$postnav   = $('.headerFW__postnav').length ? $('.headerFW__postnav') : false;
        header.stick      = header.getData('stick',true);
        header.watchNav   = header.getData('watchnav',true);


        // PANEL CONSTRUCT
        header.navPanelMenus = {};
        header.$navInline.find('ul').each(function(index,menu){
            // define menu's id from it's parent's label
            var ID = 'root';
            if($(menu).parent('li').length)
                ID = utils.normalize($(menu).parent('li').children().not('ul').text());
            // check duplicate IDs
            if (typeof header.navPanelMenus[ID] != 'undefined')
                ID = ID+'-'+index;

            // clone the corresponding html and setup panel items
            header.navPanelMenus[ID] = {$el : $(menu).clone()};
            header.navPanelMenus[ID].$el.addClass('panel__item').attr('data-panel',utils.normalize($(menu).parent('li').children().not('ul').text()));

            // search for li that have sub ul
            header.navPanelMenus[ID].$el.children('li').each(function(index,item){
                if($(item).children('ul').length){
                    $(item).append('<div class="toggler chevron"></div>');
                }
            });
            // remove useless html
            header.navPanelMenus[ID].$el.find('ul').remove();
            header.navPanelMenus[ID].$el.append('<div class="panel__actions"></div>');

            // set parent toggler
            if(ID != 'root'){
                header.navPanelMenus[ID].$el.attr('data-panel',utils.normalize($(menu).parent('li').children().not('ul').text()));
                var label = 'Retour';
                if($(menu).parent('li').parent('ul').parent('li').length)
                    header.navPanelMenus[ID].$el.attr('data-parent',utils.normalize($(menu).parent('li').parent('ul').parent('li').children().not('ul').text()));
                else
                    header.navPanelMenus[ID].$el.attr('data-parent','root');

                header.navPanelMenus[ID].$el.prepend('<div class="panel__title"><div class="chevron left"></div><span>'+$(menu).parent('li').children().not('ul').text()+'</span></div>');
                header.navPanelMenus[ID].$el.find('.panel__actions').append('<div class="back"><div class="chevron left"></div><span>'+label+'</span></div>');
            } else {
                header.navPanelMenus[ID].$el.attr('data-panel','root');
            }
            header.$navPanel.append(header.navPanelMenus[ID].$el);
        });

        // EVENTS
        
        // click on main navigation toggler 
        // open/close the nav panel
        header.$toggler.on('click',function(e){
            header.$toggler.toggleClass('active');
            header.$navPanel.toggleClass('active');
            if(header.$toggler.hasClass('active')){
                header.$el.addClass('is-open');
                document.body.addEventListener('click',panelClickHandler);
            }
            else{
                header.$el.removeClass('is-open');
                document.body.removeEventListener('click',panelClickHandler);
            }
            if (header.watchNav) header.navChecker();
            header.panelChecker();
        });
        // handle click "outside" of the header, allowing to close the panel menu by taping on the page body
        var panelClickHandler = function(e){
            if (e.target.className.indexOf('headerFW') == -1 && e.target.closest('[class*=headerFW]') == null)
                header.$toggler.trigger('click');
        }
        if (header.$search) {
            header.searchParameter = header.$search.find('input').prop('name');
            var isNavWatching = header.watchNav;
            header.$search.on('click',function(e){
                if (!header.$search.hasClass('active')) {
                    header.watchNav = false;
                    header.$search.addClass('active');
                    if (document.body.classList.contains('mobile'))
                        header.$navPanel.addClass('mobile');
                    header.$nav.addClass('overflow-hidden');
                    header.$search.find('input').focus();
                    header.$search.on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
                        header.$search.off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
                        setTimeout(function(){
                            document.body.addEventListener('click',searchClickHandler);
                        },getComputedStyle(header.$search.find('input').get(0)).transitionDuration.replace('s','') * 1000)
                    })
                }
            });

            // handle click "outside" of the header, allowing to close the search by taping on the page body
            var searchClickHandler = function(e){
                if (e.target.className.indexOf('headerFW__search') == -1 && $(e.target).closest('.headerFW__search').length == 0){
                    header.$search.on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
                        header.watchNav = isNavWatching;
                        header.$nav.removeClass('overflow-hidden');
                        header.$search.off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
                    })
                    header.$search.removeClass('active');
                    if (document.body.classList.contains('mobile'))
                        header.$navPanel.removeClass('mobile');
                    document.body.removeEventListener('click',searchClickHandler);
                }
            }

            setTimeout(function(){
                if (window.location.search.indexOf('?') != -1 && window.location.search.indexOf(header.searchParameter) != -1) {
                    var searchParams = new URLSearchParams(window.location.search);
                    header.$search.find('input').val(searchParams.get(header.searchParameter));
                    if (!header.$el.hasClass('is-reduce'))
                        header.$search.trigger('click');
                }
            },1000)
        }

        // click on submenu toggler
        // hide the current panel, show the next one
        $('body').on('click','.headerFW__nav__panel .toggler',function(e){
            var targetID = utils.normalize($(this).parent('li').children().not('ul').text());
            header.$navPanel.find('.panel__item').removeClass('active');
            header.$navPanel.find('.panel__item[data-panel="'+targetID+'"][data-parent="'+$(this).closest('.panel__item').data('panel')+'"]').addClass('active');
        });
        // click on submenu back button
        // hide the current panel, show the previous one
        $('body').on('click','.headerFW__nav__panel .panel__actions .back,.headerFW__nav__panel .panel__title',function(e){
            header.$navPanel.find('.panel__item').removeClass('active');
            header.$navPanel.find('.panel__item[data-panel='+$(this).closest('.panel__item').data('parent')+']').addClass('active');
        });

        // scroll observer
        // define the header's pinned state
        if (header.stick == true) {
            var inter_obs = new IntersectionObserver(
                ([e]) => {
                    e.target.classList.toggle("is-pinned", e.intersectionRatio < 1)
                    header.panelChecker();
                },
                { threshold: [1] }
            );
            inter_obs.observe(header.$el.get(0));
        }
        if (header.stick == 'scroll') {
            var scrollHandler = function () {
                // console.log('scrollHandler',window.oldScroll,window.scrollY);
                if (window.oldScroll > window.scrollY) { // going up
                    // console.log(' going up',header.$el);
                        header.$el.removeClass('is-unpinned');
                        header.$el.addClass('is-pinned');
                } else if (window.oldScroll < window.scrollY) { // going down
                    // console.log(' going down',header.$el);
                    if (window.scrollY > (header.$el.outerHeight() + (header.$topbar ? header.$topbar.outerHeight() : 0)) && !header.$el.hasClass('is-open')){
                        header.$el.removeClass('is-pinned');
                        header.$el.addClass('is-unpinned');
                    }
                }
                window.oldScroll = window.scrollY;
            };

            // document.addEventListener("visibilitychange", () => {
            //   if (document.visibilityState === "visible") {
            //     console.log('visible')
            //     scrollHandler()
            //   } else {
            //     console.log('change tabs')
            //   }
            // });

            var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;
            var $window = $(window);
            var lastScrollTop = $window.scrollTop();
            function loop() {
                var scrollTop = $window.scrollTop();
                if (lastScrollTop === scrollTop) {
                    raf(loop);
                    return;
                } else {
                    lastScrollTop = scrollTop;
                    // fire scroll function if scrolls vertically
                    scrollHandler();
                    raf(loop);
                }
            }
            if (raf) 
                loop();
        }
        if (header.stick != false)
            document.documentElement.style.scrollPaddingBlockStart = window.getComputedStyle(header.$el.get(0)).height;

        $(window).resize(function(){
            if (header.watchNav) header.navChecker();
        });

        // PANEL INIT STATE
        if(utils.getObjSize(header.navPanelMenus) > 0)
            header.navPanelMenus.root.$el.addClass('active');
        else
            header.$el.addClass('no-items');
        
        if (header.watchNav) header.navChecker();
        header.onResize();
        header.$el.addClass('active');
        // console.log(header);
        // header.navSwitcher(true); 
        // header.$toggler.trigger('click');
        return header;
    };

    /**
     * check the nav size and if it need to switch between reduced and not-reduced states
     */
    HeaderFW.prototype.navChecker = function(){
        var header = this;
        var isOffset = false;
        var totalNavWidth = 0;
        if (header.$el.hasClass('is-reduce')) {
            if (header.$search) header.$nav.append(header.$search);
            if (header.$lang)   header.$nav.append(header.$lang);
        }
        header.$nav.children().not('.headerFW__nav__panel,.headerFW__nav__toggler,.exclude').each(function (){
            totalNavWidth+=$(this).outerWidth();
        });
        if (header.$el.hasClass('is-reduce')) {
            if (header.$search) header.$search.appendTo(header.navPanelMenus.root.$el.find('.panel__actions'));
            if (header.$lang)   header.$lang.appendTo(header.navPanelMenus.root.$el.find('.panel__actions'));
        }
        if((header.$nav.position().left + totalNavWidth).toFixed(2) > header.$el.outerWidth() || header.$nav.position().left.toFixed(2) < 0)
            isOffset = true;

        if(isOffset){
            header.navSwitcher(isOffset);
        }
        else{
            if(!header.$navPanel.hasClass('active')){
                header.navSwitcher(isOffset);
            }
        }
        header.panelChecker();
    };

    /**
     * switch the header between reduced and not-reduced states
     * @param  {Boolean} reduce 
     */
    HeaderFW.prototype.navSwitcher = function(reduce = false){
        var header = this;
        if (reduce) {
            header.$el.addClass('is-reduce');
            if (header.$search) header.$search.appendTo(header.navPanelMenus.root.$el.find('.panel__actions'));
            if (header.$lang)   header.$lang.appendTo(header.navPanelMenus.root.$el.find('.panel__actions'));
        } else {
            header.$el.removeClass('is-reduce');
            if (header.$search) header.$nav.append(header.$search);
            if (header.$lang)   header.$nav.append(header.$lang);
        }
    };

    /**
     * controls and change panel's height according to the header pinned state
     */
    HeaderFW.prototype.panelChecker = function(){
        var header = this;
        if (header.$navPanel.hasClass('active')) {
            if(header.$el.hasClass('is-pinned'))
                header.$navPanel.css('height', viewport.height - header.$el.outerHeight() + 1);
            else
                header.$navPanel.css('height', viewport.height - (header.$el.position().top + header.$el.outerHeight()) + 1);
                // header.$navPanel.css('height', viewport.height - (header.$el.get(0).getBoundingClientRect().top + header.$el.outerHeight()));
                // header.$navPanel.css('height', viewport.height - (header.$el.get(0).getBoundingClientRect().top + header.$el.outerHeight()) + 1);
        }
    };

    HeaderFW.prototype.onResize = function(){
        var header = this;
        if(HeaderFW.debug) header.log('resized');
        header.$navInline.find('li ul').addClass('no-transition').removeClass('offset-right').each(function(){
            var offsetRight = $(this).offset().left + $(this).outerWidth();
            if(offsetRight > viewport.width)
                $(this).addClass('offset-right');
        }).removeClass('no-transition');
    };

    return HeaderFW;
}