chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: 'OFF'
  });
});

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function fetchBodyHtml() {
  const response = await fetch(chrome.runtime.getURL('body.html'));
  return await response.text();
}

async function openDialog(tabId) {
  const htmlContent = await fetchBodyHtml();

  chrome.scripting.insertCSS({
    target: { tabId: tabId },
    files: ['phoneUser.css']
  });

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (htmlContent) => {
      let dialogDiv = document.createElement('div');
      dialogDiv.id = 'extensionDialog';
      dialogDiv.classList.add('extension-dialog');
      dialogDiv.innerHTML = htmlContent;
      document.body.appendChild(dialogDiv);

      // Adiciona o listener de clique para fechar o popup
      const closeOnClickOutside = (event) => {
        if (!dialogDiv.contains(event.target)) {
          dialogDiv.remove();
          chrome.action.setBadgeText({
            tabId: tabId,
            text: 'OFF'
          });
          document.removeEventListener('click', closeOnClickOutside);
        }
      };
      document.addEventListener('click', closeOnClickOutside);
    },
    args: [htmlContent]
  });
}

async function closeDialog(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => {
      let dialogDiv = document.getElementById('extensionDialog');
      if (dialogDiv) {
        dialogDiv.remove();
      }
      chrome.action.setBadgeText({
        tabId: tabId,
        text: 'OFF'
      });
    }
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const nextState = prevState === 'ON' ? 'OFF' : 'ON';

  if (nextState === 'ON') {
    await openDialog(tab.id);
  } else if (nextState === 'OFF') {
    await closeDialog(tab.id);
  }

  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });
});
