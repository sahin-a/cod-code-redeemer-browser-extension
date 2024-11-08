function setLocalStorageValue(key, value) {
    chrome.storage.local.set({[key]: value});
}

function getLocalStorageValue(key, callback) {
    chrome.storage.local.get([key], function (result) {
        callback(result[key]);
    });
}

const REDEEMED_CODES_KEY = 'redeemedCodes';

function storeCodeRedemption(code, success) {
    getLocalStorageValue(REDEEMED_CODES_KEY, (redeemedCodes) => {
        redeemedCodes = redeemedCodes || [];
        redeemedCodes.push({ code, success });
        setLocalStorageValue(REDEEMED_CODES_KEY, redeemedCodes);
    });
}