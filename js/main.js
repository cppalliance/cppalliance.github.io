document.addEventListener('DOMContentLoaded', function(event) {
  var navHamburger = document.getElementById('nav-hamburger');
  var navItems = document.getElementById('nav-items');
  var body = document.getElementById('body');
  var listItems = document.querySelectorAll('.nav-link-mobile');

  function forEach(array, callback, scope) {
    for (var i = 0; i < array.length; i++) {
      callback.call(scope, i, array[i]);
    }
  };

  function hideMobileDropdownMenu() {
    navHamburger.classList.remove('active');
    navItems.classList.remove('active');
    body.classList.remove('locked');
  }

  navHamburger.addEventListener('click', function(e) {
    navHamburger.classList.toggle('active');
    navItems.classList.toggle('active');
    body.classList.toggle('locked');
  });

  window.addEventListener('resize', function() {
    hideMobileDropdownMenu();
  });

  forEach(listItems, function (index, item) {
    item.addEventListener('click', function(e) {
      if (window.innerWidth < 1024) {
        hideMobileDropdownMenu();
      }
    })
  });

});

