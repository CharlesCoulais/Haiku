chrome.action.onClicked.addListener(async () => {
    const [ openedTab ] = await chrome.tabs.query({
        windowId: chrome.windows.WINDOW_ID_CURRENT,
        url: chrome.runtime.getURL('*'),
    });

    if (openedTab) {
        chrome.tabs.update(openedTab.id, { active: true });
    }
    else {
        const url = chrome.runtime.getURL('index.html');
        chrome.tabs.create({ url });
    }
});