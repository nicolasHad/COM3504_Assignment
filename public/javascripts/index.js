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

    if('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }

    onSubmit2('/home');
    let roomList=JSON.parse(localStorage.getItem('roomList'));
    console.log(roomList);
    //@todo here is where you should initialise the socket operations as described in teh lectures (room joining, chat message receipt etc.)
}

/**
 * Initial version:to be updated(Nicolas)
 * given the list of previously visited stories for the user, it will retrieve all the STORIES data from
 * the server (or failing that) from the indexedDB, and the annotations of each story from indexedDB
 * @param forceReload true if the data is to be loaded from the server
 */
function loadData(forceReload){
    var storyList=JSON.parse(localStorage.getItem('stories'));;
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
    refreshStoryList();
    for (let index in storyList)
        loadStoryData(storyList[index], forceReload);
}

/**
 * given one story, it queries the mongoDB to get the latest
 * the story object
 * if the request to the server fails, it shows the data stored in the indexedDB
 * Meanwhile, the annotations for the story are retrieved directly from indexedDB
 * @param storyID(?)
 * @param forceReload true if the data is to be retrieved from the server
 */
async function loadStoryData(author,title,forceReload){
    let cachedData=await getCachedStoryData(author,title);
    if(!forceReload && cachedData && cachedData.length>0){
        for (let res of cachedData) {
            addToResults(res);
        }
    }
    else{
        const input = JSON.stringify({author:author,title:title});
        $.ajax({
            url:'/getSelectedStoryData',
            data: input,
            contentType: 'application/json',
            type: 'POST',
            success: function(dataR){
                addToResults(dataR);
                storeCachedData(dataR);
                if(document.getElementById('offline_div')!=null)
                    document.getElementById('offline_div').style.display='none';
            },
            //If the server request has failed, show the cached data
            error: function (xhr,status,error) {
                //showOfflineWarning();
                getCachedStoryData(author,title);
                const dvv = document.getElementById('offline_div');
                if(dvv!=null)
                    dvv.style.display='block';
            }
        });
    }

    if(document.getElementById('story_list')!=null)
        document.getElementById('story_list').style.display='none';
}

function addToResults(dataR) {
    if (document.getElementById('results') != null) {
        const row = document.createElement('div');
        // appending a new row
        document.getElementById('results').appendChild(row);
        // formatting the row by applying css classes
        row.classList.add('card');
        row.classList.add('my_card');
        row.classList.add('bg-faded');
        // the following is far from ideal. we should really create divs using javascript
        // rather than assigning innerHTML
        row.innerHTML = "<div class='card-block'>" +
            "<div class='row'>" +
            "<div class='col-sm'>" + dataR.author + "</div>" +
            "<div class='col-sm'>" + dataR.title + "</div>" +
            "<div class='col-sm'>" + dataR._id + "</div>" +
            "<div class='col-sm'>" + dataR.description + "</div>" +
            "<div class='col-sm'></div></div></div>";
    }
}

async function loadAnnotationData(room,forceReload){
    return 0;
}

/**
 * it enables selecting a story from the stories menu.
 * it saves the selected story in the database so that it can be retrieved next time
 * @param story
 *
function selectStory(story) {
    var storyList=JSON.parse(localStorage.getItem('stories'));
    if (storyList==null) storyList=[];
    storyList.push(story);
    storyList = removeDuplicates(storyList);
    localStorage.setItem('storyList', JSON.stringify(storyList));
    retrieveAllStoriesData(storyList, true);
}
*/

//Called every time the user connects toa room.
//So that we keep track of which rooms were visited.
//Will use the list of vidited rooms to retrieve annotation and story data for each room, so
//that the user can re-visit visited rooms.
function selectRoom(roomId) {
    var roomList=JSON.parse(localStorage.getItem('roomList'));
    if (roomList==null)
        roomList=[];
    roomList.push(roomId);
    roomList = removeDuplicates(roomList);
    localStorage.setItem('roomList', JSON.stringify(roomList));
    //retrieveAllStoriesData(roomList, true);
    console.log('room '+roomId+' added to roomList');
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
 * it removes all forecasts from the result div
 */
function refreshStoryList(){
    if (document.getElementById('results')!=null)
        document.getElementById('results').innerHTML='';
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
    // Note: Story id is set to 1 for now for testing purposes.It will get adapted
    // to be the id of the corresponding story the annotation is drawn on.
    let roomId=document.getElementById('roomNo').value;
    const annot_object = new WrittenAnnotation(roomId,'test_body'); //Create the text(annotation) object as soon as it's created.Cache it using indexedDB(storecachedData)
    await storeCachedData(annot_object);

    // @todo send the chat message
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom() {
    roomNo = document.getElementById('roomNo').value;
    name = document.getElementById('firstname').value;

    selectRoom(roomNo); // Add the room to the lists of rooms visited.

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
    document.getElementById('results').style.display = 'none';
    document.getElementById('center').style.display = 'none';
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

//TESTING METHODS//
function sendAxiosQuery2(url, data) {
    axios.post(url, data)
        .then((dataR) => {
            // we need to JSON stringify the object
            for (let rec of dataR.data) {
                const row = document.createElement('div');
                    // appending a new row
                    document.getElementById('results').appendChild(row);
                    // formatting the row by applying css classes
                    row.classList.add('card');
                    row.classList.add('my_card');
                    row.classList.add('bg-faded');
                    row.innerHTML = "<div class='card-block'>" +
                        "<div class='row'>" +
                        "<div class='col-sm'>" + rec.author + "</div>" +
                        "<div class='col-sm'>" + rec.title + "</div>" +
                        "<div class='col-sm'>" + rec._id + "</div>" +
                        "<div class='col-sm'>" + rec.description + "</div>" +
                        "<div class='col-sm'></div></div></div>";
            }
        })
        .catch(function (response) {
            alert(JSON.stringify(response));
        })
}

function onSubmit2(url) {
    event.preventDefault();
    //var formArray= $("form").serializeArray();
    var data={};

    // const data = JSON.stringify($(this).serializeArray());
    sendAxiosQuery2(url, data);
}

// Create the annotations/story classes.(NOT SURE IF WE REALLY NEED THEM,IF NOT IGNORE)
// We define an annotation object by specifying story(the story where the annotation belongs to) and the body(the chat text).
//I've changed the story field to room, because the annotations are linked to the room,not the story.
class WrittenAnnotation{
    constructor(room, body) {
        this.room=room;
        this.body=body;
        this.type = "annotation";
    }
}

class DrawnAnnotation{
    constructor(room, ctx, canvas_width, canvas_height, prevX, prevY, currX, currY, color, thickness) {
        this.room=room;
        this.ctx=ctx;
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
        this.prevX = prevX;
        this.prevY = prevY;
        this.currX = currX;
        this.currY = currY;
        this.color = color;
        this.thickness = thickness;
        this.type = "annotation";
    }
}

