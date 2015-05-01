$(document).ready(function() {
	var navlinks = $(".navlinks");
	$(window).resize(function(){  
		var w = $(window).width() / parseFloat($("body").css("font-size"));;  
		if(w > 68.75 && navlinks.css('display') == "none") {  
			navlinks.removeAttr('style');  
		}  
	});   	
	$(".navlinks li, .expand").hover(function(){
		$(this).css("color", "orange")
		}, 
		function () {
		$(this).css("color", "black");
		});
	$(".expand").click(function(event) {
		event.stopPropagation();
		navlinks.slideToggle();
	});
	
// make entire li clickable for displaying link content	
//	$(".navlinks li").click(function(){
//		window.location.href=$(this).find("a").attr("href");
//		return false;
//	});
	
	$("#station_locator").click(function(){
		$(".route-search").hide();
		$(".station-search").show();
	});
	$("#route_planner").click(function(){
		$(".station-search").hide();
		$(".route-search").show();
	});
	
	$(document).click(function(){
		if (navlinks.css("display") != "none" && $(".expand").css("display") != "none") {
			navlinks.slideToggle();
		}
		
	});

$("#info").click(function(e){
	modal.openInfo();
	e.preventDefault();
});

$("#contact").click(function(e){
	modal.openContact();
	e.preventDefault();
});

	var modal = (function(){
		var 
		method = {},
		$overlay = $("#overlay_bg"),
		$modal = $("#modal_container"),
		$close = $("#close");

		// Center the modal in the viewport
		method.center = function () {
			var top, left;

			top = Math.max($(".map").height() - $modal.outerHeight(), 0) / 2;
			left = Math.max($(".map").width() - $modal.outerWidth(), 0) / 2;

			$modal.css({
				top:top + $(window).scrollTop(), 
				left:left + $(window).scrollLeft()
			});
		};

		// Open the modal
		method.openInfo = function (settings) {
			// $content.empty().append(settings.content);
				// $modal.css({
				// width: settings.width || 'auto', 
				// height: settings.height || 'auto'
			// });
			method.close();
			method.center();
			$(window).bind('resize.modal', method.center);
			$modal.show();
			$("#info_content").show();
			$("#info_header").show();
			$overlay.show();
		};
		
		method.openContact = function (settings) {
			method.close();
			method.center();
			$(window).bind('resize.modal', method.center);
			$modal.show();
			$("#contact_content").show();
			$("#contact_header").show();
			$overlay.show();
		};
		
		method.openAvail = function (settings) {
			method.close();
			method.center();
			$(window).bind('resize.modal', method.center);
			$modal.show();
			$("#avail_content").show();
			$overlay.show();
		}
		
		
		// Close the modal
		method.close = function () {
			$modal.hide();
			$("#info_content").hide();
			$("#info_header").hide();
			$("#contact_content").hide();
			$("#contact_header").hide();
			$("#avail_content").hide();
			$("#success").hide();
			$overlay.hide();
			// $content.empty();
			$(window).unbind('resize.modal');
		};

		// Generate the HTML and add it to the document
		// $overlay = $('<div id="overlay"></div>');
		// $modal = $('<div id="modal"></div>');
		// $content = $('<div id="content"></div>');
		// $close = $('<a id="close" href="#">close</a>');

		$modal.hide();
		$overlay.hide();
		// $modal.append($content, $close);

		// $(document).ready(function(){
			// $('body').append($overlay, $modal);						
		// });

		$close.click(function(e){
			e.preventDefault();
			method.close();
		});
		
		$overlay.click(function(e){
			e.preventDefault();
			method.close();
		})

		return method;
	}());

$("#contact_form").submit(function() {
	var contact_form = $("#contact_form");
	var contact_name = $("#contact_name").val();
	var email = $("#email").val();
	var subject = $("#subject").val();
	var message = $("#message").val();
	var dataString = 'contact_name='+ contact_name + '&email=' + email + '&subject=' + subject + '&message=' + message;
	
	if(!contact_form[0].checkValidity())
	{
	/* 	$('.success').fadeOut(200).hide();
		$('.error').fadeOut(200).show(); */
		contact_form.submit();
	}
	else
	{
		$.ajax({
			type: "POST",
			url: "evj_contact_form.php",
			data: dataString,
			success: function(){
				$('#contact_content').fadeOut(200).hide();
				$('#success').fadeIn(200).show();
				
			}
		});
	}
	return false;
});
	
});

function testFunc(){
	alert("hello");
}
