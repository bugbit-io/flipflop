function flipFlop(useOptions) {

	'use strict';

	useOptions = useOptions || {};

	var defaultOptions = {
		container: document.body,
		sections: document.getElementsByTagName('section'),
		nav: document.getElementById('flip_flop_nav'),
		mouseDrag: false,
		disableOnMax: 960
	};

	if (document.documentMode) {
		if (!Object.assign) {
			Object.defineProperty(Object, 'assign', {
				enumerable: false,
				configurable: true,
				writable: true,
				value: function (target) {
					'use strict';
					if (target === undefined || target === null) {
						throw new TypeError('Cannot convert first argument to object');
					}

					var to = Object(target);
					for (var i = 1; i < arguments.length; i++) {
						var nextSource = arguments[i];
						if (nextSource === undefined || nextSource === null) {
							continue;
						}
						nextSource = Object(nextSource);

						var keysArray = Object.keys(Object(nextSource));
						for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
							var nextKey = keysArray[nextIndex];
							var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
							if (desc !== undefined && desc.enumerable) {
								to[nextKey] = nextSource[nextKey];
							}
						}
					}
					return to;
				}
			});
		}
	}

	var options = Object.assign({}, defaultOptions, useOptions);

	var scrollTop,
		timeOut,
		sectionPositions = [],
		appendDot = '<div class="dot"></div>',
		dotCount = '',
		navDots,
		currentSection,
		sectionHeight,
		halfSection,
		isDown = false,
		startScroll,
		scrollDown,
		isScrollUp,
		ticking = false,
		currentTime,
		time,
		wait = false,
		saveBodyTop,
		allLinks;

	function refreshSectionPositions() {

		sectionPositions = [];

		scrollTop = -options.sections[0].getBoundingClientRect().top;

		var i;
		for (i = 0; i < options.sections.length; i++) {

			sectionPositions.push(options.sections[i].getBoundingClientRect().top + scrollTop);
		}

	};

	function getPositionIndex() {

		sectionHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		halfSection = sectionHeight / 2;
		scrollTop = -options.sections[0].getBoundingClientRect().top;

		for (var i = 0; i < options.sections.length; i++) {
			if (sectionPositions[i] + halfSection > scrollTop && sectionPositions[i] - halfSection < scrollTop) {
				currentSection = i;
			}
		}

	};

	function getDots() {

		if (options.nav) {

			navDots = options.nav.getElementsByClassName('dot');

			if (navDots.length == 0) {
				var i;
				for (i = 0; i < options.sections.length; i++) {

					dotCount = dotCount + appendDot;
				}

				options.nav.innerHTML = dotCount;
				navDots = options.nav.getElementsByClassName('dot');
			}
		}

	};

	function setDotNavigation() {

		if (navDots) {
			if (navDots.length > 0 && currentSection <= navDots.length - 1 && !navDots[currentSection].classList.contains('on')) {
				for (var i = 0; i < navDots.length; i++) {
					navDots[i].classList.remove('on');
				}
				getPositionIndex();
				navDots[currentSection].classList.add('on');
			} else if (navDots.length > 0 && currentSection > navDots.length - 1 && navDots[(navDots.length - 1)].classList.contains('on')) {
				navDots[(navDots.length - 1)].classList.remove('on');
			}
		}

	};

	function onWindowResize() {

		refreshSectionPositions();
		getPositionIndex();
		setDotNavigation();
		scrollToY(sectionPositions[currentSection], 300, 'easeOutQuint');
		if (!iOS()) {
			try {
			// try to use localStorage
			sessionStorage.setItem('saveBodyTop', sectionPositions[currentSection]);
			} catch (e) {
				// there was an error so...
				console.log('local storage is unavailable');
			}
		}
	};


	// http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/ ====
	window.requestAnimFrame = (function () {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function (callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	function scrollToY(scrollTargetY, speed, easing) {

		var scrollY,
			scrollTargetY = scrollTargetY || 0,
			speed = speed || 2000,
			easing = easing || 'easeOutSine',
			currentTime = 0;

		scrollY = -options.sections[0].getBoundingClientRect().top;

		// min time .1, max time .8 seconds
		time = Math.max(.1, Math.min(Math.abs(scrollY - scrollTargetY) / speed, .8));

		// // add animation loop
		function tick() {
			currentTime += 1 / 60;

			var p = currentTime / time,
				t = easingEquations[easing](p);

			if (p < 1) {
				requestAnimFrame(tick);
				options.container.scrollTop = scrollY + ((scrollTargetY - scrollY) * t);
			} else {
				options.container.scrollTop = scrollTargetY;
			}

			getPositionIndex();
			setDotNavigation();

		}

		// call it once to get started
		tick();

		if (!iOS()) {
			try {
				// try to use localStorage
				sessionStorage.setItem('saveBodyTop', sectionPositions[currentSection]);
			} catch (e) {
				// there was an error so...
				console.log('local storage is unavailable');
			}
		}

	};

	// easing equations from https://github.com/danro/easing-js/blob/master/easing.js
	var easingEquations = {
		easeOutSine: function (pos) {
			return Math.sin(pos * (Math.PI / 2));
		},
		easeInOutSine: function (pos) {
			return (-0.5 * (Math.cos(Math.PI * pos) - 1));
		},
		easeOutQuint: function (pos) {
			return (Math.pow((pos - 1), 5) + 1);
		},
		easeInOutQuint: function (pos) {
			if ((pos /= 0.5) < 1) {
				return 0.5 * Math.pow(pos, 5);
			}
			return 0.5 * (Math.pow((pos - 2), 5) + 2);
		}
	};

	function debounce(func, wait, immediate) {
		var timeout;
		return function () {
			var context = this, args = arguments;
			var later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	/* =================== CHECK FOR CSS SNAP POINTS =================== */
	// mouse wheel only
	function runOnScroll(event) {

		if (options.disableOnMax <= Math.max(document.documentElement.clientWidth, window.innerWidth || 0)) {

			if (document.documentMode) {

				if (event.wheelDelta > 0) {
					isScrollUp = true;
				}
				else {
					isScrollUp = false;
				}

			} else {

				if (event.deltaY > 0) {
					isScrollUp = false;
				}
				else {
					isScrollUp = true;
				}
			}

			getPositionIndex();

			var newSection;

			if (isScrollUp) {
				newSection = currentSection < 1 ? 0 : currentSection - 1;

				// fix for scroll up jumping to bottom of new section (which is top)
				if (newSection === currentSection) {
					return;
				} else if (scrollTop <= sectionPositions[currentSection] + 100) {
					scrollToY((sectionPositions[newSection + 1] - sectionHeight), 300, 'easeOutQuint');
					currentSection = newSection;
				}

			} else {
				newSection = currentSection > options.sections.length - 2 ? options.sections.length - 1 : currentSection + 1;

				if (scrollTop >= (sectionPositions[currentSection + 1] - sectionHeight)) {
					scrollToY(sectionPositions[newSection], 300, 'easeOutQuint');
					currentSection = newSection;
				}
			}

			this.oldScroll = this.scrollY;
		}
	};

	var debounceImmediately = debounce(runOnScroll, 250, true);

	window.addEventListener('onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll', debounceImmediately, { passive: true });

	// }
	/* =================== END CSS SNAP POINTS =================== */

	function mouseGrab() {

		if (options.mouseGrab) {

			options.container.addEventListener('mousedown', function (e) {
				isDown = true;
				startScroll = e.pageY;
				scrollDown = -options.sections[0].getBoundingClientRect().top;
			});
			options.container.addEventListener('mouseleave', function () {
				isDown = false;
				setDotNavigation();
				if (!iOS()) {
						try {
						// try to use localStorage
						sessionStorage.setItem('saveBodyTop', sectionPositions[currentSection]);
					} catch (e) {
						// there was an error so...
						console.log('local storage is unavailable');
					}
				}
			});
			options.container.addEventListener('mouseup', function (e) {
				isDown = false;
				setDotNavigation();
				scrollToY(sectionPositions[currentSection], 300, 'easeOutQuint');
				if (!iOS()) {
					try {
						// try to use localStorage
						sessionStorage.setItem('saveBodyTop', sectionPositions[currentSection]);
					} catch (e) {
						// there was an error so...
						console.log('local storage is unavailable');
					}
				}
			});
			var wait = false;
			options.container.addEventListener('mousemove', function (e) {
				e.stopPropagation();
				if (!isDown) return; // stop function if mouse is up
				var y = e.pageY;
				var walk = (y - startScroll) * 3;

				options.container.scrollTop = scrollDown - walk;

			});
		}
	};

	function clickNav() {
		if (navDots && !iOS()) {

			for (var i = 0; i < navDots.length; i++) {
				(function (index) {
					navDots[i].onclick = function () {

						scrollToY(sectionPositions[index], 300, 'easeOutQuint');

					}
				})(i);
			}
		}

		document.onkeydown = keyPress;

		function keyPress(e) {

			e = e || window.event;

			var newSection;

			if (e.keyCode == '38') {
				// up arrow
				newSection = currentSection < 1 ? 0 : currentSection - 1;
				if (sectionPositions[newSection] == sectionPositions[currentSection]) {
					newSection = currentSection < 2 ? 0 : currentSection - 2;
				}
				scrollToY(sectionPositions[newSection], 300, 'easeOutQuint');
			}
			else if (e.keyCode == '40') {
				// down arrow
				newSection = currentSection > options.sections.length - 2 ? options.sections.length - 1 : currentSection + 1;
				scrollToY(sectionPositions[newSection], 300, 'easeOutQuint');
			} else if (e.ctrlKey && e.keyCode === 116) {
				sessionStorage.clear('saveBodyTop');
			} else if (e.ctrlKey && e.shiftKey && e.keyCode === 82) {
				sessionStorage.clear('saveBodyTop');
			}

			currentSection = newSection;
		};


	};

	window.addEventListener('resize', debounce(onWindowResize, 250, false));

	options.container.addEventListener('scroll', function () {

		scrollTop = -options.sections[0].getBoundingClientRect().top;

		if (!wait) {

			getPositionIndex();
			setDotNavigation();

			if (!iOS()) {
				try {
					// try to use localStorage
					sessionStorage.setItem('saveBodyTop', sectionPositions[currentSection]);
				} catch (e) {
					// there was an error so...
					console.log('local storage is unavailable');
				}
			}
			wait = true;

			setTimeout(function () { wait = false; }, 200);
		}

	}, { passive: true });

	function clearScrollOnLink() {

		allLinks = document.getElementsByTagName('a') || null;

		if (allLinks) {
			for (var i = 0, len = allLinks.length; i < len; i++) {
				allLinks[i].addEventListener('click', function () {
					sessionStorage.clear('saveBodyTop');
				}, false);
			}
		}
	}

	function removeHiddenSections() {

		var i;
		for (i = 0; i < options.sections.length; i++) {

			if (options.sections[i].offsetWidth > 0 && options.sections[i].offsetHeight > 0) { } else {
				options.sections[i].parentNode.removeChild(options.sections[i]);
			}
		}

	}

	function iOS() {

		var iDevices = [
			'iPad Simulator',
			'iPhone Simulator',
			'iPod Simulator',
			'iPad',
			'iPhone',
			'iPod'
		];

		if (!!navigator.platform) {
			while (iDevices.length) {
				if (navigator.platform === iDevices.pop()) { return true; }
			}
		}

		return false;
	}

	function runOnLoad() {

		if (!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
			scrollTop = sessionStorage.getItem('saveBodyTop');
		}
		options.container.scrollTop = scrollTop;

		removeHiddenSections();

		refreshSectionPositions();
		getPositionIndex();
		getDots();
		setDotNavigation();
		clickNav();
		mouseGrab();

		clearScrollOnLink();

		scrollToY(sectionPositions[currentSection], 300, 'easeOutQuint');

	};

	runOnLoad();

};
