window.onload = function() {
	var mainView = document.getElementById('view');
	var sideNav = document.getElementById('side-nav');
	var navItems = sideNav.getElementsByTagName('li');
	var loadingView = new LoadingView();

	for (var i = 0; i < navItems.length; i++) {
		var navItemLink = navItems[i].getElementsByTagName('a')[0];
		navItemLink.href = "#" + navItemLink.href;
		add(navItems[i], 'click', function() {
			navItems = sideNav.getElementsByTagName('li');
			for (var i = 0; i < navItems.length; i++) {
				navItems[i].className = "";
			}
			this.className = "selected";
			while (mainView.lastChild) {
				mainView.removeChild(mainView.lastChild);
			}
			var iframe = document.createElement("iframe");
			iframe.src = this.getElementsByTagName('a')[0].href.split('#')[1];
			iframe.scrolling = "auto";
			iframe.frameBorder = "0";
			iframe.width = "100%";
			iframe.height = "100%";
			iframe.style.display = "none";
			loadingView.insert(mainView, true);
			mainView.appendChild(iframe);

			add(iframe, "load", function() {
				if (true) {
					loadingView.remove();
					iframe.style.display = "block";
				} else {
					setTimeout(function() {
						loadingView.remove();
						iframe.style.display = "block";
					}, 1000);
				}
			});
		});
	};
};

function LoadingView() {
	var self = this;

	self.view = document.createElement('div');
	self.view.className = "floatingBarsG";
	self.view.innerHTML = '<div class="blockG" id="rotateG_01"></div><div class="blockG" id="rotateG_02"></div><div class="blockG" id="rotateG_03"></div><div class="blockG" id="rotateG_04"></div><div class="blockG" id="rotateG_05"></div><div class="blockG" id="rotateG_06"></div><div class="blockG" id="rotateG_07"></div><div class="blockG" id="rotateG_08"></div>';

	self.container = document.createElement('div');
	self.container.className = "floatingBarsCont";

	var parent;
	var showingContainer;

	self.setup = function() {
	}
	self.insert = function(container, showBorder) {
		parent = container;
		showingContainer = showBorder;
		if (showBorder) {
			self.container.appendChild(self.view);
			parent.appendChild(self.container);
		} else {
			parent.appendChild(self.view);
		}
	}
	self.remove = function() {
		if (showingContainer) {
			parent.removeChild(self.container);
			self.container.removeChild(self.view);
		} else {
			parent.removeChild(self.view);
		}
	}
	self.setup();
}

function add(element, type, handler) {
	if (element.addEventListener) {
		element.addEventListener(type, handler, false);
	} else if (element.attachEvent) {
		element.attachEvent('on' + type, handler);
	} else {
		// more on this later
	}
}

function remove(element, type, handler) {
	if (element.removeEventListener) {
		element.removeEventListener(type, handler);
	} else if (element.detachEvent) {
		element.detachEvent(type, handler);
	} else {
		// more on this later
	}
}
