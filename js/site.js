var active_form_element;

$(document).ready(function()
{	
	if($('body').hasClass('enter'))
	{
		load_sweepstakes_entry_form();
	}

	if($('body').hasClass('admin'))
	{
		init_admin_form();
	}

	$(window).hashchange( function(){
		check_hash();
	});

	$(window).hashchange();

	//$('#sweeps').fadeOut();
	//$('#thank-you').delay(300).fadeIn();
});

function check_hash()
{
	if(window.location.hash === "#enter")
	{
		load_sweepstakes_entry_form();
	}
}

function set_sweepstakes_cookie(cookieName,cookieValue,nDays) {
 var today = new Date();
 var expire = new Date();
 if (nDays==null || nDays==0) nDays=1;
 expire.setTime(today.getTime() + 3600000*24*nDays);
 document.cookie = cookieName+"="+escape(cookieValue)
                 + ";expires="+expire.toGMTString();
}

function load_sweepstakes_entry_form()
{
	custom_form_focus();

	$("body").keyup(function(e) {
		if(e.keyCode == 13) {
			$('#sweeps #submit').click();
		}
	});

	$('[name=phone]').mask("(999) 999-9999? x99999");

	$('#stateDD').selectmenu().change(function()
	{
		$('#stateDD-button .ui-selectmenu-status').html($('#stateDD').selectmenu("value"));
	});

	$('#genderDD').selectmenu().change(function()
	{

		$('#genderDD-button .ui-selectmenu-status').html($('#genderDD').selectmenu("value").toUpperCase());
	});

	$('#cableDD').selectmenu();
}

function custom_form_focus()
{
	$('input, select').focus(function(e)
	{
		update_form_focus($(this));
	});

	$('label').click(function(e)
	{
		update_form_focus($(this));
	});

	$('#genderDD-menu, #genderDD-button').click(function(e)
	{
		active_form_element = $('#genderDD-menu');
		update_form_focus($('#genderDD-menu'));
	});

	$('#cableDD-menu, #cableDD-button').click(function(e)
	{
		active_form_element = $('#cableDD-menu');
		update_form_focus($('#cableDD-menu'));
	});

	check_focus = setInterval('check_active_element()', 100);
}

function update_form_focus(el)
{
	$('label').removeClass('active');
	$(el).closest('label:not(.no-highlight)').addClass('active');
}

function check_active_element()
{
	if(active_form_element !== document.activeElement)
	{
		if( $(document.activeElement).attr('id') == 'stateDD-button' ||
			$(document.activeElement).attr('id') == 'genderDD-button' ||
			$(document.activeElement).attr('id') == 'genderDD-button')
		{
			
			active_form_element = document.activeElement;
			update_form_focus($(document.activeElement));
		}
	}
}

function show_prizes(){
	$("#foreground").animate({
			      left: 548
			    }, 900);
	_gaq.push(['_trackEvent', 'Sweeps-PageChange', 'ViewPrize']);
}

function hide_prizes(){
	$("#foreground").animate({
			      left: 0
			    }, 900);
	_gaq.push(['_trackEvent', 'Sweeps-PageChange', 'BackFromPrize']);
}

function enter_sweeps(){
	$("#foreground").animate({
			      left: -548
		}, 1000);
	_gaq.push(['_trackEvent', 'Sweeps-PageChange', 'EnterSweeps']);
}

function hide_email_error(){
	$('#sweeps').removeClass('email-error');
	_gaq.push(['_trackEvent', 'Sweeps-Errors', 'DuplicateEntryError']);
}

function hide_missing_error(){
	$('#sweeps').removeClass('missing-error');
	_gaq.push(['_trackEvent', 'Sweeps-Errors', 'FieldError']);
}

function submit_sweepstakes_form()
{
	if(!$('#sweeps input[type="submit"]').hasClass('disabled'))
	{
		$('#sweeps input[type="submit"]').addClass('disabled').attr('disabled','true');
		$('#sweeps .error').removeClass('error');

		data = $('#sweeps').serialize();
		data += '&posting=true';
		$.post(site_url + 'enter', data, function(response)
		{
			response = $.parseJSON(response);
			if(response.errors)
			{
				//errors
				show_errors(response.errors);
			}
			if(response.success)
			{
				$("#foreground").animate({
			      left: -1096
			    }, 900);
				
			    set_sweepstakes_cookie("hallmark_sweepstakes_entry",$('#email_address').val(),1);
				_gaq.push(['_trackEvent', 'Sweeps-PageChange', 'SubmitSweeps']);
			}
		});
	}
}

function show_errors(errors)
{
	$('.error').removeClass('error');
	$('#sweeps').removeClass('email-error');
	$('#sweeps').removeClass('missing-error');

	var missing_header = '<img src="/images/missing_top.png" style="float:left;"><div class="expanding_bg"><span class="error_title">Please fill out the highlighted<br>fields before you submit.</span>';
	var missing_footer = '<br><a href="javascript:hide_missing_error();"><img src="/images/ok_button.png" class="ok_button"></a></div><img src="/images/missing_bottom.png" style="float:left;">'
	var missing_fields = '';

	$.each(errors, function(key, value) {
		$('[name="' + key + '"]').closest('label').addClass('error');
		missing_fields = missing_fields + '<li>' + value + '</li>';
	});

	$('#missing').html(missing_header + missing_fields + missing_footer);

	if(errors.email_address == 'Sorry. Only one entry permitted per day.')
	{
		$('#sweeps').addClass('email-error');
	} else {
		$('#missing')
		$('#sweeps').addClass('missing-error');
	}

	$('.disabled').removeClass('disabled').removeAttr('disabled');
}

function init_admin_form()
{
	$('.datepicker').datetimepicker({
		timeFormat: 'h:mmtt',
		ampm: true
	});
}