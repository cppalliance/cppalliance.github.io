$(document).ready(function() {
		$('.navbar-nav a').on('click', function(e) {
			if ($(window).width < 700){
				$('#navbarResponsive').addClass("show");
			}
			else {
				$('#navbarResponsive').removeClass("show");
			}
		});
		$('.navbar-nav a').bind('click', function(e) {
				//e.preventDefault(); // prevent hard jump, the default behavior
				var target = $(this).attr("href"); // Set the target as variable

				// perform animated scrolling by getting top-position of target-element and set it as scroll target
				$('html, body').stop().animate({
						scrollTop: $(target).offset().top
				}, 2000, function() {
						location.hash = target; //attach the hash (#jumptarget) to the pageurl
				});

				return false;
		});
});

$(window).scroll(function() {
		var scrollDistance = $(window).scrollTop();

		// Show/hide menu on scroll
		//if (scrollDistance >= 850) {
		//		$('nav').fadeIn("fast");
		//} else {
		//		$('nav').fadeOut("fast");
		//}
	
		// Assign active class to nav links while scolling
		$('.innerSection').each(function(i) {
				if ($(this).position().top <= scrollDistance) {
						$('.navbar-nav a.active').removeClass('active');
						$('.navbar-nav a').eq(i).addClass('active');
				}
		});
}).scroll();