let name = null;
let roomNo = null;
let socket=null;


/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */

function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';

    //Here include the indexedDB init function(ONCE I implement it) if the browser supports idb(can be found in Week4.b -IndexedDB solution)
    if('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }

    //@todo here is where you should initialise the socket operations as described in teh lectures (room joining, chat message receipt etc.)
}


/**
 * Initial version:to be updated(Nicolas)
 * given the list of previously visited stories for the user, it will retrieve all the STORIES data from
 * the server (or failing that) from the indexedDB, and the annotations of each story from indexedDB
 * @param forceReload true if the data is to be loaded from the server
 */
function loadData(forceReload){
    var storyList=[];
    storyList=removeDuplicates(storyList);
    retrieveAllStoriesData(storyList, forceReload);
}

/**
 * it cycles through the list of stories and requests the data from the server for each
 * story
 * @param cityList the list of the cities the user has requested
 * @param date the date for the forecasts (not in use)
 * @param forceReload true if the data is to be retrieved from the server
 */
function retrieveAllStoriesData(storyList, forceReload){
    //refreshStoryList();
    //for (let index in storyList)
        //loadCityData(storyList[index], date, forceReload);
}

/**
 * given one story, it queries the mongoDB to get the latest
 * the story object
 * if the request to the server fails, it shows the data stored in the indexedDB
 * Meanwhile, the annotations for the story are retrieved directly from indexedDB
 * @param storyID(?)
 * @param forceReload true if the data is to be retrieved from the server
 */
async function loadStoryData(story,forceReload){
    return null;
}

/**
 * it enables selecting a story from the stories menu.
 * it saves the selected story in the database so that it can be retrieved next time
 * @param story
 * @param date
 */
function selectStory(story) {
    var storyList=JSON.parse(localStorage.getItem('stories'));
    if (storyList==null) storyList=[];
    storyList.push(story);
    storyList = removeDuplicates(storyList);
    localStorage.setItem('storyList', JSON.stringify(storyList));
    retrieveAllStoriesData(storyList, true);
}

/**
 * Given a list of stories, it removes any duplicates
 * @param storyList
 * @returns {Array}
 */
function removeDuplicates(storyList) {
    // remove any duplicate
    var uniqueNames=[];
    $.each(storyList, function(i, el){
        if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });
    return uniqueNames;
}

/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
    roomNo = Math.round(Math.random() * 10000);
    document.getElementById('roomNo').value = 'R' + roomNo;
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
async function sendChatText() {
    let chatText = document.getElementById('chat_input').value;

    // These 2 lines is for me(Nicolas), I just put it here and I'll come back to it later
    // Note: Story id is set to 1 for now for testing purposes.It will get adapated
    // to be the id of the corresponding story the annotation is drawn on.
    //const annot_object = new WrittenAnnotation(1,'test_body'); //Create the text(annotation) object as soon as it's created.Cache it using indexedDB(storecachedData)
    //await storeCachedData(annot_object);

    // @todo send the chat message
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom() {
    roomNo = document.getElementById('roomNo').value;
    name = document.getElementById('firstname').value; // Bug fixed, elementId was wrong
    let imageUrl= document.getElementById('image_url').value;
    if (!name) name = 'Unknown-' + Math.random();
    //@todo join the room
    initCanvas(socket, imageUrl);
    hideLoginInterface(roomNo, name);
}

/**
 * it appends the given html text to the history div
 * this is to be called when the socket receives the chat message (socket.on ('message'...)
 * @param text: the text to append
 */
function writeOnHistory(text) {
    if (text==='') return;
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    // scroll to the last element
    history.scrollTop = history.scrollHeight;
    document.getElementById('chat_input').value = '';
}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;
}


// These two functions are used to get the data from the form and send it to the controller I think
// I am not sure, I took them from the lab
function sendAxiosQuery(url, data) {
    axios.post(url, data)
        .then((dataR) => {// no need to JSON parse the result, as we are using
            // we need to JSON stringify the object
            document.getElementById('results').innerHTML = JSON.stringify(dataR.data);
        })
        .catch(function (response) {
            alert(response.toJSON());
        })
}

function onSubmit(url) {
    var formArray= $("form").serializeArray();
    var data={};
    for (index in formArray){
        data[formArray[index].name]= formArray[index].value;
    }
    // const data = JSON.stringify($(this).serializeArray());
    sendAxiosQuery(url, data);
    event.preventDefault();
}


// Create the annotations/story classes.(NOT SURE IF WE REALLY NEED THEM,IF NOT IGNORE)
// We define an annotation object by specifying story(the story where the annotation belongs to) and the body(the chat text).
class WrittenAnnotation{
    constructor(story, body) {
        this.story=story;
        this.body=body;
        this.type = "annotation";
    }
}

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

class Story{
    constructor(author,title,description,imageURL) {
        this.author=author;
        this.title=title;
        this.description = description;
        this.imageURL = imageURL;
        this.type='story';

    }
}