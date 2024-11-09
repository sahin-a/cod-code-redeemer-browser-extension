const submitButton = document.getElementById('submit');
const codesInput = document.getElementById('codes');
const delayInput = document.getElementById('delay');
const resultsDiv = document.getElementById('results');
const progressIndicator = document.getElementById('progressIndicator');
const progressStatus = document.getElementById('progressStatus');

submitButton.addEventListener('click', async () => {
    submitButton.disabled = true;

    await startRedeemProcess()

    submitButton.disabled = false;
});

async function startRedeemProcess() {
    const codesString = codesInput.value;
    const delay = parseInt(delayInput.value, 10);
    const regex = /\w{4,5}-\w{4,5}-\w{4,5}/g;
    const codes = codesString.match(regex);

    if (!codes || codes.length === 0) {
        resultsDiv.innerHTML = 'No valid codes found.';
        return;
    }

    let attemptedCodesCount = 0

    updateProgressIndicator(attemptedCodesCount, codes.length)

    for (const code of codes) {
        try {
            const result = await redeemCodeWithDelay(code, delay);
            recordSuccess(code);
        } catch (error) {
            recordFailure(code, error.message);
        }

        updateProgressIndicator(++attemptedCodesCount, codes.length)
    }
}

function setVisibility(element, show) {
    if (show) {
        element.classList.remove('d-none');
    } else {
        element.classList.add('d-none');
    }
}

function updateProgressIndicator(attemptedCodesCount, totalCodesCount) {
    setVisibility(progressIndicator, true)
    progressStatus.textContent = `Codes remaining: ${totalCodesCount - attemptedCodesCount}`;
}

async function extractErrorMessageFromHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const errorContainer = doc.querySelector('.error-messaging-container');
    if (errorContainer) {
        const errorMessage = errorContainer.querySelector('p.sso-message').textContent;
        return errorMessage;
    } else {
        return null;
    }
}

async function redeemCode(code) {
    const url = 'https://profile.callofduty.com/promotions/redeemCode/';
    const body = `code=${code}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        });

        if (response.ok) {
            const data = await response.text();
            const errorMessage = await extractErrorMessageFromHtml(data);

            if (errorMessage) {
                throw new Error(`Code redemption failed: ${errorMessage}`);
            } else {
                return 'Code redeemed successfully';
            }
        } else {
            const data = await response.json();
            throw new Error(`Error redeeming code: ${data.message || response.statusText}`);
        }
    } catch (error) {
        throw error;
    }
}

async function redeemCodeWithDelay(code, delay) {
    await new Promise(resolve => setTimeout(resolve, delay));
    return redeemCode(code);
}

function recordSuccess(code) {
    const resultView = createSuccessView(code)
    insertResultRecord(resultView);
}

function recordFailure(code, reason) {
    const resultView = createFailureView(code, reason)
    insertResultRecord(resultView);
}

function insertResultRecord(recordView) {
    resultsDiv.prepend(recordView);
}

function createSuccessView(code) {
    const alertView = createAlert(true);

    const codeText = document.createElement('strong');
    codeText.textContent = code;
    alertView.appendChild(codeText);

    return alertView;
}

function createFailureView(code, reason) {
    const alertView = createAlert(false);

    const reasonContainer = createInfoText(reason)
    alertView.appendChild(reasonContainer);

    const codeText = document.createElement('strong');
    codeText.textContent = code;
    alertView.appendChild(codeText);

    return alertView;
}

function createInfoText(text) {
    const reasonContainer = document.createElement('div');
    reasonContainer.classList.add('d-flex', 'align-items-center');

    const infoIcon = document.createElement('i');
    infoIcon.classList.add('bi', 'bi-info-circle', 'pe-2');
    reasonContainer.appendChild(infoIcon);

    const reasonText = document.createElement('a');
    reasonText.textContent = text;
    reasonContainer.appendChild(reasonText);

    // Add CSS to vertically center the text within the container
    reasonContainer.style.alignItems = 'center';

    return reasonContainer;
}

function createAlert(isSuccess) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('alert', 'alert-' + (isSuccess ? 'success' : 'danger'), 'p-3');

    return messageContainer
}