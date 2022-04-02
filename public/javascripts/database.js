/**
 * This is the file where all the functions accessing the indexedDB database are implemented.
 *  To be completed
 */

import * as idb from '/idb/index.js';

let db;

const STORIES_DB_NAME = 'db_stories_1';
const STORIES_STORE_NAME = 'store_stories';
const ANNOTATIONS_STORE_NAME = 'store_annotations';

/**
 * Function initDatabase().
 * It initialises the indexedDB database.
 */
async function initDatabase(){
    // If database  is not yet initialised,then do it.
    if(!db){
        db = await idb.openDB(STORIES_DB_NAME, 2, {
            upgrade(upgradeDB,oldVersion,newVersion){
                // If this is the first time the db is opened, check if the stories story is there,if not,create it.
                if(!upgradeDB.objectStoreNames.contains(STORIES_STORE_NAME)) {
                    // Define the primary key and set it to autoincrement.
                    let storiesDB=upgradeDB.createObjectStore(STORIES_STORE_NAME,{
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    let annotationsDB=upgradeDB.createObjectStore(ANNOTATIONS_STORE_NAME, {
                       keyPath: 'id',
                       autoIncrement: true
                    });

                    // Create the indexes of the stories store, in case we want to search using author or title.
                    storiesDB.createIndex('author', 'author', {unique:false,multiEntry:true});
                    storiesDB.createIndex('title', 'title', {unique:false,multiEntry:true});

                    // An annotation belongs to a story, so create an index so we can search annotations depending on which story they belong.
                    annotationsDB.createIndex('story', 'story', {unique:false, multiEntry:true});
                }
            },
            // When it's not possible tp connect.
            blocked(){
            },

        });
        console.log('indexedDB created');
    }
}

window.initDatabase=initDatabase;

/**
 * The function which stores the data that have to be cached(stories and annotations)
 * This function is going to be called when the stories are retrieved from the mongo DB to immediately cache them.
 * I assume it's also going to be called when an annotation is added to a story.
 * @returns {Promise<void>}
 */
async function storeCachedData(object){
    // Remember that we have to cache stories AND their annotations.
    // So We check the type of given object(story or annotation) and act accordingly.
    console.log('Inserting: '+JSON.stringify(object));
    if(!db)
        await initDatabase();
    if(db) {
        try{
            if(object.type='Story')
                var store_n = STORIES_STORE_NAME;
            else
                var store_n = ANNOTATIONS_STORE_NAME;

            let tx = await db.transaction(store_n, 'readwrite');
            let store = await tx.objectStore(store_n);
            await store.put(object);
            await tx.complete;
            console.log('Added item to the store.', JSON.stringify(object));
        }
        catch (error) {
            //localStorage.setItem(JSON.stringify(object));
            console.log(error);
        };
    }
}

window.storeCachedData = storeCachedData;

/**
 *
 */

//Initial version, need to redefine it to retrieve data for both stories and their annotations(as soon as I put stories in the same store as their stories.)
async function getCachedData(author,title) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            console.log('fetching story. Title:' + title + '.Author:' + author);
            if(object.type='Story')
                var store_n = STORIES_STORE_NAME;
            else
                var store_n = ANNOTATIONS_STORE_NAME;

            let tx = await db.transaction(store_n,'readonly');
            let store = await tx.objectStore(store_n);
            let index = await store.index('title'); // Maybe indexing a story just by author is not good, need to define a proper PK.
            let readingList = await index.getAll(IDBKeyRange.only(title));
            await tx.complete;
            let finalResults=[];
            if(readingList && readingList.length>0){
                let max;
                for (let elem of readingList)
                    if(!max || elem.date>max.date)
                        max = elem;
                if (max)
                    finalResults.push(max);
                return finalResults;
            }
            else{
                const value=localStorage.getItem(title);
                if(value==null)
                    return finalResults;
            }
        } catch (e) {
            console.log(e);
        }
    }
    else {
        const value = localStorage.getItem(author);
        let finalResults = [];
        if(value == null)
            return finalResults;
        else finalResults.push(value);
        return finalResults;
    }
}
window.getCachedData = getCachedData;