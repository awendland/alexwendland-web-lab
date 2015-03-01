function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

window.onload = function() {
	var loadingView = new LoadingView();

	window.addEventListener('hashchange', hashChanged, false);

	function hashChanged() {
	    var matchingDemoElem = document.querySelector("li[data-id=" + location.hash.replace('#', '') + "]");
		if (matchingDemoElem) {
			loadDemo(matchingDemoElem);
		}
	}
	if (!location.hash) {
		location.hash = document.querySelector("#side-nav li").getAttribute("data-id");
	}

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

	var mainView = document.getElementById('view');

	var fullscreenButton = document.getElementById('fullscreen-button');
	fullscreenButton.addEventListener('click', function () {
		window.open(mainView.getAttribute('data-url'),'_blank');
	});
	var reloadButton = document.getElementById('reload-button');
	var iframeView = document.querySelector("#iframe");
	reloadButton.addEventListener('click', function () {
		iframeView.firstElementChild.src = iframeView.firstElementChild.src;
	});
	var sourceButton = document.getElementById('source-button');
	var sourceTabs = document.getElementById('source-tabs');
	var sourceElem = document.getElementById('source').firstElementChild;
	var sourceView = document.getElementById('source-view');
	var sourceName = document.getElementById('source-name');
	sourceButton.addEventListener('click', function () {
		sourceTabs.classList.toggle('hide');
	});
	function resizeCodePreview (e) {
		console.log(window.innerHeight);
		if (e.clientY + 50 < window.innerHeight) {
			sourceView.style.top = (e.clientY - 50) + "px";
			iframe.style.height = (e.clientY - 50) + "px";
		}
    };
	sourceView.addEventListener('mousedown', function(e) {
		if (e.target == sourceView && (sourceView.offsetTop + 50) - e.clientY < 11) {
		    e.preventDefault();
		    sourceView.classList.add('resize');
		    document.addEventListener('mousemove', resizeCodePreview);
		}
	});
    document.addEventListener('mouseup', function(e){
	    sourceView.classList.remove('resize');
		document.removeEventListener('mousemove', resizeCodePreview);
    });

	function loadDemo(currentTarget) {
		mainView.setAttribute('data-id', currentTarget.getAttribute('data-id'));
		mainView.setAttribute('data-url', currentTarget.getAttribute('data-url'));

		var iframe = document.getElementById('iframe');
		var navItems = document.querySelectorAll('#side-nav li');
		for (var navIndex = 0; navIndex < navItems.length; navIndex++) {
			navItems[navIndex].className = "";
		}
		currentTarget.className = "selected";

		// Clear old data
		sourceTabs.innerHTML = '';
		sourceElem.innerHTML = '';
		sourceView.classList.remove('loaded');
		var sources = allSources[currentTarget.getAttribute('data-id')];
		var types = Object.keys(sources);
		for (var typeIndex = 0; typeIndex < types.length; typeIndex++) {
			var type = types[typeIndex];
			var files = sources[type];
			var fileNames = Object.keys(files);
			for (var fnIndex = 0; fnIndex < fileNames.length; fnIndex++) {
				var fileName = fileNames[fnIndex];
				var file = files[fileName];
				var tab = document.createElement('LI');
				tab.setAttribute('data-filename', fileName);
				tab.innerHTML = escapeHtml(type + " - " + fileName);
				sourceTabs.appendChild(tab);
			}
		}
		sourceTabs.addEventListener('click', function (e) {
			var tab = e.target;
			while(!tab.hasAttribute('data-filename') && tab.parent) {
				tab = tab.parent;
			}
			if (tab.hasAttribute('data-filename')) {
				var fileName = tab.getAttribute('data-filename');
				var sources = allSources[document.getElementById('view').getAttribute('data-id')];
				var file = null,
					type = null;
				for (var typeIndex = 0; typeIndex < types.length; typeIndex++) {
					type = Object.keys(sources)[typeIndex];
					file = sources[type][fileName];
					if (file) {break;}
				}
				sourceElem.innerHTML = hljs.highlight(type, file, true).value;
				sourceName.innerHTML = escapeHtml(fileName);
				var url = mainView.getAttribute('data-url');
				sourceName.setAttribute('href', url.substring(0, url.lastIndexOf('/') + 1) + fileName);
				sourceTabs.classList.add('hide');
				sourceView.classList.add('loaded');
				resizeCodePreview({clientY: sourceView.offsetTop});
			}
		});

		iframeView.innerHTML = "";
		var iframe = document.createElement("iframe");
		iframe.src = currentTarget.getAttribute('data-url');
		iframe.scrolling = "auto";
		iframe.frameBorder = "0";
		iframe.width = "100%";
		iframe.height = "100%";
		iframe.style.display = "none";
		loadingView.insert(iframeView, true);
		iframeView.appendChild(iframe);

		iframe.addEventListener("load", function() {
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
	}
	hashChanged();
};