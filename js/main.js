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

  var tooltipLinks = document.querySelectorAll('.generated-content a[title], .tooltip-enabled a[title], a.tooltip-hint');

  var openTooltipWrapper = null;

  function showTooltip(wrapper) {
    if (!wrapper) {
      return;
    }

    if (openTooltipWrapper && openTooltipWrapper !== wrapper) {
      hideTooltip(openTooltipWrapper);
    }

    wrapper.classList.add('is-visible');
    openTooltipWrapper = wrapper;
  }

  function hideTooltip(wrapper) {
    if (!wrapper) {
      return;
    }

    wrapper.classList.remove('is-visible');

    if (openTooltipWrapper === wrapper) {
      openTooltipWrapper = null;
    }
  }

  forEach(tooltipLinks, function(index, link) {
    var tooltipText = link.getAttribute('title');

    if (!tooltipText || !tooltipText.trim()) {
      return;
    }

    tooltipText = tooltipText.trim();

    var wrapper = link.parentElement;

    if (!wrapper || !wrapper.classList.contains('tooltip-static-wrapper')) {
      wrapper = document.createElement('span');
      wrapper.className = 'tooltip-static-wrapper';
      link.insertAdjacentElement('beforebegin', wrapper);
      wrapper.appendChild(link);
    }

    var tooltipSpan = wrapper.querySelector('.tooltip-static');

    if (!tooltipSpan) {
      tooltipSpan = document.createElement('span');
      tooltipSpan.className = 'tooltip-static';
      wrapper.insertBefore(tooltipSpan, wrapper.firstChild);
    }

    tooltipSpan.textContent = tooltipText;
    tooltipSpan.setAttribute('role', 'tooltip');

    var tooltipId = tooltipSpan.id;

    if (!tooltipId) {
      tooltipId = 'tooltip-' + index + '-' + Math.random().toString(36).slice(2, 8);
      tooltipSpan.id = tooltipId;
    }

    link.setAttribute('data-tooltip', tooltipText);
    link.removeAttribute('title');
    link.setAttribute('aria-describedby', tooltipSpan.id);
    link.classList.add('tooltip-trigger');

    link.addEventListener('mouseenter', function() {
      showTooltip(wrapper);
    });

    link.addEventListener('mouseleave', function() {
      hideTooltip(wrapper);
    });

    link.addEventListener('focus', function() {
      showTooltip(wrapper);
    });

    link.addEventListener('blur', function() {
      hideTooltip(wrapper);
    });

    link.addEventListener('touchstart', function(e) {
      e.preventDefault();

      if (wrapper.classList.contains('is-visible')) {
        hideTooltip(wrapper);
      } else {
        showTooltip(wrapper);
      }
    }, { passive: false });
  });

  document.addEventListener('touchstart', function(event) {
    if (!openTooltipWrapper) {
      return;
    }

    if (!openTooltipWrapper.contains(event.target)) {
      hideTooltip(openTooltipWrapper);
    }
  });

});
