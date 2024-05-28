document.addEventListener('DOMContentLoaded', function () {
    const actionURLS = {
        'contactForm': 'https://script.google.com/macros/s/AKfycbziA76UE3NMH2Lm6sNPaWpBgdKc15520BvjvrhQhIVwifIv5IQbD63iH0f-UalwJ7c/exec',
        'newsletter': 'https://script.google.com/macros/s/AKfycbw-vG8w0p9QsR47RKG5_hTnblIz1n1t1Kt4JOjFH49M4qcGDvHhW5Z6-K64iDXMr7O8/exec',

        'modal-bsr': 'https://script.google.com/macros/s/AKfycbz5EIajsKEAoCEFPeg0P0yeQV43x--0X4dEABNqSVU1NcNWYYDg7Wxx1f8NSAo6377-VA/exec',
        'modal-mission-control': 'https://script.google.com/macros/s/AKfycbw7K4dWY6BNillA2j89hDxlqNZkLpuOIFFvSK3-OsJw8qa-rt3sZNClr5NVkILW7L_S/exec',
        'modal-payday': 'https://script.google.com/macros/s/AKfycbzrI4R8zG3CI7bYchSMVE9hUIWKfufJegUpJXraOqh93UFkM8uNWnRQ2lyQfcKiIOTs/exec'
    };

    function initializeOrRetrieveUserData() {
        let data = JSON.parse(sessionStorage.getItem('handleForms_data')) || {};

        // If data is not present, initialize it
        if (!data.sessionStartTime) {
            data.sessionStartTime = new Date().getTime();
            data.pageHistory = [];
            data.referringURL = document.referrer;
            data.device = navigator.userAgent;
        }

        // Update page history
        const currentPage = window.location.href;
        // If the current page is not the same as the last page, add it to the history
        if (data.pageHistory[data.pageHistory.length - 1] !== currentPage) {
            data.pageHistory.push(currentPage);
        }

        // Save data to sessionStorage
        sessionStorage.setItem('handleForms_data', JSON.stringify(data));

        return data;
    }

    function getSessionDuration(sessionStartTime) {
        const sessionEndTime = new Date().getTime();
        const milliseconds = sessionEndTime - sessionStartTime;

        // format
        const seconds = Math.floor((milliseconds / 1000) % 60);
        const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    // Initialize or retrieve user data
    const userData = initializeOrRetrieveUserData();

    // Form submit event listener for all forms
    const forms = document.querySelectorAll('form[data-actionid]');

    for (const form of forms) {
        const action_id = form.dataset.actionid;

        if (!action_id || typeof actionURLS[action_id] === 'undefined') {
            continue;
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            if (form.classList.contains('js-loading')) {
                return;
            }

            form.classList.add('js-loading');

            // Remove existing feedback div if it exists
            let existingFeedbackDiv = this.querySelector('.js-feedback');
            if (existingFeedbackDiv) {
                existingFeedbackDiv.remove();
            }

            // Get the form data
            let formData = new FormData(this);
            formData.append('userLocalTime', new Date().toLocaleString());
            formData.append('pageSubmittedOn', window.location.href);
            formData.append('referringURL', userData.referringURL);
            formData.append('sessionDuration', getSessionDuration(userData.sessionStartTime));
            formData.append('device', userData.device);

            if (userData.pageHistory.length) {
                formData.append('pageHistory', userData.pageHistory.join('\n'));
            }

            // console.log the form data for debugging
            /*for (let [key, value] of formData.entries()) {
                console.log(key + ': ' + value);
            }*/

            // Encode form data and append it to the URL
            let queryParams = new URLSearchParams(formData).toString();
            let urlWithParams = `${actionURLS[action_id]}?${queryParams}`;

            // Use fetch to make the AJAX request
            fetch(urlWithParams, {
                redirect: 'follow',
                method: 'GET',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
            })
                .then(response => {
                    //console.log(response);
                    if (response.ok) {
                        return response.text();
                    } else {
                        throw new Error('Form submission failed');
                    }
                })
                .then(responseText => {
                    console.log(responseText);
                    // Successful response
                    handleResponse(form, responseText);
                })
                .catch(error => {
                    console.log(error);
                    // Error response
                    handleResponse(form, 'ERROR');
                })
                .finally(() => {
                    form.classList.remove('js-loading');
                });
        });
    }

    // Function to handle the response and update the feedback div
    function handleResponse(formElm, response) {
        // Create a new feedback div
        let feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'mt-4 px-4 py-2 rounded-md text-white js-feedback';

        // Insert the new feedback div
        formElm.appendChild(feedbackDiv);

        // Use classList to add or remove classes
        if (response.includes('SUCCESS')) {
            feedbackDiv.textContent = 'Thanks for reaching out! We will get back to you as soon as possible';
            feedbackDiv.classList.add('bg-green-500');
        } else {
            feedbackDiv.textContent = 'Oops! Something went wrong. Please try again';
            feedbackDiv.classList.add('bg-red-500');
        }
    }
});