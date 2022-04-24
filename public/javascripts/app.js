initServiceWorker()

function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('../service-worker.js')
                .then(reg => console.log("Registered service worker"))
                .catch(err => console.log(`error: ${err}`));
        });
    }
}