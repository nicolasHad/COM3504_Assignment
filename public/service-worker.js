// Copyright 2016 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//Variable declarations
let cache = null;
let dataCacheName = 'storiesData';
let cacheName = 'stories';
let filesToCache = [
    //Standard libraries
    "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js",
    //Pages
    "/",
    "/createStory",
    "/generateRoom",
    "visitedRooms",
    "/getSelectedStoryData",
    "/getAllStoryData",
    //'visitedRooms',
    //Scripts
    "/javascripts/app.js",
    "/javascripts/index.js",
    "/javascripts/canvas.js",
    "/javascripts/image.js",
    "/javascripts/database.js",
    "/stylesheets/style.css",
    "/images/logo.png"
];

/**
 * Installs the service worker
 */
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cacheX) {
            console.log('[ServiceWorker] Caching app shell');
            cache = cacheX;
            return cache.addAll(filesToCache);
        })
    );
});

/**
 * activation of service worker: it removes all cashed files if necessary
 */
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});
/**
 * This function is called when a fetch request is received by the service worker
 */
self.addEventListener('fetch', function (event) {
    /*e.respondWith(
        fetch(e.request).catch(function(){
            return caches.match(e.request);
        })
    );*/
    event.respondWith(async function () {
        try {
            return await fetch(event.request);
        } catch (err) {
            return caches.match(event.request);
        }
    }());
});

