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

let cache= null;
let dataCacheName = 'storiesData';
let cacheName = 'stories';
let filesToCache = [
    '/',
    'javascripts/app.js',
    'javascripts/index.js',
];


/**
 * installation event: it adds all the files to be cached
*/
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cacheX) {
            console.log('[ServiceWorker] Caching app shell');
            cache= cacheX;
            return cache.addAll(filesToCache);
        })
    );
});


/**
 * activation of service worker: it removes all cached files if necessary
 */
/*
self.addEventListener('install', e => {
    console.log('Installed');

    e.waitUntil(
        caches
            .open(cacheName)
            .then(cache => {
                console.log("Caching files");
                cache.addAll(filesToCache);
            })
            .then(() =>self.skipWaiting())
    );
});
*/


self.addEventListener('activate', e => {
    console.log('Activated');
});


