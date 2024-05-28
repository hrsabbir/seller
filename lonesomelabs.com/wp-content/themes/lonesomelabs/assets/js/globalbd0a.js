document.addEventListener("DOMContentLoaded", function () {
    handleAccordionItems();
    links_append_source_parameters('a[href^="https://app.lonesomelabs.com"], a[href^="https://community.lonesomelabs.com"]');
});

/* toggle menu - function called directly in html */
function onToggleMenu(e) {
    const navLinks = document.getElementById('menu');
    navLinks?.closest('.page_header').classList.toggle("js-active-menu");
}

function handleAccordionItems() {
    const accordionItems = document.querySelectorAll(".accordion-item");
    accordionItems.forEach((item) => {
        const button = item.querySelector(".accordion-button");
        button.addEventListener("click", function () {
            // Remove 'js-active' class from all accordion items except the clicked item
            accordionItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    otherItem.classList.remove("js-active");
                }
            });

            // Toggle the clicked item
            item.classList.toggle("js-active");
        });
    });
}

/* add scroll classes to header */
function init_scroll_behavior() {
    let prevScrollPos = window.scrollY || window.pageYOffset;
    const header = document.querySelector(".page_header");

    if(header) {
        const onScroll = () => {
            const currentScrollPos = window.scrollY || window.pageYOffset;
            header.classList.toggle("js-scroll", currentScrollPos > 0);

            if ( currentScrollPos < prevScrollPos) {
                header.classList.add("js-scroll-up");
            } else {
                header.classList.remove("js-scroll-up");
            }

            prevScrollPos = currentScrollPos;
        };

        window.addEventListener("scroll", onScroll);
    }
}
init_scroll_behavior();


/* append parameters to installation links */
function links_append_source_parameters(linksSelector) {
    const link_elements = document.querySelectorAll(linksSelector);

    if (link_elements.length) {
        // Get 'source' and 'gclid' parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get('source');
        const gclid = urlParams.get('gclid');

        if (source || gclid) {
            const newParams = {};

            if (source) {
                newParams.source = source;
            }
            if (gclid) {
                newParams.gclid = gclid;
            }

            if (Object.keys(newParams).length > 0) {
                link_elements.forEach(elm => {
                    const existingParams = new URLSearchParams(elm.search);
                    const mergedParams = new URLSearchParams({
                        ...Object.fromEntries(existingParams),
                        ...newParams
                    });

                    // Update href with merged params
                    elm.search = mergedParams.toString();
                });
            }
        }
    }
}
/* == end installation links */