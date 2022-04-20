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
            // When it's not possible to connect.
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
async function storeCachedStory(author,title,description,imageUrl){
    // Remember that we have to cache stories AND their annotations.
    // So We check the type of given object(story or annotation) and act accordingly.
    console.log('Inserting story with data: '+author+','+title+','+description+','+imageUrl);
    if(!db)
        await initDatabase();
    if(db) {
        try{
            var store_n = STORIES_STORE_NAME;
            let tx = await db.transaction(store_n, 'readwrite');
            let store = await tx.objectStore(store_n);
            await store.put({
                author: author,
                title: title,
                description: description,
                imageUrl:imageUrl
            });

                await tx.complete;
            console.log('Added item to the store.', JSON.stringify(author+','+title+','+description+','+imageUrl));
        }
        catch (error) {
            //localStorage.setItem(JSON.stringify(object));
            console.log(error);
        };
    }
}
window.storeCachedStory = storeCachedStory;

async function storeCachedAnnotation(object){
    console.log('Inserting: '+JSON.stringify(object));
    if(!db)
        await initDatabase();
    if(db) {
        try{
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
window.storeCachedAnnotation = storeCachedAnnotation;

/**
 *
 */

// Initial version, need to redefine it to retrieve data for both stories and their annotations(as soon as I put stories in the same store as their stories.)
// 2 ways  of doing this. I can either stick to using 2 different stores for stories and annotations(and every time a story is to be
// retrieved using author,title as composite 'PK' I just retrieve the corresponding annotations as well.Second option is to store
// stories and their annotations in the same store, and retrieve them altogether.
async function getCachedStoryData(title) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            console.log('fetching story. Title:' + title);
            var store_stories = STORIES_STORE_NAME;

            //Define different transactions,stores,indexes and readingLists for both stories and annotations.
            let tx_stories = await db.transaction(store_stories,'readonly');
            let story_store = await tx_stories.objectStore(store_stories);
            let index_stories = await story_store.index('title'); // Maybe indexing a story just by title is not good, need to define a proper PK.
            let readingList_stories = await index_stories.getAll(IDBKeyRange.only(title));

            await tx_stories.complete;

            let finalResults=[];
            if(readingList_stories && readingList_stories.length>0){
                let max;
                for (let elem of readingList_stories)
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
                else finalResults.push(value);
                return finalResults;
            }
        } catch (e) {
            console.log(e);
            return e;
        }
    }

    else {
        const value = localStorage.getItem(title);
        let finalResults = [];
        if(value == null)
            return finalResults;
        else finalResults.push(value);
        return finalResults;
    }
}
window.getCachedStoryData = getCachedStoryData;

async function getCachedAnnotationData(room){
    if (!db)
        await initDatabase();
    if (db) {
        try {
            //console.log('fetching story. Title:' + title + '.Author:' + author);
            var store_annotations = ANNOTATIONS_STORE_NAME;

            //Define different transactions,stores,indexes and readingLists for both stories and annotations.
            let tx_annotations = await db.transaction(store_annotations,'readonly');
            let annotation_store = await tx_annotations.objectStore(store_annotations);
            let index_annotations = await annotation_store.index('story');
            let readingList_annotations = await index_annotations.getAll(IDBKeyRange.only(room)); //Assuming that title is story's PK, can change.

            await tx_annotations.complete;

            let finalResults=[];
            // Get the annotations as well.
            if(readingList_annotations && readingList_annotations.length>0){
                let max;
                for (let elem of readingList_annotations)
                    if(!max || elem.date>max.date)
                        max = elem;
                if (max)
                    finalResults.push(max);
                return finalResults;
                console.log(finalResults);//for testing, remove later.
            }
            else{
                const value=localStorage.getItem(room);
                if(value==null)
                    return finalResults;
            }
        } catch (e) {
            console.log(e);
        }
    }

    else {
        const value = localStorage.getItem(room);
        let finalResults = [];
        if(value == null)
            return finalResults;
        else finalResults.push(value);
        return finalResults;
    }
}
window.getCachedAnnotationData = getCachedAnnotationData;


/**
 * Given the returned story data from mongoDB, it returns the value of
 * the field author.
 */
function getAuthor(data) {
    if(data.author == null && data.author === undefined){
        return "unavailable";
    }
    return data.author;
}

function getTitle(data) {
    if(data.title == null && data.title === undefined){
        return "unavailable";
    }
    return data.title;
}

function getDescription(data) {
    if(data.description == null && data.description === undefined){
        return "unavailable";
    }
    return data.description;
}

function getImageURL(data) {
    if(data.imageUrl == null && data.imageUrl === undefined){
        return "unavailable";
    }
    return data.imageUrl;
}
