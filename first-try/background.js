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

async function openDialog() {
  chrome.scripting.insertCSS({
    target: { tabId: (await getCurrentTab()).id },
    files: ['focus-mode.css']
  });

  chrome.scripting.executeScript({
    target: { tabId: (await getCurrentTab()).id },
    function: () => {
      let dialogDiv = document.createElement('div');
      dialogDiv.id = 'extensionDialog';
      dialogDiv.classList.add('extension-dialog');
      dialogDiv.innerHTML = `
        <h1>Qual o número que você deseja zerar o contexto?</h1>
        <input type="text" id="numberUser" placeholder="Qual o número?">
        <div id="blockButton">
        <button id="zerarButton">Zerar</button>
        <button id="cancelarButton">Cancelar</button>
        </div>
      `;
      
      document.body.appendChild(dialogDiv);
    }
  });
}

async function closeDialog() {
  chrome.scripting.executeScript({
    target: { tabId: (await getCurrentTab()).id },
    function: () => {
      let dialogDiv = document.getElementById('extensionDialog');
      if (dialogDiv) {
        dialogDiv.remove();
      }
    }
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const nextState = prevState === 'ON' ? 'OFF' : 'ON';

  if (nextState === 'ON') {
    await openDialog();
  } else if (nextState === 'OFF') {
    await closeDialog();
  }

  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });
});
