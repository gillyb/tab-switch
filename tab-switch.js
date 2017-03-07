var tabSelectionWindow = {
	isOpen: false,
	currentSelectedTab: 0,
	get openTabs() {
		return document.querySelectorAll('.tabs-container .tab-entry').length;
	},
	get selectedTab() {
		return this.currentSelectedTab;
	},
	set selectedTab(x) {
		if (x < 0) x = this.openTabs - 1;
		if (x >= this.openTabs) x = 0;
		this.currentSelectedTab = x;

		var selectedTab = document.querySelector('.tabs-container .tab-entry.selected');
		selectedTab.className = selectedTab.className.replace('selected', '').trim();

		var tabOptions = document.querySelectorAll('.tabs-container .tab-entry');
		tabOptions[this.currentSelectedTab].className += ' selected';

		// check if selected tab is out of view
		var container = document.querySelector('.tabs-container');
		if (tabOptions[this.currentSelectedTab].offsetTop + 46 > container.scrollTop + container.clientHeight) {
			container.scrollTop = tabOptions[this.currentSelectedTab].offsetTop - container.clientHeight + 46;
		}
		else if (tabOptions[this.currentSelectedTab].offsetTop < container.scrollTop) {
			container.scrollTop = tabOptions[this.currentSelectedTab].offsetTop;
		}
	}
};

document.onkeydown = function(event) {
	if (tabSelectionWindow.isOpen) {
		if (event.keyCode == TabSwitch.keysMap.ESC) {
			closeTabSelection();
			event.preventDefault();
		}
		else if (event.keyCode == TabSwitch.keysMap.ENTER) {
			selectTab(tabSelectionWindow.selectedTab);
			event.preventDefault();
		}
		else if (event.keyCode == TabSwitch.keysMap.DOWN || event.keyCode == TabSwitch.keysMap.Q) {
			tabSelectionWindow.selectedTab = tabSelectionWindow.selectedTab + 1;
			event.preventDefault();
		}
		else if (event.keyCode == TabSwitch.keysMap.UP) {
			tabSelectionWindow.selectedTab = tabSelectionWindow.selectedTab - 1;
			event.preventDefault();
		}
		return;
	}

	if (event.keyCode == 81 && event.ctrlKey) { // user pressed 'Ctrl + q' (works for upper case too)
		tabSelectionWindow.currentSelectedTab = 0;
		chrome.runtime.sendMessage({ openTabs: true }, function(tabs) {
			var modalWidth = 500;
			var modalHeight = 300;
			var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
			var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

			var modalLeft = (viewportWidth / 2) - (modalWidth / 2);
			var modalMaxHeight = viewportHeight - 60;

            var userFilterHeight = 32 + 12;
            var backdrop = createDiv('tab-switch backdrop');
            var tabSwitchWrapper = createDiv('tab-switch main-wrapper', 'left:'+modalLeft+'px; max-height:'+modalMaxHeight+'px;')
			var tabsContainerWrapper = createDiv('tab-switch tabs-container', 'max-height:' + (modalMaxHeight - userFilterHeight) + 'px;');

            tabSwitchWrapper.appendChild(createUserFilter());
            tabSwitchWrapper.appendChild(tabsContainerWrapper);

            backdrop.onclick = function() {
                closeTabSelection();
            };

			// create tabs
			for (var i=0; i<tabs.length; i++) {
				var tabSelection = createDiv('tab-entry');
				if (i == 0) {
					tabSelection.className += ' selected';
				}

				var icon = createDiv('tab-icon');
				var iconImg = document.createElement('img');
				iconImg.src = tabs[i].favIconUrl;
				icon.appendChild(iconImg);

				tabSelection.appendChild(icon);

				var tabName = createDiv('name');
				tabName.innerHTML = tabs[i].title;
				var tabUrl = createDiv('url');
				tabUrl.innerHTML = tabs[i].url;

				tabSelection.appendChild(tabName);
				tabSelection.appendChild(tabUrl);

				(function(tabIndex) {
					tabSelection.addEventListener('click', function() {
						selectTab(tabIndex);
					}, false);
					tabSelection.addEventListener('mouseenter', function() {
						tabSelectionWindow.selectedTab = tabIndex;
					}, false);
				})(i)

				tabsContainerWrapper.appendChild(tabSelection);
			}

			document.body.appendChild(backdrop);
            document.body.appendChild(tabSwitchWrapper);
            document.body.style.overflow = 'hidden';
			tabSelectionWindow.isOpen = true;
		});
	}
};

var createDiv = function(className, style) {
	var d = document.createElement('div');
	d.className = className;
	if (style)
		d.setAttribute('style', style);
	return d;
};

var createUserFilter = function() {
    var userFilter = createDiv('user-filter');
    var input = document.createElement('input');
    input.type = 'text';
    input.addEventListener('change', function(event) {

    }, false);
    userFilter.appendChild(input);
    return userFilter;
};

var closeTabSelection = function() {
	document.querySelector('.tab-switch.main-wrapper').remove();
    document.querySelector('.tab-switch.backdrop').remove();
    document.body.style.overflow = 'auto';
	tabSelectionWindow.isOpen = false;
};

var selectTab = function(tabId) {
	closeTabSelection();
	chrome.runtime.sendMessage({ goToTab: tabId }, function() { });
};
