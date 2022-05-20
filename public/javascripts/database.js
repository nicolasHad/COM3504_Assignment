/**
 * This is the file where all the functions accessing the indexedDB database are implemented.
 *  To be completed
 */

/**
 class DrawnAnnotation{
    constructor(story, ctx, canvas_width, canvas_height, prevX, prevY, currX, currY, color, thickness) {
        this.story=story;
        this.ctx=ctx;
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
        this.prevX = prevX;
        this.prevY = prevY;
        this.currX = currX;
        this.currY = currY;
        this.color = color;
        this.thickness = thickness;
    }
}
 class WrittenAnnotation{
    constructor(story, body) {
        this.story=story;
        this.body=body;
        this.type = "annotation";
    }
}

 class Story{
    constructor(author,title,description,imageURL) {
        this.author=author;
        this.title=title;
        this.description = description;
        this.imageURL = imageURL;
        this.type='story';

    }
}
 **/

import * as idb from './idb/index.js';

let db;

// Declare the names of the db name and the object stores.
const STORIES_DB_NAME = 'db_stories_1';
const STORIES_STORE_NAME = 'store_stories';
const ANNOTATIONS_STORE_NAME = 'store_annotations';

/**
 * Function initDatabase().
 * It initialises the indexedDB database.
 */
async function initDatabase() {
    // If database  is not yet initialised,then do it.
    if (!db) {
        db = await idb.openDB(STORIES_DB_NAME, 2, {
            upgrade(upgradeDB, oldVersion, newVersion) {
                // If this is the first time the db is opened, check if the stories story is there,if not,create it.
                if (!upgradeDB.objectStoreNames.contains(STORIES_STORE_NAME) && !upgradeDB.objectStoreNames.contains(ANNOTATIONS_STORE_NAME)) {
                    // Define the primary key and set it to autoincrement.
                    let storiesDB = upgradeDB.createObjectStore(STORIES_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    let annotationsDB = upgradeDB.createObjectStore(ANNOTATIONS_STORE_NAME, {
                        keyPath: ['id', 'room', 'story'],
                        autoIncrement: false
                    });


                    // Create the indexes of the stories store, in case we want to search using author or title.
                    storiesDB.createIndex('author', 'author', {unique: false, multiEntry: true});
                    storiesDB.createIndex('title', 'title', {unique: false, multiEntry: true});

                    // An annotation belongs to a story, so create an index so we can search annotations depending on which story they belong.
                    annotationsDB.createIndex('room', ['room', 'story'], {unique: false});
                }
            },
            // When it's not possible to connect.
            blocked() {
            },

        });
        console.log('indexedDB created');
    }
}

window.initDatabase = initDatabase;

/**
 * The function which stores the story data that have to be cached
 * This function is going to be called when the stories are added from the mongo DB to immediately cache them.
 * @returns {Promise<void>}
 * @param author
 * @param title
 * @param description
 * @param imageUrl
 * @returns {Promise<void>}
 */
async function storeCachedStory(author, title, description, imageUrl) {
    // Remember that we have to cache stories AND their annotations.
    // So We check the type of given object(story or annotation) and act accordingly.
    console.log('Inserting story with data: ' + author + ',' + title + ',' + description + ',' + imageUrl);
    if (!db)
        await initDatabase();
    if (db) {
        try {
            // Initialise the transaction and put the data in the store.
            var store_n = STORIES_STORE_NAME;
            let tx = await db.transaction(store_n, 'readwrite');
            let store = await tx.objectStore(store_n);
            await store.put({
                author: author,
                title: title,
                description: description,
                imageUrl: imageUrl
            });

            await tx.complete;
            console.log('Added item to the store.', JSON.stringify(author + ',' + title + ',' + description + ',' + imageUrl));
        } catch (error) {
            console.log(error);
        }
    }
}

window.storeCachedStory = storeCachedStory;

/**
 * Method for getting all stories stored in indexedDB.
 * @returns {Promise<*[]|*>}
 */
async function getAllCachedStories() {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            var store_stories = STORIES_STORE_NAME;

            //Define different transactions and get the cached stories.
            let tx_stories = await db.transaction(store_stories, 'readonly');
            let story_store = await tx_stories.objectStore(store_stories);
            let readingList_stories = await story_store.getAll();

            await tx_stories.complete;

            let finalResults = [];
            if (readingList_stories && readingList_stories.length > 0) {
                let max;
                for (let elem of readingList_stories)
                    if (!max || elem.date > max.date)
                        max = elem;
                if (max)
                    finalResults.push(max);
                return finalResults;
            }
        } catch (e) {
            console.log(e);
            return e;
        }
    }
}

window.getAllCachedStories = getAllCachedStories;

/**
 * Method for storing annotation data
 * @param object the annotation object.
 * @returns {Promise<void>}
 */
async function storeCachedAnnotation(object) {
    console.log('Inserting: ' + JSON.stringify(object));
    let id = Math.random();
    if (!db)
        await initDatabase();
    if (db) {
        try {
            var store_n = ANNOTATIONS_STORE_NAME;
            let tx = await db.transaction(store_n, 'readwrite');
            let store = await tx.objectStore(store_n);
            // Depending on the type of annotation, call the .put method to store it.
            if (object.body != null) {
                await store.put({
                    id: id,
                    room: object.room,
                    story: object.story,
                    body: object.body
                });
                await tx.complete;
                console.log('Added item to the store.', JSON.stringify(object));
            } else if (object.resId != null) {
                await store.put({
                    id: id,
                    room: object.room,
                    story: object.story,
                    resId: object.resId,
                    resName: object.resName,
                    resDescription: object.resDescription,
                    resUrl: object.resUrl
                });
                await tx.complete;
                console.log('Added item to the store.', JSON.stringify(object));
            } else {
                await store.put({
                    id: id,
                    room: object.room,
                    story: object.story,
                    canvas_width: object.canvas_width,
                    canvas_height: object.canvas_height,
                    prevX: object.prevX,
                    prevY: object.prevY,
                    currX: object.currX,
                    currY: object.currY,
                    color: object.color,
                    thickness: object.thickness
                });
                await tx.complete;
                console.log('Added item to the store.', JSON.stringify(object), 'with ID:' + id.toString());
            }
        } catch (error) {
            //localStorage.setItem(JSON.stringify(object));
            console.log(error);
        }
    }
}

window.storeCachedAnnotation = storeCachedAnnotation;


/**
 * Method for retrieving story data from indexedDB given a title.
 * @param title
 * @returns {Promise<*[]|*>}
 */
async function getCachedStoryData(title) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            console.log('fetching story. Title:' + title);
            var store_stories = STORIES_STORE_NAME;

            //Define different transactions,stores,indexes and readingLists for both stories and annotations.
            let tx_stories = await db.transaction(store_stories, 'readonly');
            let story_store = await tx_stories.objectStore(store_stories);
            let index_stories = await story_store.index('title');
            let readingList_stories = await index_stories.getAll(IDBKeyRange.only(title));

            await tx_stories.complete;

            let finalResults = [];
            if (readingList_stories && readingList_stories.length > 0) {
                let max;
                for (let elem of readingList_stories)
                    if (!max || elem.date > max.date)
                        max = elem;
                if (max)
                    finalResults.push(max);
                return finalResults;
            } else {
                const value = localStorage.getItem(title);
                if (value == null)
                    return finalResults;
                else finalResults.push(value);
                return finalResults;
            }
        } catch (e) {
            console.log(e);
            return e;
        }
    } else {
        const value = localStorage.getItem(title);
        let finalResults = [];
        if (value == null)
            return finalResults;
        else finalResults.push(value);
        return finalResults;
    }
}

window.getCachedStoryData = getCachedStoryData;


/**
 * Returns all cached annottations(written, drawn and KG annotations) for a room.
 * @param room
 * @param story
 * @returns {Promise<*[]|*>}
 */
async function getCachedAnnotationData(room, story) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            var store_annotations = ANNOTATIONS_STORE_NAME;

            //Define different transactions,stores,indexes and readingLists for both stories and annotations.
            let tx_annotations = await db.transaction(store_annotations, 'readonly');
            let annotation_store = await tx_annotations.objectStore(store_annotations);
            let index_annotations = await annotation_store.index('room');
            let readingList_annotations = await index_annotations.getAll(IDBKeyRange.only([room, story])); //Assuming that title is story's PK, can change.

            await tx_annotations.complete;

            let finalResults = readingList_annotations;
            return finalResults;
        } catch (e) {
            console.log(e);
        }
    } else {
        const value = localStorage.getItem(room);
        let finalResults = [];
        if (value == null)
            return finalResults;
        else finalResults.push(value);
        return finalResults;
    }
}

window.getCachedAnnotationData = getCachedAnnotationData;


/**
 * Method for deleting the annotations of a specific room,story pair.
 * @param room
 * @param story
 * @returns {Promise<void>}
 */
async function deleteCachedAnnotationData(room, story) {
    //get the annotations to be deleted using the getCachedAnnotationData method.
    let to_be_deleted = await getCachedAnnotationData(room, story)
        .then((response) => {
            return response;
        })
    if (!db)
        await initDatabase();
    if (db) {
        try {
            var store_n = ANNOTATIONS_STORE_NAME;
            let tx = await db.transaction(store_n, 'readwrite');
            let store = await tx.objectStore(store_n);

            //iterate over all annotations and delete each one.
            for (let ann of to_be_deleted) {
                let id = ann.id
                store.delete([id, room, story]);
            }
            await tx.complete;

        } catch (e) {
            console.log(e);
        }
    } else {
        console.log("COULDN'T DELETE THE ANNOTATIONS FROM IDB");
    }
}

window.deleteCachedAnnotationData = deleteCachedAnnotationData;
