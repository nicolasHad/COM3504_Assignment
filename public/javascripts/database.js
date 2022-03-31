/**
 * This is the file where all the functions accessing the indexedDB database are implemented.
 *  To be completed
 */

import * as idb from '/idb/index.js';

let db;

const STORIES_DB_NAME = 'db_stories_1';
const STORIES_STORE_NAME = 'store_forecasts';

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
                    // Create the indexes of the stories store, in case we want to search using author or title.
                    storiesDB.createIndex('author', 'author', {unique:false,multiEntry:true});
                    storiesDB.createIndex('title', 'title', {unique:false,multiEntry:true});
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

