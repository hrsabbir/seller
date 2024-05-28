document.addEventListener('DOMContentLoaded', function () {
    // css selector that a tag href ends with "-modal"
    const modalLinks = document.querySelectorAll('a[href$="-modal"]');

    // loop through all the modal links and add click listener
    modalLinks.forEach((link) => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const modalId = link.getAttribute('href').replace('#', '');
            const modal = document.getElementById(modalId);

            if(!modal) {
                console.error('Modal not found:', modalId);
                return;
            }

            // show modal
            modal.classList.remove('hidden');

            // close modal when clicking on overlay
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    });
});