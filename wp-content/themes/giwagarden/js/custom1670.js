jQuery(document).ready(function ($) {

    const SLH_URL = 'https://api.dev.shortlethomes.net/api/lead';
    var $croppie = null;
    var showedAccommodation = false;
    var context = {};
    var ajaxResellersTickets;

    initializeCalendar();
    initializeTimer();
    initializeCounter();
    initializeCalendarHome();
    initializeCalendarTickets();
    initializeGuestListCalendar();
    initializeResellerTicketsCalendar();
    //initializeTicketsTabs();

    if ($('.gg-guest-list').length)
    {
        var $form = $('form[data-form="guest-list"]');
        getGuestList($form.serialize());
    }

    if ($('.gg-addons-list').length)
    {
        var $form = $('form[data-form="addons-list"]');
        getAddonsList($form.serialize());
    }

    if (($('.gg-summary').length))
    {
        updateSummary();
    }
    var date = getParameterByName('date');

    if ($('.gt-tickets__item').length)
    {
        initializeResellerTicketsTabs(0);
        initializeAvailableTickets();
    }

    if(!(location.search.indexOf('tickets[') > -1 || location.search.indexOf('meals[') > -1) && $('.gg-summary').length)
    {
        if (getCookie('data'))
        {
            window.location.search = getCookie('data');
        }
        else
        {

            location = '/';
        }
    }

    if (location.hash == '#widget' && location.pathname == '/') {
        $('.contact-widget__content').show();
    }



    if ($('.gg-reader').length) {
        var config = {
            qrbox: {width: 250, height: 250},
            fps: 20,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            rememberLastUsedCamera: false
        }
         var scanner = new Html5Qrcode('gg-reader');


        var qrCodeSuccessCallback = (decodedText, decodedResult) => {

            scanner.stop();
            location =  decodedText;
            $('.gg-render__content').html('<h2 style="text-align: center">Success</h2>');

        };

        scanner.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);



    }

    if ($('.gg-reseller-profile').length) {

        $('.gg-reseller-profile__bank-input').select2({
                placeholder: 'Find your bank*'
            }
        )
    }



    //Modal guest-list use ticket
    $(document).on('click', '.gg-button[data-check-in]', function (e) {

        e.stopPropagation();
        var $modal = $(this).closest('.gg-guest-list[data-id="guest-list"]').find('.gg-modal-guest[data-id="modal"]');
        var ticketId = $(this).data('check-in');
        $modal.find('.gg-modal-guest__ticket-id').html(ticketId);
        $modal.addClass('visible');
    });


    $(document).on('click', '.gt-tickets-currency', function() {
        $('.gt-tickets ').attr('data-currency', $('.gt-tickets ').attr('data-currency') == 'USD'?'NGN':'USD');
        refreshCurrency();
    });

    if($('.gt-tickets').length)
    {
        refreshCurrency();
        $(window).scroll(function(){
            var scrollTop = $(window).scrollTop()
            if (scrollTop > 1000)
            {
                $('.gt-tickets').addClass('fixed-buttons');
            }
            else
            {
                $('.gt-tickets').removeClass('fixed-buttons');

            }
            if (scrollTop > 300)
            {
                $('.gt-tickets').addClass('fixed-panel');
            }
            else
            {
                $('.gt-tickets').removeClass('fixed-panel');

            }
        });
    }

    function refreshCurrency()
    {
        var symbol = $('.gt-tickets').attr('data-currency');


        $('.vc_tta-title-text span[data-amount]').each(function(i,e){
            var value = $(this).attr('data-amount');
            value = Math.round(value / exchangeRate[symbol]);
            if(value > 1000)
            {
                value = Math.floor(value / 1000) + 'k';
            }
            $(this).find('b').html( (symbol == 'USD'?'$':'₦') + value);
        });

        $('.gt-tickets__item-product__price').each(function(i,e){
            var value = $(this).attr('data-amount') ;
            value = value / exchangeRate[symbol];

            $(this).html(formattedPrice(value,symbol));
        });

        $('.gt-tickets .gg-counter').each(function(){
            onGgCounterChanged($(this));
        });
    }

    $(document).on('click', '.gg-button[data-use="confirm"]', function() {

        var ticket_id = +$('.gg-button[data-check-in]').data('check-in');

        var data = {action: 'gg_use_ticket', ticket_id: ticket_id}
        $.ajax({
            type: 'POST',
            url: wc_add_to_cart_params.ajax_url,
            data: data,
            dataType: 'json',
            success: function (response) {
                if (response.status === 200) {
                    $('.gg-modal-guest[data-id="modal"]').removeClass('visible');
                    $('.gg-reseller-dashboard__table-col[data-status="'+response.ticket_id+'"]').html('Checked In');
                }
            }

            });
    });

    $(document).on('click', '.gg-button[data-use="cancel"]', function () {
        $('.gg-modal-guest[data-id="modal"]').removeClass('visible');
    });

    //Modal addons use ticket
    $(document).on('click', '.gg-button[data-use-addons]', function (e) {

        e.stopPropagation()
        var $modal = $(this).closest('.gg-addons-list[data-id="addons-list"]').find('.gg-modal-addons[data-id="modal"]');
        var ticketId = $(this).data('use-addons');
        $modal.find('.gg-modal-addons__ticket-id').html(ticketId);
        $modal.addClass('visible');
    });

    $(document).on('click', '.gg-button[data-addons="confirm"]', function() {

        var addons_id = $('.gg-button[data-use-addons]').data('use-addons');

        var data = {action: 'gg_use_addons', addons_id: addons_id}
        $.ajax({
            type: 'POST',
            url: wc_add_to_cart_params.ajax_url,
            data: data,
            dataType: 'json',
            success: function (response) {
                if (response.status === 200) {
                    $('.gg-modal-addons[data-id="modal"]').removeClass('visible');
                    $('.gg-button[data-use-addons="'+response.addons_id+'"]').attr('disabled', true)
                    $('.gg-reseller-dashboard__table-col[data-status="'+response.addons_id+'"]').html('Used');
                }
            }

        });
    });

    $(document).on('click', '.gg-button[data-addons="cancel"]', function () {
        $('.gg-modal-addons[data-id="modal"]').removeClass('visible');
    });

    $(document).on('click', '.gg-reseller-dashboard__table-row[data-addons]', function (e) {
        if ($(this).data('available')) {
            var id = $(this).data('addons');
            $('.gg-button[data-use-addons="' + id + '"]').trigger('click');
        }
    });

    $(document).on('click', '.gg-reseller-dashboard__table-row[data-ticket]', function () {
        if ($(this).data('available')) {
            var id = $(this).data('ticket');
            $('.gg-button[data-check-in="' + id + '"]').trigger('click');
        }

    });



    //Addons list table
    var timekeyAddons;
    $(document).on('keyup', '.gg-addons-list .gg-guest-list__filter-item__input[name="ticket_id"]', function () {
        var $form = $('form[data-form="addons-list"]');

        clearTimeout(timekeyAddons);
        timekeyAddons = setTimeout(() => {
            getAddonsList($form.serialize());
        }, 1000)

    });

    $(document).on('input', '.gg-addons-list .gg-guest-list__filter-item__input[name="date"]', function () {
        var $form = $('form[data-form="addons-list"]');
        getAddonsList($form.serialize());

    });

    $(document).on('change', '.gg-addons-list .gg-guest-list__filter-item__select[name="item"]', function () {
        var $form = $('form[data-form="addons-list"]');
        getAddonsList($form.serialize());

    });


    //Guest list table
    var timekeyGuest;
    $(document).on('keyup', '.gg-guest-list .gg-guest-list__filter-item__input[name="ticket_id"]', function () {

        var $form = $('form[data-form="guest-list"]');
        clearTimeout(timekeyGuest);
        timekeyGuest = setTimeout(() => {
            getGuestList($form.serialize());
        }, 1000)

    });

    $(document).on('change', '.gg-guest-list .gg-guest-list__filter-item__select[name="class_id"]', function () {
        var $form = $('form[data-form="guest-list"]');
        getGuestList($form.serialize());

    });

    $(document).on('input', '.gg-guest-list .gg-guest-list__filter-item__input[name="date"]', function () {
        var $form = $('form[data-form="guest-list"]');
        getGuestList($form.serialize());

    });


    //Reseller my-tickets option
    $(document).on('click', '.gg-reseller-dashboard__table-col--options', function (e) {
        e.stopPropagation()
        $('.gg-reseller-dashboard__table-col--options').removeClass('active');
        $(this).addClass('active');
    });

    if ($('.gg-reseller-dashboard__table').length) {
        $(document).on('click', function () {
            $('.gg-reseller-dashboard__table-col--options').removeClass('active');
        });
    }

    $(document).on('click', '.gg-reseller-dashboard__table-col--options ul li a', function (e) {
        e.stopPropagation()
        $('.gg-reseller-dashboard__table-col--options').removeClass('active');
    });

    //Reseller change price and available
    $(document).on('click', '.gg-reseller-dashboard__change[data-change]', function () {
        var selected = $(this).data('change');
        var notificationSuccess = $('.gg-reseller-dashboard__notification-success');
        notificationSuccess.addClass('hidden');

        $(this).closest('.gg-reseller-dashboard__table-row').addClass('changing-' + selected);
        $(this).closest('td').addClass('active');
        $(this).closest('.gg-reseller-dashboard__table-col--' + selected).find('.gg-reseller-dashboard__input').focus();
    });

    $(document).on('click', '.gg-reseller-dashboard__change[data-new]', function () {
        var selected = $(this).data('new');
        var $inputValue = $(this).closest('.gg-reseller-dashboard__table-col__new-' + selected)
            .find('.gg-reseller-dashboard__input');
        var inputValue = $inputValue.val().split(',').join('') * 1 || 0;
        $inputValue.val(inputValue);
        var notificationError = $('.gg-reseller-dashboard__notification-error');
        var notificationSuccess = $('.gg-reseller-dashboard__notification-success');

        // if (selected === 'available') {
        //     var maxAvailable = +$(this)
        //         .closest('.gg-reseller-dashboard__table-col--available')
        //         .find('.gg-reseller-dashboard__input')
        //         .attr('max');
        //
        //     if (inputValue > maxAvailable) {
        //
        //         notificationError
        //             .html('You have available '+maxAvailable+' tickets')
        //             .removeClass('hidden');
        //         return;
        //     }
        //
        // }

        var isAvailable = true;
        $('.gg-reseller-dashboard__table-col.active .gg-reseller-dashboard__input[max]').each(function () {
            var value = +$(this).val();
            var max = +$(this).attr('max')

            if (value > max) {
                isAvailable = false
                $(this).closest('td').addClass('error')
            } else  {
                $(this).closest('td').removeClass('error')
            }
        });
        $('.gg-reseller-dashboard__table-col.active .gg-reseller-dashboard__input[min]').each(function () {
            var value = +$(this).val();
            var min = +$(this).attr('min')

            if (value < min) {
                $(this).closest('td').addClass('error')
            } else  {
                $(this).closest('td').removeClass('error')
            }
        });

        if (!isAvailable) {
            notificationError
                .html('Wrong available tickets')
                .removeClass('hidden');
        }

        if($('.gg-reseller-dashboard__table td.error').length)
        {
            return;
        }


        // if (!Number.isInteger(inputValue)) {
        //     $(this).closest('td').addClass('error');
        //     return
        // } else {
            $(this).closest('td').removeClass('error');
        // }

        inputValue = selected === 'price' ? formattedPrice(inputValue) : inputValue;
        // $(this).closest('.gg-reseller-dashboard__table-row').removeClass('changing-' + selected);
        // $(this).closest('td').removeClass('active');
        $('.gg-reseller-dashboard__table-row').removeClass('changing-available');
        $('.gg-reseller-dashboard__table-row').removeClass('changing-price');
        $('.gg-reseller-dashboard__table-col').removeClass('active');

        $(this).closest('.gg-reseller-dashboard__table-col--' + selected).find('.gg-reseller-dashboard__' + selected + '-value').html(inputValue);



        var $form = $('form[data-form="reseller-dashboard"]');

        $.ajax({
            type: 'POST',
            url: wc_add_to_cart_params.ajax_url,
            data: $form.serialize(),
            success: function (response) {
                notificationError.addClass('hidden');
                notificationSuccess.removeClass('hidden')

            }

        });

    });

    $(document).on('keydown', '.gg-reseller-dashboard__input', function (event) {
        if (event.keyCode === 13) {
            $(this).closest('.gg-reseller-dashboard__table-col')
                .find('.gg-reseller-dashboard__change[data-new]')
                .trigger('click');
        }
    });


    $('.gg_modal-filter__select').select2({
        theme: 'classic',
        width: '100%',
        placeholder: $(this).attr('data-placeholder')
    });

    //Reseller list sort
    $(document).on('change', '.gg-reseller-list__search-select', function () {

        var selectedValue = $(this).val();
        var container = $('.gg-reseller-list__row');
        var elements = $('.gg-reseller-list__col');

        function sortByValue(value, orderBy) {
            elements.sort(function (a, b) {
                var valueA = +$(a).data(value);
                var valueB = +$(b).data(value);

                if (orderBy == 'desc') {
                    return valueB - valueA;
                } else if (orderBy == 'asc') {
                    return valueA - valueB;
                }

            });

        }

        if (selectedValue == 'price-low-to-high') {
            sortByValue('price', 'asc');

        } else if (selectedValue == 'price-high-to-low') {
            sortByValue('price', 'desc');

        } else if (selectedValue == 'sales-low-to-high') {
            sortByValue('sold', 'asc');

        } else if (selectedValue == 'sales-high-to-low') {
            sortByValue('sold', 'desc');
        }


        container.empty();
        $.each(elements, function (index, element) {
            container.append(element);
        });

    });

    //Share
    $(document).on('click', '.gg-button[data-page="share"]', function () {
        $('.gg-dialog-share').addClass('visible');
    });

    //Reseller search
    $(document).on('input', '.gg-reseller-list__search-input', function () {

        var searchValue = $(this).val().toLowerCase();
        $('.gg-reseller-list__col').addClass('hidden');

        $('.gg-reseller-list__col').each(function () {
            var elementName = $(this).attr('data-name').toLowerCase();

            if (elementName.includes(searchValue)) {
                $(this).removeClass('hidden');
            }
        })

    })

    //Croppie
    $(document).on('click', '.gg-avatar__edit', function (event) {
        event.preventDefault();

        $('.gg-avatar__file').trigger('click');

        return false;
    });

    $(document).on('change', '.gg-avatar__file', function (event) {
        var file = this.files[0];

        if (!file) {
            return;
        }

        if (!$croppie) {
            $croppie = $('.gg-avatar__preview').croppie({
                enableExif: true,
                enableOrientation: true,
                boundary: {
                    height: 120,
                    width: 121
                },
                viewport: {
                    width: 100,
                    height: 100,
                    type: 'circle'
                }
            });
        }

        var reader = new FileReader();

        reader.onload = function (event) {
            $croppie.croppie("bind", {
                url: event.target.result
            });

            $('.gg-avatar').addClass('editing');
            $('.gg-reseller__avatar').addClass('editing');
        };

        reader.readAsDataURL(file);
    });

    $(document).on('click', '.gg-avatar__save', function (event) {
        event.preventDefault();

        $croppie.croppie('result', {
            type: 'canvas',
            size: {
                width: 240,
                height: 240
            },
            format: 'jpeg',
            circle: false
        }).then(function (result) {
            var data = {action: 'gg_upload_avatar', file: result}

            $.ajax({
                type: 'POST',
                url: wc_add_to_cart_params.ajax_url,
                data: data,
                success: function (response) {
                    $('.gg-avatar').removeClass('editing');
                    $('.gg-reseller__avatar').removeClass('editing');
                    $('.gg-avatar__image').css('background-image', 'url(' + result + ')');

                }

            });

        });

        return false;
    });

    $(document).on('click', '.gg-avatar__cancel', function (event) {
        event.preventDefault();

        $('.gg-avatar__file').val(null);
        $('.gg-avatar').removeClass('editing');
        $('.gg-reseller__avatar').removeClass('editing');

        return false;
    });


    if ($('.gg-reseller__avatar').length) {
        $('input[name="basic-user-avatar"]').before('<label class="gg-reseller__avatar__edit" for="basic-local-avatar"></label>')
    }

    $(document).on('click', '.avatar.avatar-96', function () {
        $(this).closest('.gg-reseller__avatar').find('input[name="basic-user-avatar"]').trigger('click');
    });

    //Modal video
    $(document).on('click', '.gg-video__item', function () {
        var $modal = $('.gg-modal[data-id="modal-video"]');
        var videoUrl = $('.gg-video__item[data-id]').attr('data-id')

        $modal.find('.gg-modal__title').html($(this).attr('title'));
        $modal.find('.video__player__frame').attr('src', $(this).attr('data-id'));
        $modal.addClass('visible');
    });

    $(document).on('click', '.gg-modal__close[data-close="video"]', function () {
        var $modal = $(this).closest('.gg-modal[data-id="modal-video"]');
        $modal.find('.video__player__frame').attr('src', 'about:blank');
        $modal.removeClass('visible');
    });

    $(document).on('click', '.gg-modal[data-id="offer-modal"] button, .gg-modal[data-id="offer-modal"] .gg-modal__close', function () {
        var $modal = $(this).closest('.gg-modal[data-id="offer-modal"]');
        $modal.removeClass('visible');
    });


    $(document).on('click', '.gg-reseller-profile__email-verified__icon', function () {

        $(this).closest('.gg-reseller-profile__email-verified').hide();
    });

    //Resend email verification
    $(document).on('click', '.gg-button[data-id="resend-verify"]', function () {

        var data = {action: 'gg_resend_verification'};
        $.ajax({
            type: 'POST',
            url: wc_add_to_cart_params.ajax_url,
            data: data,
            success: function (response) {
                $('.verify-email__notification--success').removeClass('hidden');

            }

        });

    });

    $(document).on('click', '.gg-button[data-email="show"]', function () {
        $(this).closest('.verify-email__footer').addClass('verify-email__footer--change-email');
    });

    $(document).on('submit', 'form[data-form="change-email"]', function (e) {
        e.preventDefault();
        var $form = $(this);
        var email = $(this).find('.gg-input[name="email"]').val();
        var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        var isValid = regex.test(email);

        if (email.length > 0 && isValid) {
            $.ajax({
                type: 'POST',
                url: wc_add_to_cart_params.ajax_url,
                data: $form.serialize(),
                success: function (response) {
                    $('.verify-email__footer--error').addClass('hidden');
                    if (response.data == 'success') {
                        $('.verify-email__notification--error').addClass('hidden');
                        $('.verify-email__notification--success').removeClass('hidden');
                    } else {
                        $('.verify-email__notification--error').removeClass('hidden');
                    }


                }

            })
        } else {
            $('.verify-email__footer--error').removeClass('hidden');
        }


    });


    //Switch account
    $(document).on('click', '.header__switch-account', function () {
        $('.gg_modal-account').find('.gg-modal[data-id="modal"]').addClass('visible');
    });

    $(document).on('change', '.gg-checkbox[name="account"]', function () {

        if ($(this).val() == 'customer') {
            setCookie('reseller', true, -30);

        } else if ($(this).val() == 'reseller') {
            setCookie('reseller', true, 30);
        }
        location.href = '/my-account';

        $('.gg_modal-account').find('.gg-modal[data-id="modal"]').removeClass('visible');
    });

    //Tickets edit date
    $(document).on('click', '.gg-tickets__edit', function () {
        $('.gg_edit-date').find('.gg-modal[data-id="modal"]').addClass('visible');
    });

    $(document).on('click', '.gg-button[data-edit="apply"]', function () {

        var selectedDate = moment(+$('.first-date-selected.checked').attr('time'));
        $(this).closest('.gg-modal[data-id="modal"]').removeClass('visible');

        $('input[name="date"]').val(selectedDate.format('YYYY-MM-DD'));
        $('.gg-tickets__subtitle__date').html(selectedDate.format('dddd, MMMM DD, YYYY'));
        $('.gg-modal__subtitle__date').html(selectedDate.format('dddd, MMMM DD, YYYY'))

    });

    $(document).on('click', '.gt-tickets-filter', function () {
        $('.gg_modal-filter').find('.gg-modal[data-id="modal"]').addClass('visible');
    });

    //Filter reseller
    $(document).on('click', '.gg-button[data-filter="reseller-result"]', function () {
        var priceRange = [];
        var $container = $(this).closest('.gg_modal-filter');
        $container.find('.gg-checkbox[name="price"]:checked').each(function () {
            var range = $(this).val().split('-')
            priceRange.push({from: +range[0], to: +range[1]});

        });

        if (priceRange.length) {
            $('.gg-reseller-list__col').each(function () {
                $(this).hide();
                var price = +$(this).data('price');

                for (i in priceRange) {
                    if (price >= priceRange[i].from && price <= priceRange[i].to) {
                        $(this).show();
                    }
                }
            })


        }

        $('.gg_modal-filter').find('.gg-modal[data-id="modal"]').removeClass('visible');

    });

    //Filter tickets
    $(document).on('click', '.gg-button[data-filter="cancel"]', function () {
        $('.gg_modal-filter').find('.gg-modal[data-id="modal"]').removeClass('visible');


    });


    function ticketsFilter()
    {
        var checkedCategory = [];
        var checkedPrice = [];
        var priceRange = [];
        var $container = $('.gg_modal-filter');
        var reseller = $container.find('.gg_modal-filter__select[name="reseller"] option:selected').data('id') || 0;
        var $sort = $container.find('[name="sort"]');

        $container.find('.gg-checkbox[name="category"]:checked').each(function () {
            checkedCategory.push('.gt-tickets__item[data-category="' + $(this).val() + '"]')
        });

        $container.find('.gg-checkbox[name="price"]:checked').each(function () {
            var range = $(this).val().split('-')
            priceRange.push({from: +range[0], to: +range[1]});

        });

        // var $items = $('#cheapest_reseller .gt-tickets__item, #popular_reseller .gt-tickets__item');
        var $items = $('.gt-tickets__item');
        $items.hide();

        if (checkedCategory.length) {
            $items = $items.filter(checkedCategory.join(','));

        }

        if (priceRange.length) {
            $filteredItems = [];
            $.each($items, function () {
                if ($(this).find('.gg-counter[data-type="adult"]').length) {
                    var price = +$(this).find('.gg-counter[data-type="adult"]').attr('data-price');
                    for (i in priceRange) {
                        if (price >= priceRange[i].from && price <= priceRange[i].to) {
                            $filteredItems.push($(this));
                        }
                    }
                }

            });
            $items = $filteredItems;
        }

        if (reseller.length && reseller !== 'all') {
            $filteredItems = [];
            $.each($items, function () {

                if ($(this).data('reseller') == reseller) {
                    $filteredItems.push($(this));
                }
            });
            $items = $filteredItems;

            // $('.gt-tickets .vc_tta-tabs-list').hide();
        }
        else
        {
            // $('.gt-tickets .vc_tta-tabs-list').show();
        }


        $('.gt-tickets__items__not-found').addClass('hidden');

        if ($items.length) {

            $.each($items, function () {
                $(this).show();
            });
        } else {
            $('.gt-tickets__items__not-found').removeClass('hidden');
        }


        if($sort.val() != $sort.attr('old_value'))
        {
            $sort.attr('old_value',$sort.val());
            $('#cheapest_reseller .gt-tickets__item').each(function ()
            {
                $(this).remove();
            });
            if(ajaxResellersTickets!=null)
            {
                ajaxResellersTickets.abort();
            }
            initializeResellerTicketsTabs(0);
        }
    }

    $(document).on('click', '.gg-button[data-filter="result"]', function () {
        $('.gg_modal-filter').find('.gg-modal[data-id="modal"]').removeClass('visible');
        ticketsFilter();
    });


    if ($('.gg_modal-filter').length) {
        ticketsFilter();
    }


    //Reseller dashboard table
    // var timekey;
    // $(document).on('change', '.gg-reseller-dashboard__input', function () {
    //
    //     var $form = $('form[data-form="reseller-dashboard"]');
    //     clearTimeout(timekey);
    //     timekey = setTimeout(function () {
    //
    //         $.ajax({
    //             type: 'POST',
    //             url: wc_add_to_cart_params.ajax_url,
    //             data: $form.serialize(),
    //             success: function (response) {
    //                 console.log(response);
    //
    //             }
    //
    //         });
    //     },500)
    // })


    //Avatar
    if ($('.gg-reseller').length) {
        $('input[name="manage_avatar_submit"]').attr('value', 'Upload your profile picture');
    }

    //Logout
    $(document).on('click', '.gg-logout', function (e) {
        if (getCookie('data')) {
            // localStorage.removeItem('data');
            setCookie('data', false, -30);
        }
    });

    $(document).on('submit', 'form[data-form="update-info"]', function (event) {
        event.preventDefault();
        var $form = $(this);
        var isValidated = true;

        var dataForValidate = {
            instagram: $form.find('input[name="instagram"]').val(),
            whatsapp: $form.find('input[name="whatsapp"]').val(),
            first_name: $form.find('input[name="first_name"]').val(),
            last_name: $form.find('input[name="last_name"]').val(),
            phone: $form.find('input[name="phone"]').val()
        }

        for (i in dataForValidate) {
            if (dataForValidate[i].length < 1) {
                isValidated = false;
                $form.find('input[name="' + i + '"]').after('<div class="user-registration-error">The field cannot be empty</div>');
            }
        }

        if (isValidated) {
            $form.find('.wpcf7-spinner').addClass('visible');
            $.ajax({
                type: 'POST',
                url: wc_add_to_cart_params.ajax_url,
                data: $form.serialize(),
                success: function (response) {
                    $form.find('.user-registration-error').remove();
                    $form.find('.wpcf7-spinner').removeClass('visible')

                }

            });
        }

    });

    $(document).on('submit', 'form[data-form="update-bank"]', function (event) {
        event.preventDefault();
        var $form = $(this);

        $form.find('.wpcf7-spinner').removeClass('visible')
        $.ajax({
            type: 'POST',
            url: wc_add_to_cart_params.ajax_url,
            data: $form.serialize(),
            success: function (response) {
                $form.find('.user-registration-error').remove();
                if (response.status == false) {
                    $form.find('input[name="account_number"]').after('<div class="user-registration-error">' + response.message + '</div>');
                } else if (response.status == true) {
                    var section = $form.find('.gg-reseller-profile__section[data-id="bank-account"]');
                    section.addClass('gg-reseller-profile__section--confirmed');
                    section.find('input[name="full_name"]').val(response.data.account_name);
                    section.find('input[name="account_number"]').attr('disabled', true);
                    section.find('select[name="bank"]').attr('disabled', true);

                    $('.gg-reseller-profile__start').removeClass('hidden');
                    $('.gg-form__group--center[data-id="link"]').removeClass('hidden');


                }

                $form.find('.wpcf7-spinner').removeClass('visible')


            }

        });

    });

    $(document).on('click', '.gg-reseller-profile__bank-change', function () {
        var section = $('.gg-reseller-profile__section[data-id="bank-account"]');
        section.removeClass('gg-reseller-profile__section--confirmed');
        section.find('input[name="account_number"]').val('');
        section.find('input[name="account_number"]').attr('disabled', false);
        section.find('select[name="bank"]').attr('disabled', false);

        $('.gg-reseller-profile__start').addClass('hidden');
        $('.gg-form__group--center[data-id="link"]').addClass('hidden');
    });

    $('.input-text[id="birthday"]').each(function () {

        $(this).after(`<div class="month-calendar__notification">We use this to verify age for ticket validity</div>`);

        $(this).attr('readonly', 'readonly').val('1985 May').datepicker({
            format: 'yyyy MM',
            viewMode: 'months',
            minViewMode: 'months',

        }).val('');

    });

    $('.gg_account__order__input.month-calendar').each(function () {

        $(this).attr('readonly', 'readonly').datepicker({
            format: 'yyyy MM',
            viewMode: 'months',
            minViewMode: 'months',

        });
    });


    if ($('.gg_account__order').length) {
        $('.gg_account__order__form').each(function () {

            if ($(this).find('.gg_account__order__input').val().length > 1) {

                // $(this).find('.gg_account__order__input[data-id="name"]').removeClass('gg_account__order__input--error');

                var ticket = $(this).closest('.gg_account__order');
                var data = {
                    full_name: $(this).find('.gg_account__order__input[data-id="name"]').val(),
                    email: $(this).find('.gg_account__order__input[data-id="email"]').val(),
                    birthday: $(this).find('.gg_account__order__input[data-id="birthday"]').val()
                }


                var isEmpty = false;
                for (i in data) {
                    if (data[i].length == 0) {
                        isEmpty = true;
                    }
                }

                if (!isEmpty) {
                    fillTicket(ticket, data);
                }


            }

        });

    }


    //quickbook
    $(document).on('submit', 'form[data-id="quickbook-form"]', function (event) {
        var date = $(this).find('.vc_quickbook__calendar-input').val();
        var discount = $(this).find('.vc_quickbook__input[data-id="discount"]').val();


        if (date.length <= 0) {
            $(this).find('.vc_quickbook__col--calendar').addClass('visible');
            event.preventDefault();
            return
        }

        if (discount.length) {
            event.preventDefault();

            async function checkDiscount() {
                try {
                    const res = await applyDiscount(discount)

                    if (res != 'invalid') {
                        event.currentTarget.submit()
                    }

                } catch (err) {
                    console.log(err);
                }
            }

            checkDiscount();

        }

    });


    $(document).on('click', '.vc_quickbook__calendar-input', function () {
        $(this).closest('.vc_quickbook__col--calendar').removeClass('visible');

        if ($(window).width() < 991) {
            $('.gg-designation').appendTo('.vc_quickbook__designation-mobile');
        }

    });


    //Send lead
    $(document).ajaxComplete(function(event,xhr,options){
        if(options.url == "/?wc-ajax=checkout")
        {
            var guest = +getValueFromStorageByName('guest', 'data');
            var bedroom = +getValueFromStorageByName('bedroom', 'data');
            var callback = getValueFromStorageByName('callback', 'data');
            var night = +getValueFromStorageByName('night', 'data');

            if (bedroom && guest && callback) {
                var email = $('.input-text[name="billing_email"]').val();
                var phone = $('.input-text[name="billing_phone"]').val();
                var firstName = $('.input-text[name="billing_first_name"]').val();
                var lastName = $('.input-text[name="billing_last_name"]').val();

                var data = {
                    email: email,
                    phone: phone,
                    name: firstName + ' ' + lastName,
                    guest: guest,
                    bedroom: bedroom,
                    night: night,
                    source: "giwagardens.com"
                }

                $.ajax({
                    type: 'POST',
                    url: SLH_URL,
                    data: data,
                    success: function (response) {
                        // localStorage.removeItem('data');
                        setCookie('data', false, -30);
                    }

                });
            }
        }
    });


    //Show ticket modal
    $(document).on('click', '.gt-tickets__item__details[data-id="modal"]', function () {

        $('.gg-modal[data-id="modal"]').addClass('visible');
    });

    //Hide ticket modal
    $(document).on('click', '.gg-modal__close[data-id="close"]', function () {

        $('.gg-modal[data-id="modal"]').removeClass('visible');
    });

    //Meals tab
    $(document).on('click', '.gg-meals__tab', function () {
        $(this).closest('.gg-meals__tabs-container').find('.gg-meals__tab').removeClass('visible');
        $(this).addClass('visible');


    });

    $(document).on('click', '.gg-meals__items-header', function (event) {
        event.stopPropagation()
        $(this).closest('.gg-meals__tab').removeClass('visible');

    });

    $(document).on('click', '.gg-button[data-id="confirm-terms"]', function () {
        $(this).closest('.gg-dialog').addClass('hidden');
        setCookie('confirmed-terms', true, 30);
    });

    $(document).on('click', '.gg-button[data-id="confirm-terms-reseller"]', function () {
        $(this).closest('.gg-dialog').addClass('hidden');
        setCookie('confirmed-terms-reseller', true, 30);
    });

    $(document).on('click', '.gg_account__order__checkbox[name="terms"]', function () {

        var button = $(this).closest('.gg-dialog__content-footer').find('.gg-button[data-confirm="terms"]');

        if ($(this).prop('checked')) {
            button.attr('disabled', false);
        } else {
            button.attr('disabled', true);
        }


    });

    $(document).on('click', '.gg_account__order__checkbox[name="my_ticket"]', function () {
        var ticket = $(this).closest('.gg_account__order');

        if ($(this).prop('checked')) {

            ticket.find('.gg_account__order__input[data-id="name"]').val(currentUser.full_name);
            ticket.find('.gg_account__order__input[data-id="email"]').val(currentUser.email);
            ticket.find('.gg_account__order__input[data-id="birthday"]').val(currentUser.birthday);
            ticket.removeClass('gg_account__order--valid');
            ticket.find('.gg-button[data-id="update-ticket"]').attr('disabled', false);
            ticket.find('.gg_account__order__input').removeClass('gg_account__order__input--error')
        } else {
            ticket.find('.gg_account__order__input[data-id="name"]').val('');
            ticket.find('.gg_account__order__input[data-id="email"]').val('');
            ticket.find('.gg_account__order__input[data-id="birthday"]').val('');
            ticket.find('.gg-button[data-id="update-ticket"]').attr('disabled', true);
            ticket.find('.gg_account__order__input').addClass('gg_account__order__input--error')

        }
    });


    $(document).on('keyup change', '.gg_account__order__form .gg_account__order__input', function () {

        var checkEmail = true;
        if ($(this).data('id') == 'email') {
            checkEmail = $(this).val().toLocaleLowerCase().match(/\S+@\S+\.\S+/);
        }

        if ($(this).val().length > 0 && checkEmail) {

            $(this).removeClass('gg_account__order__input--error');
        } else {
            $(this).addClass('gg_account__order__input--error');
        }

        var inputs = $(this).closest('.gg_account__order__form').find('.gg_account__order__input');

        if (!inputs.hasClass('gg_account__order__input--error') && checkEmail) {

            $(this).closest('.gg_account__order__form').find('.gg-button[data-id="update-ticket"]').attr('disabled', false);
        } else {
            $(this).closest('.gg_account__order__form').find('.gg-button[data-id="update-ticket"]').attr('disabled', true);
        }
    });

    $(document).on('click', '.gg-button[data-accommodation="cancel"]', function () {
        $('.gg-modal-accommodation').removeClass('visible');
        $('body').removeClass('overflow');
        $('.gg-tickets__form').submit();
    });

    $(document).on('click', '.gg-button[data-accommodation="confirm"]', function () {
        $('.gg-modal-accommodation').removeClass('visible');
        $('body').removeClass('overflow');
    });

    $(document).on('click', '.gg-button[data-id="update-ticket"]', function () {
        var $form = $(this).closest('.gg_account__order__form');
        var ticket = $(this).closest('.gg_account__order');

        var data = {
            full_name: $form.find('.gg_account__order__input[data-id="name"]').val(),
            email: $form.find('.gg_account__order__input[data-id="email"]').val(),
            birthday: $form.find('.gg_account__order__input[data-id="birthday"]').val()
        }
        var type = $form.find('input[name="type"]').val()
        var ageVerification = moment(moment()).diff(data.birthday, 'years', true);

        if (type == 'child' && ageVerification >= 11) {
            $form.find('.gg_account__order__verification-child').removeClass('hidden');
            $form.find('.gg-button[data-id="update-ticket"]').attr('disabled', true);
            return;

        } else if (type == 'adult' && ageVerification <= 12) {
            $form.find('.gg_account__order__verification-adult').removeClass('hidden');
            $form.find('.gg-button[data-id="update-ticket"]').attr('disabled', true);
            return;
        }

        $form.find('.gg_account__order__verification-child').addClass('hidden');
        $form.find('.gg_account__order__verification-adult').addClass('hidden');
        $form.find('.gg-button[data-id="update-ticket"]').attr('disabled', false);


        $form.addClass('submitting');
        fillTicket(ticket, data);

        $.ajax({
            type: 'POST',
            url: wc_add_to_cart_params.ajax_url,
            data: $form.serialize(),
            success: function (response) {
                $form.removeClass('submitting');
            }

        });

    });


    $(document).on('submit', '.gg-tickets__form', function (e) {

        if(showedAccommodation == false)
        {
            $('.gg-modal-accommodation').addClass('visible');
            $('body').addClass('overflow');
            showedAccommodation = true;
            return false;
        }
        var $form = $(this);
        var data = $form.serialize();


        $form.find('.gg-tickets-discount__code').each(function (i, e) {
            if ($(this).val() == '') {
                $(this).attr('disabled', 'disabled');
            }
        });

        // localStorage.setItem('data', data);
        setCookie('data', data, 30);


        $form.find('.gt-tickets__items__saved').each(function (i, e) {
            if($form.find('.gg-tickets__counter__quantity[name="' + $(this).attr('name') +'"]').length)
            {
                $(this).attr('disabled', 'disabled');
            }
        });

        $form.find('.gg-tickets__counter__quantity').each(function (i, e) {
            if ($(this).val() == 0) {
                $(this).attr('disabled', 'disabled');
            }
        });
    });

    //Checking user logged add save data in localstorage
    $(document).on('submit', '.gg-meals__form', function (e) {
        var $form = $(this);
        $form.find('.gg-tickets__counter__quantity').each(function (i, e) {
            if ($(this).val() == 0) {
                $(this).attr('disabled', 'disabled');
            }
        });
        var data = $form.serialize();

        if (data.length) {
            // localStorage.setItem('data', data);
            setCookie('data', data, 30);
        }

        var userCheck = $('body').hasClass('logged-in');
        if (!userCheck) {
            e.preventDefault();
            location = dt_options.home + '/login/?summary=1';
        }


    });


    $(document).on('submit', 'form[data-form="reseller-buy"]', function (e) {

        e.preventDefault();
        var $form = $(this);
        var data = $form.serialize();

        if (data.length) {
            // localStorage.setItem('data', data);
            setCookie('data', data, 30);
        }

        var userCheck = $('body').hasClass('logged-in');
        if (!userCheck) {
            location =             dt_options.home + '/login/?summary=1';
        }
        else
        {
            location = dt_options.home + '/summary?'+data;
        }

    });

    function onGgCounterChanged($counter)
    {
        var $parentGroup = $counter.closest('.gt-tickets__item');

        var disable = true;
        var disableMeals = true;
        var disableInfants = true;
        var isForReseller = getParameterByName('for_reseller') == '1';
        var currency = $('.gt-tickets').attr('data-currency');

        $('.gg-counter__quantity').each(function () {

            if (+$(this).val() > 0 && !$(this).attr('data-apartment')) {
                disable = false;
            }

            var checkClass = $(this).closest('.gg-tickets__counter').hasClass('gg-infants');
            if (!checkClass && +$(this).val() > 0) {
                disableInfants = false;
            }


            //disabled button next only meals page
            if (+$(this).val() > 0 && $(this).closest('form[data-id="addond"]')) {
                disableMeals = false;
            }

            if (!disable && $('.gg-reseller-tickets__item').length) {
                $('.gg-button[data-reseller="buy"]').attr('disabled', false);
            } else if ($('.gg-reseller-tickets__item').length && disable) {
                $('.gg-button[data-reseller="buy"]').attr('disabled', true);
            }

        });

        $('.gg-button[data-id="addons"]').attr('disabled', disableMeals)

        //Disabled select tickets infants if not selected adults or children
        $('.gg-infants').each(function () {

            if (disableInfants) {
                $(this).find('.gg-counter__quantity').val(0);
                $(this).find('.gg-tickets__counter__increment').attr('disabled', true);
                $(this).find('.gg-tickets__counter__decrement').attr('disabled', true);
            } else {
                $(this).find('.gg-tickets__counter__increment').attr('disabled', false);
            }
        });






        // show discount
        if ($('.gt-tickets__items').length || $('.gg-reseller-tickets__item').length) {
            var isChecked = false;
            $counter.closest('.gt-tickets__card-items[data-id="accommodation"]').find('.gg-counter__quantity').each(function () {
                if ($(this).val() > 0) {
                    isChecked = true;
                }
            });


            if (isChecked) {
                $counter.closest('.gt-tickets__item__right').find('.gg_account__order__checkbox').attr('checked', true)
            } else {
                $counter.closest('.gt-tickets__item__right').find('.gg_account__order__checkbox').attr('checked', false)
            }


            totalPrice = 0;
            totalWasPrice = 0;
            totalPercentTag = 0;
            totalDiscount = 0;

            $counter.each(function () {
                amount = +$(this).find('.gg-counter__quantity').val();
                price = +$(this).attr('data-price');
                discount = +$(this).attr('data-discount');
                id = $(this).attr('data-id');


                if (coupon && coupon.type == 'buy1get1free') {
                    totalWasPrice = price;
                    if (amount > 1) {
                        totalPrice = +totalPrice + Math.ceil(amount / 2) * price;
                        totalWasPrice = price * amount;
                        totalPercentTag = Math.floor((1 - totalPrice / totalWasPrice) * 100);

                        $counter.closest('.gg-tickets__item__inner-col').find('.gt-tickets__item__old-price').removeClass('hidden');
                        $counter.closest('.gg-tickets__item__inner-col').find('.gt-tickets__item__tag').removeClass('hidden');
                    } else {
                        $counter.closest('.gg-tickets__item__inner-col').find('.gt-tickets__item__old-price').addClass('hidden');
                        $counter.closest('.gg-tickets__item__inner-col').find('.gt-tickets__item__tag').addClass('hidden');
                    }

                } else if(isForReseller && $(this).closest('.gt-tickets__item[data-category="standard"]').length) {

                    $groupItem = $(this).closest('.gt-tickets__item');

                    var totalAmount =0;
                    $groupItem.find('.gg-tickets__counter__quantity').each(function(){
                        totalAmount += $(this).val()*1;
                    });

                    var discount = getResellerDiscountByTagTotal(id, totalAmount);

                    totalWasPrice = price * amount;
                    totalPrice = totalWasPrice * discount;
                    totalPercentTag = Math.floor((1 - totalPrice / totalWasPrice) * 100);
                    $groupItem.find('.gg-tickets__item__inner-col').each(function()
                    {
                        var $oldPrice = $(this).find('.gt-tickets__item__old-price');
                        var $container = $(this).find('.gt-tickets__card-row');
                        var $tag = $(this).find('.gt-tickets__item__tag');
                        var $price = $(this).find('.gt-tickets__item__price .amount');
                        var amount = $(this).find('.gg-tickets__counter__quantity').val() * 1;
                        var price = $(this).find('.gg-tickets__counter').attr('data-price') * 1;
                        var id = $(this).find('.gg-tickets__counter').attr('data-id') * 1;
                        var totalWasPrice = price * amount;
                        var discount = getResellerDiscountByTagTotal(id, totalAmount);
                        var totalPrice = totalWasPrice * discount;

                        if (totalWasPrice > totalPrice)
                        {
                            var totalPercentTag = Math.floor((1 - totalPrice / totalWasPrice) * 100);
                            $oldPrice.removeClass('hidden').find('.amount').html(formattedPrice(totalWasPrice / exchangeRate[currency],currency));
                            $price.html(formattedPrice(totalPrice / exchangeRate[currency],currency));
                            $tag.removeClass('hidden').find('span').html(totalPercentTag);
                            $container.addClass('dynamic-price');
                        }
                        else
                        {
                            $oldPrice.addClass('hidden');
                            $tag.addClass('hidden');
                            $container.removeClass('dynamic-price');
                        }
                    });


                } else {
                    totalPercentTag = Math.round((1 - (price / (price + discount))) * 100);
                    totalPrice = totalPrice + price * amount;
                    totalWasPrice = totalWasPrice + (price + discount) * amount;
                }

            });

            var $container = $counter.closest('.gg-tickets__item__inner-col').find('.gt-tickets__card-row');
            if (totalPrice) {
                if(totalWasPrice > totalPrice)
                {
                    $container.find('.gt-tickets__item__old-price .amount').html(formattedPrice(totalWasPrice / exchangeRate[currency], currency));
                    $container.find('.gt-tickets__item__tag span').html(totalPercentTag);
                }
                else
                {

                    $container.find('.gt-tickets__item__old-price').addClass('hidden');
                    $container.find('.gt-tickets__item__tag').addClass('hidden');
                }
                $container.find('.gt-tickets__item__price .amount').html(formattedPrice(totalPrice / exchangeRate[currency], currency))
                    .attr('total', totalPrice);

                $container.addClass('dynamic-price');
            } else {
                $container.removeClass('dynamic-price');
            }


        }




        //Disabled next step if not selected tickets
        if (disable || (isForReseller && getTotalAmountToPay()<100)) {
            $('.gg-button[data-grab="tickets"]').attr('disabled', true);
        } else {
            $('.gg-button[data-grab="tickets"]').attr('disabled', false);
        }

    }

    initGGCounter();

    function initGGCounter()
    {
        $('.gg-counter:not(.loaded)').each(function ()
        {
            var $counter = $(this);
            $counter.addClass('loaded');

            $(this).handleCounter({
                minimum: $(this).attr('data-min') ? $(this).attr('data-min') * 1 : 0,
                maximize: $(this).find('.gg-counter__quantity').attr('max') * 1,
                onChange: function ()
                {
                    onGgCounterChanged($counter);

                }
            });
        });
    }

    function getResellerDiscountByTagTotal(id, amount)
    {
        if(resellerDiscountRules[id])
        {
            for(var i in resellerDiscountRules[id])
            {
                if(amount >= resellerDiscountRules[id][i]['product_tag_amount'] * 1)
                {
                    return (1 - resellerDiscountRules[id][i]['discount'] / 100);
                }
            }
        }

        return 1;
    }
    function getTotalAmountToPay()
    {
        var total = 0;
        $('.gt-tickets__items .gg-tickets__counter__quantity').each(function(i,e){
            total += $(this).val() * 1;
        })
        return total;
    }

    //Reseller select date
    $(document).on('click', '.gg-button[data-reseller="buy"]', function (e) {
        e.preventDefault();
        $(this).closest('.gg-reseller-tickets[data-id="reseller-buy"]').find('.gg-modal').addClass('visible')
    });

    $(document).on('click', '.gg-button[data-select="date"]', function() {
        $('.gg-tickets__form[data-form="reseller-buy"]').trigger('submit');
    });

    $(document.body).on('payment_method_selected', function () {
        $('.wc_payment_method').removeClass('active')
        $('input[name="payment_method"]:checked').closest('.wc_payment_method').addClass('active');
    });

    $(document).on('click', '#show_cookie_banner', function (e) {
        e.preventDefault();
        cmplz_set_banner_status('show');

    });
    $(document).on('click', '.gg-tickets-discount__remove[data-id="discount"]', function () {

        applyDiscount('');
    });
    $(document).on('click', '.gg-tickets-discount__apply[data-id="discount"]', function () {

        var inputValue = $(this).closest('.gg-tickets-discount').find('.gg-tickets-discount__code').val();
        applyDiscount(inputValue)

        // var price = $('.gt-tickets__item__price');
        // var oldPrice = $('.gt-tickets__item__old-price')
        //
        // oldPrice.html(price.data('price'))


    });


    //Modal change date fee
    $(document).on('click', '.gg-button[data-next="tickets"]', function () {
        var $container = $(this).closest('.gg-modal__steps');

        $container.find('.gg-modal__step').addClass('hidden');
        $container.find('.gg-modal__step[data-step="tickets"]').removeClass('hidden');
        $container.find('input[name="item_ids[]"]').trigger('change');
    });

    //Change date fee
    $(document).on('submit', 'form[data-form="change-date"]', function (e) {
        e.preventDefault();
        var $form = $(this);

        var item_ids = [];
        $form.find('input[name="item_ids[]"]:checked').each(function () {
            item_ids.push($(this).val());
        });

        var data = {
            action: 'gg_changeDateFee',
            item_ids: item_ids,
            date: $form.find('.gg-calendar__input-tickets[name="date"]').val()
        }
        $.ajax({
            type: 'POST',
            url: wc_add_to_cart_params.ajax_url,
            data: data,
            success: function (response) {
                window.location.href = wc_add_to_cart_params.cart_url + '?addons=1';


            }
        });
    });

    //Change date fee total
    $(document).on('change', 'input[name="item_ids[]"]', function () {

        var $container = $('form[data-form="change-date"]');
        var checkedItems = [];

        $container.find('input[name="item_ids[]"]:checked').each(function () {
            checkedItems.push($(this).val());
        });
        var price = +$container.find('input[name="price"]').val();
        var selectedDate = moment(+$('.first-date-selected.checked').attr('time')).format('ddd, D MMMM Y');
        var oldDate = $(this).closest('.gg_change-date__summary-body').find('.gg_change-date__summary__old-date').attr('data-old-date');

        if (selectedDate == oldDate) {
            $(this).prop('checked', false);
            $(this).prop('disabled', true);
            $(this).closest('.gg_change-date__summary-body').addClass('disabled');
            $(this).closest('.gg_change-date__summary-body').find('.gg_change-date__summary__new-date').html(selectedDate);
            $('.gg_change-date__summary-body .gg_change-date__summary__fee').html(formattedPrice(0));

        } else {
            if ($(this).is(':checked')) {
                $(this).closest('.gg_change-date__summary-body').find('.gg_change-date__summary__new-date').html(selectedDate);
                $(this).closest('.gg_change-date__summary-body').find('.gg_change-date__summary__fee').html(formattedPrice(price));
                $(this).closest('.gg_change-date__summary-body').addClass('active');

            } else {
                $(this).closest('.gg_change-date__summary-body').find('.gg_change-date__summary__new-date').html('No change');
                $(this).closest('.gg_change-date__summary-body').find('.gg_change-date__summary__fee').html(formattedPrice(0));
                $(this).closest('.gg_change-date__summary-body').removeClass('active');
            }
        }

        $('.gg_change-date__total-price span').html(formattedPrice(price * checkedItems.length));


        if (checkedItems.length > 0) {
            $container.find('.gg-button[data-id="pay-and-change"]').attr('disabled', false);
        } else {
            $container.find('.gg-button[data-id="pay-and-change"]').attr('disabled', true);
        }

    });

    $(document).on('click', '.gg-button[data-id="cancel-changes"]', function () {
        $(this).closest('.gg-modal').removeClass('visible');
    });


    // Show modal change date
    $(document).on('click', '.gg-button[data-old-date]', function () {
        var $container = $('.gg_change-date .gg-modal');

        $container.find('.gg_change-date__summary-body').removeClass('disabled');
        $container.find('.gg-checkbox').prop('checked', false);
        $container.find('.gg-checkbox').prop('disabled', false);


        $container.find('.gg-modal__step[data-step="calendar"]').removeClass('hidden');
        $container.find('.gg-modal__step[data-step="tickets"]').addClass('hidden');
        $container.addClass('visible');

        var itemId = +$(this).attr('data-item-id');
        var date = $(this).attr('data-old-date');

        $container.find('.gg-calendar__input-tickets').attr('value', date);

        $('.gg-calendar__input-tickets').data('dateRangePicker').setStart(date);


        $container.find('.gg-checkbox[value="' + itemId + '"]').prop('checked', true);

    });


    $(document).on('click', '.gg-button[data-id="pay"]', function (e) {
        var spiner = $('.gg-summary').find('.wpcf7-spinner')
        spiner.addClass('visible');

        var date = getParameterByName('date');
        var isTickets = window.location.search.includes('tickets');
        tickets['action'] = 'gg_add_tickets';
        tickets['for_reseller'] = getParameterByName('for_reseller');

        // var $inputData = $('#direct_submit input');
        // $inputData.val(JSON.stringify(tickets));
        // $('#direct_submit').submit();

        $.ajax({
            type: 'POST',
            url: wc_add_to_cart_params.ajax_url,
            data: tickets,
            success: function (response) {
                spiner.removeClass('visible');
                window.location.href = isTickets ? wc_add_to_cart_params.cart_url : wc_add_to_cart_params.cart_url + '?addons=1';


            },
            error: function( jqXHR, textStatus, errorThrown ) {
                // updateSummary(
                //     function(){
                //         $('.gg-button[data-id="pay"]').trigger('click');
                //
                //     }
                // );
            }

        });


    });

    $(document).on('click', '.gg_account__order-ticket__download', function (e) {
        // e.preventDefault();
        // var data = {'action': 'gg_ticketPdf'};
        // $.ajax({
        //     type: 'GET',
        //     url: booked_wc_variables.ajaxurl,
        //     data: data,
        //     success: function (response)
        //     {
        //         console.log(response);
        //     }
        //
        // });
        docPDF.html($('.gg_account__order-ticket:first').html(), {
            callback: function (docPDF) {
                docPDF.save('HTML Linuxhint web page.pdf');
            },
            x: 15,
            y: 15,
            width: 170,
            windowWidth: 650
        });

    });

    //Verification of user less than 18 years old
    $(document).on('change', '.user-registration .input-text[data-id="birthday"]', function () {
        // console.log(parseInt($(this).val()));
        var inputDate = new Date($(this).val());
        var currentDate = moment();
        var years = currentDate.diff(inputDate, 'year');

        $('.user-registration-error.adult').remove()
        if (years < 18) {
            $(this).after('<label class="user-registration-error adult">You must be at least 18 years old to register</label>');
            $('.ur-submit-button').attr('disabled', true);
        } else {
            $('.ur-submit-button').attr('disabled', false);
        }


    });

    function updateSummary(onComplete) {
        if (($('.gg-summary').length)) {
            summaryData.action = 'gg_updateSummary';
            $.ajax({
                type: 'POST',
                url: wc_add_to_cart_params.ajax_url,
                data: summaryData,
                dataType: 'json',
                success: function (response) {

                    var isMeals = Object.keys(response.tickets.meals).length == 0;
                    var isTickets = Object.keys(response.tickets.tickets).length == 0;

                    $('.gg-summary__content').html(response.data);
                    window.tickets = response.tickets;

                    if (isMeals && isTickets) {
                        $('.gg-button[data-id="add-more"]')[0].click();
                    }
                    if(onComplete)
                    {
                        onComplete();
                    }
                }
            });
        }


    }


    function getGuestList(data) {
        $.ajax({
            type: 'POST',
            url: wc_add_to_cart_params.ajax_url,
            data: data,
            dataType: 'json',
            success: function (response) {
                if (response.count) {

                    $('.gg-guest-list__table').html(response.data)
                } else {
                    $('.gg-guest-list__table').html('<h2 style="text-align: center">Nothing found</h2>')
                }

            }
        });
    }

    function getAddonsList(data) {

        data.action = 'gg_get_addons_list';
        $.ajax({
            type: 'POST',
            url: wc_add_to_cart_params.ajax_url,
            data: data,
            dataType: 'json',
            success: function (response) {
                if (response.count) {

                    $('.gg-addons-list__table').html(response.data)
                } else {
                    $('.gg-addons-list__table').html('<h2 style="text-align: center">Nothing found</h2>')
                }

            }
        });
    }


    $(document).on('change', '.gg-summary__calculation__ticket-amount', function () {
        summaryData.tickets[$(this).attr('data-id')] = $(this).val();

        updateSummary();
    });

    $(document).on('change', '.gg-summary__calculation__meal-amount', function () {
        summaryData.meals[$(this).attr('data-id') * 1] = $(this).val();
        updateSummary();

    });

    $(document).on('click', '.show-whatsapp-widget', function (e) {
        e.preventDefault();
        $('.contact-widget').addClass('active');
    });

    $(document).on('click', function (e) {
        if ($(e.target).closest('.show-whatsapp-widget').length == 0) {
            $('.contact-widget').removeClass('active');
        }
    });


    function initializeAvailableTickets() {
        var interval = 1000 * 30;
        var watchingPeople = getRandomNumber(1600, 1200);
        var availableTickets = ["available0", "available1", "available2"];
        var isReseller = getCookie('reseller')

        for (var i = 0; i < availableTickets.length; i++) {
            window[availableTickets[i]] = getRandomNumber(297 * (isReseller?100:1), 387 * (isReseller?100:1));
        }

        $('.gt-tickets__amount-available').each(function (i)
        {
            $(this).text(window[availableTickets[i]]);
        });

        $('.gt-tickets__item__watch b').html(watchingPeople);

        setInterval(function () {

            watchingPeople = watchingPeople + getRandomNumber(36, 72);
            $('.gt-tickets__item__watch b').html(watchingPeople);


            $('.gt-tickets__amount-available').each(function (i) {

                window[availableTickets[i]] = window[availableTickets[i]] - getRandomNumber(15, 27);
                $(this).text(window[availableTickets[i]]);
            });


        }, interval);
    }

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function fillTicket(ticket, data) {

        ticket.find('.gg_account__order__input[data-id="name"]').val(data.full_name);
        ticket.find('.gg_account__order__input[data-id="email"]').val(data.email);
        ticket.find('.gg_account__order__input[data-id="birthday"]').val(data.birthday);
        ticket.find('.gg_account__order-ticket__name--valid').text(data.full_name);

        ticket.addClass('gg_account__order--valid');
        ticket.find('.gg_account__order__input').removeClass('gg_account__order__input--error');
        ticket.find('.gg-button[data-id="update-ticket"]').attr('disabled', false);


    }

    function clearTicket(ticket) {
        ticket.find('.gg_account__order__input[data-id="name"]').val('');
        ticket.find('.gg_account__order__input[data-id="email"]').val('');
        ticket.find('.gg_account__order__input[data-id="birthday"]').val('');
        ticket.find('.gg_account__order-ticket__name--valid').text('')

        ticket.removeClass('gg_account__order--valid');
        ticket.find('.gg_account__order__input').addClass('gg_account__order__input--error');
        ticket.find('.gg-button[data-id="update-ticket"]').attr('disabled', true);
    }

    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";domain=.giwagardens.com;path=/";
    }
    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function getParameterByName(name) {

        var qs = location.search.replace('?', '');  // get querystring and remove question marks
        var pairs = qs.split('&');                  // split on ampersand
        var items = {};                             // declare object to store key/value pairs
        for (var i = 0; i < pairs.length; i++) {
            items[pairs[i].split('=')[0]] = pairs[i].split('=')[1];
        }

        return items[name];

    }

    function getValueFromStorageByName(name, key) {
        // var pairs = localStorage.getItem(key).split('&');
        var pairs = getCookie(key).split('&');
        var items = {};
        for (var i = 0; i < pairs.length; i++) {
            items[pairs[i].split('=')[0]] = pairs[i].split('=')[1];
        }

        return items[name]
    }


    function applyDiscount(code) {

        var data = {action: 'gg_add_discount', coupon_code: code}
        return $.ajax({
            type: 'POST',
            url: wc_add_to_cart_params.ajax_url,
            data: data,
            success: function (response) {

                if (response == 'invalid') {
                    $('.gg-tickets-discount').addClass('invalid');
                    return;

                } else {
                    $('.gg-tickets-discount').removeClass('invalid');

                    if ($('.gt-tickets__items').length) {

                        var $form = $('.gg-tickets__form[data-id="form-tickets"]');
                        $form.attr('action', '');
                        $form.trigger('submit');
                        // location.reload();

                    }
                }

            }

        });
    }


    function initializeCalendar() {
        if ($('.gg-calendar__input').length) {

            _initializeCalendar({
                calendar: '.gg-calendar__input',
                container: '.gg-calendar',
                screenWidth: 768,
                open: true,
                showSold: true
            });
        }

    }

    function initializeCalendarTickets() {
        if ($('.gg-calendar__input-tickets').length) {
            _initializeCalendar({
                calendar: '.gg-calendar__input-tickets',
                container: '.gg-calendar',
                screenWidth: 768,
                open: true,
                showSold: true
            });
        }

    }

    function initializeCalendarHome() {

        if ($('.vc_quickbook ').length) {
            _initializeCalendar({
                calendar: '.vc_quickbook__calendar-input',
                container: $(window).width() < 991 ? '.vc_quickbook__calendar-container-mobile' : '.vc_quickbook__calendar-container',
                screenWidth: 1200,
                open: false,
                showSold: true
            }, {
                'datepicker-open': function () {
                    if ($('.vc_quickbook__calendar-footer').length == 0) {
                        $('.vc_quickbook .date-picker-wrapper').append(`
                        <div class="vc_quickbook__calendar-footer">
                          <div class="gg-designation">
                                <div class="gg-designation__item gg-designation__item--closed">
                                    Closed
                                </div>
                                <div class="gg-designation__item gg-designation__item--available">
                                    Available
                                </div>
                                <div class="gg-designation__item gg-designation__item--sold">
                                    Sold out
                                </div>
                             </div>
                          </div>`);

                    }
                }
            });

        }
    }


    function initializeResellerTicketsTabs(p)
    {
        var data = location.search.replace('?', '').replace('action=gg_updateSummary', '')
            + '&action=gg_tickets_reseller_tab&p=' + p
            + '&sort=' + $('.gg_modal-filter select[name="sort"]').val();

        ajaxResellersTickets = $.ajax({
            type: 'GET',
            url: wc_add_to_cart_params.ajax_url,
            dataType: "json",
            data: data,
            success: function (response)
            {

                if(response.data && response.data.length)
                {
                    initializeResellerTicketsTabs(p+1);
                }
                else
                {
                    $('#cheapest_reseller .gt-tickets__items__resellers-loading').hide();
                }

                $('#cheapest_reseller .gt-tickets__items__resellers-loading').before(response.data);

                var $tab = $('.vc_tta-tabs-list a[href="#cheapest_reseller"] .vc_tta-title-text');
                $tab.find('[data-amount]').remove();
                $tab.append(response.tab);

                initializeAvailableTickets();
                initGGCounter();
                refreshCurrency();
                ticketsFilter();

            }
        });
    }


    function initializeTicketsTabs()
    {

        if($('.gg-tickets__form .vc_tta-tabs-list').length && $(window).width() < 768)
        {

            $(document).on('click', '.gg-tickets__form .vc_tta-tabs-list .vc_tta-tab', function(){
                var tab = $(this).find('a').attr('href');
                index = 0;
                if(tab == '#popular_reseller')
                {
                    index = 2;
                }
                else if(tab == '#cheapest_reseller')
                {
                    index = 1;
                }
                ticketsTabs.trigger('to.owl.carousel', index);

            })

            $('.gg-tickets__form .vc_tta-tabs-list .vc_tta-tab').each(function(){
                $(this).width($(window).width() * 0.7);
            });

            var ticketsTabs = $('.gg-tickets__form .vc_tta-tabs-list').addClass('owl-carousel').owlCarousel({
                margin:0,
                touchDrag: true,
                mouseDrag: true,

                autoWidth:true,
                center:true,
                // animateIn: "no-animation",
                // animateOut: "no-animation",
                // video: true,
                // videoWidth: true,
                // videoHeight: 300,
                loop:false,
                slideBy:1,
                items:2,
                // autoplay:true,
                nav:false,
                dots:false,
                // navText: ["<div class='nav-btn prev-slide'></div>", "<div class='nav-btn next-slide'></div>"],
                // responsive: {
                //     0: {
                //         items:1                            },
                //     600: {
                //         items:1                            },
                //     1000: {
                //         items:1                            }
                // }
            });
        }
    }

    function formattedPrice(value, currency='NGN') {
        return (Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(value) + '').replace('NGN ', '₦');
    }


    function initializeGuestListCalendar() {
        if ($('.gg-guest-list').length || $('.gg-addons-list').length) {
            $('.gg-guest-list__filter-item__input[name="date"]').dateRangePicker({
                container: $('.gg-guest-list__calendar__container'),
                format: 'YYYY-MM-DD',
                inline: true,
                alwaysOpen: false,
                singleDate: true,
                singleMonth: $(window).width() < 768,
                showTopbar: false,
                hoveringTooltip: false,
                stickyMonths: true,
                minDays: 1,
                maxDays: 30,
                startOfWeek: 'monday',
                startDate: moment(),
                endDate: moment().add(1, 'year'),
                separator: ' - '

            }).bind('datepicker-closed', function () {
                if ($('.gg-guest-list[data-id="guest-list"]').length) {
                    $('.gg-guest-list__filter-item__input[name="date"]').trigger('input')
                } else if ($('.gg-addons-list[data-id="addons-list"]').length) {
                    $('.gg-addons-list .gg-guest-list__filter-item__input[name="date"]').trigger('input')
                }
            });
        }
    }

    function initializeResellerTicketsCalendar() {
        if ($('.gg-reseller-tickets[data-id="reseller-buy"]').length) {
            _initializeCalendar({
                    calendar: '.gg-calendar__input-reseller',
                    container: '.gg-calendar',
                    screenWidth: 768,
                    open: true,
                    showSold: false
                }
            )
        }

    }

    function _initializeCalendar(options, events) {
        $.ajax({
            type: 'GET',
            url: wc_add_to_cart_params.ajax_url,
            data: {
                action: 'gg_available_days'
            },
            success: function (response) {
                var queryDate = getParameterByName('date');

                var data = response.data;
                var $calendar = $(options.calendar);
                $calendar = $calendar.dateRangePicker({
                    container: options.container,
                    format: 'YYYY-MM-DD',
                    inline: true,
                    alwaysOpen: options.open,
                    singleDate: true,
                    singleMonth: $(window).width() < options.screenWidth,
                    showTopbar: false,
                    hoveringTooltip: false,
                    stickyMonths: true,
                    minDays: 1,
                    maxDays: 30,
                    startOfWeek: 'monday',
                    startDate: moment().add(1, 'days'),
                    endDate: moment().add(1, 'year'),
                    separator: ' - ',
                    beforeShowDay: function (t) {
                        var valid = true;
                        var _class = '';
                        var _tooltip = '';
                        var date = moment(t).format("Y-MM-D");
                        // console.log(date, data);
                        if (data[date] == 'available') {
                            return [true, 'available', _tooltip];
                        } else if (data[date] == 'booked' && !options.showSold) {
                            return [true, 'available', _tooltip];
                        } else if(data[date] == 'booked' && options.showSold) {
                            return [false, 'booked', _tooltip];
                        // } else if(data[date] == 'sold' && options.showSold) {
                        //     return [false, 'sold', _tooltip];
                        }
                        else {
                            return [false, 'not_avaiable', _tooltip];
                        }
                    },

                });


                for (event in events) {
                    $calendar.bind(event, events[event]);
                }

                if (!queryDate && $('.gg-calendar').attr('data-id') !== 'ticket-page') {

                    $('.gg-calendar').find('.available:first').trigger('click');
                }
            }

        });
    }

    function initializeTimer() {
        if ($('.gt-tickets__items').length) {

            var now = new Date().getTime();
            var remainingSeconds = 599;

            var time = remainingSeconds;
            var timerId = 0;

            function countDown() {
                var minutes = Math.floor(time / 60)
                var seconds = time % 60;
                seconds = seconds < 10 ? '0' + seconds : seconds;

                $('.gg-tickets__timer__minutes .gg-tickets__timer__number').html('0' + minutes)
                $('.gg-tickets__timer__seconds .gg-tickets__timer__number').html(seconds)

                if (time <= 0) {
                    clearInterval(timerId)
                    window.location.reload();

                }

                time--;
            }

            timerId = setInterval(countDown, 1000)
        }
    }

    function initializeCounter() {
        $.fn.handleCounter = function (options) {
            var $input,
                $btnMinus,
                $btnPlugs,
                minimum,
                maximize,
                writable,
                onChange,
                onMinimum,
                onMaximize;
            var $handleCounter = this
            $btnMinus = $handleCounter.find('.counter-minus')
            $input = $handleCounter.find('input')
            $btnPlugs = $handleCounter.find('.counter-plus')
            var defaultOpts = {
                writable: true,
                minimum: 1,
                maximize: null,
                onChange: function () {
                },
                onMinimum: function () {
                },
                onMaximize: function () {
                }
            }
            var settings = $.extend({}, defaultOpts, options)
            minimum = settings.minimum
            maximize = settings.maximize
            writable = settings.writable
            onChange = settings.onChange
            onMinimum = settings.onMinimum
            onMaximize = settings.onMaximize
            if (!$.isNumeric(minimum)) {
                minimum = defaultOpts.minimum
            }
            if (!$.isNumeric(maximize)) {
                maximize = defaultOpts.maximize
            }
            var inputVal = $input.val()
            if (isNaN(parseInt(inputVal))) {
                inputVal = $input.val(0).val()
            }
            if (!writable) {
                $input.prop('disabled', true)
            }

            changeVal(inputVal)
            $input.val(inputVal)
            $btnMinus.click(function () {
                var num = parseInt($input.val())
                if (num > minimum) {
                    $input.val(num - 1)
                    changeVal(num - 1)
                }
            })
            $btnPlugs.click(function () {
                var num = parseInt($input.val())
                if (maximize == null || num < maximize) {
                    $input.val(num + 1)
                    changeVal(num + 1)
                }
            })
            var keyUpTime

            $input.blur(function () {
                var num = $input.val()
                if (num == '') {
                    num = minimum
                    $input.val(minimum)
                }
                var reg = new RegExp("^[\\d]*$")
                if (isNaN(parseInt(num)) || !reg.test(num)) {
                    $input.val($input.data('num'))
                    changeVal($input.data('num'))
                } else if (num < minimum) {
                    $input.val(minimum)
                    changeVal(minimum)
                } else if (maximize != null && num > maximize) {
                    $input.val(maximize)
                    changeVal(maximize)
                } else {
                    changeVal(num)
                }
            });

            $input.keyup(function () {
                clearTimeout(keyUpTime)
                keyUpTime = setTimeout(function () {
                    var num = $input.val()
                    if (num == '' && minimum == 0) {
                        num = minimum;
                    }
                    else if (num == '') {
                        num = minimum
                        $input.val(minimum)
                    }
                    var reg = new RegExp("^[\\d]*$")
                    if (isNaN(parseInt(num)) || !reg.test(num)) {
                        $input.val($input.data('num'))
                        changeVal($input.data('num'))
                    } else if (num < minimum) {
                        $input.val(minimum)
                        changeVal(minimum)
                    } else if (maximize != null && num > maximize) {
                        $input.val(maximize)
                        changeVal(maximize)
                    } else {
                        changeVal(num)
                    }
                }, 300)
            })
            $input.focus(function () {
                var num = $input.val()
                if (num == 0) $input.select()
            })

            function changeVal(num) {
                $input.data('num', num)
                $btnMinus.prop('disabled', false)
                $btnPlugs.prop('disabled', false)
                if (num <= minimum) {
                    $btnMinus.prop('disabled', true)
                    onMinimum.call(this, num)
                } else if (maximize != null && num >= maximize) {
                    $btnPlugs.prop('disabled', true)
                    onMaximize.call(this, num)
                }
                onChange.call(this, num)
            }

            return $handleCounter
        };
    }


    $(window).on('beforeunload', function(){
        $('.loader-wrapper').show();
    });

    setTimeout(function(){
        $('.loader-wrapper').hide();
    }, 1000);
});

