var tabsList;

var fillTabsList = function() {
	chrome.tabs.query({}, function(tabs) {
		tabsList = tabs;
	});
};
fillTabsList();

chrome.tabs.onUpdated.addListener(fillTabsList);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	// change active tab
	if (request.goToTab) {
		chrome.tabs.update({ active:false });
		chrome.tabs.update(tabsList[request.goToTab].id, { active: true });
		return;
	}

	// return list of tabs
	sendResponse(tabsList);
});