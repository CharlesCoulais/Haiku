chrome.action.onClicked.addListener(async () => {
    const [ openedTab ] = await chrome.tabs.query({
        windowId: chrome.windows.WINDOW_ID_CURRENT,
        url: chrome.runtime.getURL('*'),
    });

    if (openedTab) {
        chrome.tabs.update(openedTab.id, { active: true });
    }
    else {
        const baseUrl = chrome.runtime.getManifest().background.baseUrl || '';
        const url = chrome.runtime.getURL(`${baseUrl}index.html`);
        chrome.tabs.create({ url });
    }
});