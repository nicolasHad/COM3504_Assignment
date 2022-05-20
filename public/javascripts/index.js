let name = null;
let roomNo = null;

let chat = io.connect('/chat');


// Initialise service url and google api key for KG.
const service_url = 'https://kgsearch.googleapis.com/v1/entities:search';
const apiKey = 'AIzaSyAG7w627q-djB4gTTahssufwNOImRqdYKM';

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 * Also registers the service worker and throws an error in case the
 * browser does not support service workers
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';
    document.getElementById('typeForm').style.display = 'none';
    roomNo = document.getElementById('roomNo').value;

    if ('indexedDB' in window) {
        initDatabase();
    } else {
        console.log('This browser doesn\'t support IndexedDB');
    }
    //Checks if browser supports service workers and registers them
    //Returns an error if not
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function (serviceWorker) {
                console.log('Service Worker Registered');
                serviceWorker.update();
            }), function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        };
    }

    let roomList = JSON.parse(localStorage.getItem('roomList'));
    console.log(roomList);

    //here is where you should initialise the socket operations as described in the lectures (room joining, chat message receipt etc.)
    chat.on('joined', function (room, userId) {
        if (userId === name) {
            // it enters the chat
            hideLoginInterface(roomNo, userId);
        } else {
            // notifies that someone has joined the room
            writeOnHistory('<b>' + userId + '</b>' + ' joined room ' + roomNo);
        }
    });
    // called when a message is received
    chat.on('chat', function (room, userId, chatText) {
        let who = userId
        if (userId === name) who = 'Me';
        writeOnHistory('<b>' + who + ':</b> ' + chatText);
    });

}

/**
 * it inits the widget by selecting the type from the field myType
 * and it displays the Google Graph widget
 * it also hides the form to get the type
 */
function widgetInit() {
    let type = document.getElementById("myType").value;
    if (type) {
        let config = {
            'limit': 10,
            'languages': ['en'],
            'types': [type],
            'maxDescChars': 100,
            'selectHandler': selectItem,
        }
        KGSearchWidget(apiKey, document.getElementById("myInput"), config);
        document.getElementById('typeSet').innerHTML = 'of type: ' + type;
        document.getElementById('widget').style.display = 'block';
        document.getElementById('typeForm').style.display = 'none';
    } else {
        alert('Set the type please');
        document.getElementById('widget').style.display = 'none';
        document.getElementById('resultPanel').style.display = 'none';
        document.getElementById('typeSet').innerHTML = '';
        document.getElementById('typeForm').style.display = 'block';
    }
}

/**
 * callback called when an element in the widget is selected
 * @param event the Google Graph widget event {@link https://developers.google.com/knowledge-graph/how-tos/search-widget}
 */
function selectItem(event) {
    let row = event.row;
    let roomId = document.getElementById('roomNo').value;
    let story = document.getElementById('story_title').value;
    let KGannot = new KGAnnotation(roomId, story, row.id, row.name, row.rc, row.qc);
    storeCachedAnnotation(KGannot);
    document.getElementById('widget').style.display = 'none';

    let tbody = document.getElementById('tbody_KG');

    // As soon as a KG element is chosen, this will directly be appended to
    // the KG annotations table. Done by adding table rows using JS.
    let table_row = document.createElement('tr');
    let heading_1 = document.createElement('td');
    heading_1.innerText = row.id;
    let heading_2 = document.createElement('td');
    heading_2.innerText = row.name;
    let heading_3 = document.createElement('td');
    heading_3.innerText = row.rc;
    let heading_4 = document.createElement('td');
    heading_4.innerText = row.qc;

    table_row.appendChild(heading_1);
    table_row.appendChild(heading_2);
    table_row.appendChild(heading_3);
    table_row.appendChild(heading_4);
    tbody.appendChild(table_row);


}

/**
 * Method for showing the KG form
 */
function showKGForm() {
    document.getElementById('typeForm').style.display = 'block';
}


/**
 * given the list of previously visited stories for the user, it will retrieve all the STORIES data from
 * the server (or failing that) from the indexedDB, and the annotations of each story from indexedDB
 * @param forceReload true if the data is to be loaded from the server
 */

function loadData(forceReload) {
    var storyList = JSON.parse(localStorage.getItem('storyList'));
    storyList = removeDuplicates(storyList);
    retrieveAllStoriesData(storyList, forceReload);
    document.getElementById("storiesBody").innerText="";
}

/**
 * it cycles through the list of stories and requests the data from the server for each
 * story
 * @param storyList the list of the cities the user has requested
 * @param forceReload true if the data is to be retrieved from the server
 */
function retrieveAllStoriesData(storyList, forceReload) {
    for (let index in storyList.reverse())
        loadStoryData(storyList[index], forceReload);
}

/**
 * given one story, it queries the mongoDB to get the latest
 * the story object
 * if the request to the server fails, it shows the data stored in the indexedDB
 * @param title
 * @param forceReload true if the data is to be retrieved from the server
 */
async function loadStoryData(title, forceReload) {
    // First check for the story in the cached stories.
    // If present, use this.
    let cachedData = await getCachedStoryData(title);
    if (!forceReload && cachedData && cachedData.length > 0) {
        for (let res of cachedData) {
            addToResults(res);
        }
        return cachedData[0];
    }
    // If not in the cached stories, query the server for the story.
    else {
        const input = JSON.stringify({title: title});
        $.ajax({
            url: '/getSelectedStoryData',
            data: input,
            contentType: 'application/json',
            type: 'POST',
            // If querying the server is successful, call addToResults method
            // to append the result to the page's contents/
            success: function (dataR) {
                addToResults(dataR);
                if (document.getElementById('offline_div') != null)
                    document.getElementById('offline_div').style.display = 'none';
            },
            //If the server request has failed, show the cached data
            error: function (xhr, status, error) {
                alert(error);
                let cachedData = getCachedStoryData(title);
                addToResults(cachedData);
            }
        });
    }

    if (document.getElementById('story_list') != null)
        document.getElementById('story_list').style.display = 'none';
}

/**
 * Method taking story data as parameter and appending an HTML card with
 * the story's information using JS.
 * @param dataR
 */
function addToResults(dataR) {
    if (document.getElementById('storiesBody') != null) {
        let bodyElement = document.getElementById('storiesBody');
        let cardElement = document.createElement('div');
        let imageContainer = document.createElement('div');
        let infoContainer = document.createElement('div');
        let imageElement = document.createElement('img');
        let headingElement = document.createElement('h5');
        let authorElement = document.createElement('h5');
        let paragraphElement = document.createElement('p');
        let btnElement = document.createElement('a');
        var br = document.createElement("br");


        let formId = "form" + Math.random().toString();
        let formElement = document.createElement('form');
        formElement.setAttribute("id", formId);
        formElement.setAttribute("method", "post");
        formElement.setAttribute("action", "/individual_storyPage");

        var titleInput = document.createElement("input");
        titleInput.setAttribute("type", "text");
        titleInput.setAttribute("name", "title");
        titleInput.setAttribute("value", dataR.title);
        titleInput.setAttribute("readonly", "true");

        var authorInput = document.createElement("input");
        authorInput.setAttribute("type", "text");
        authorInput.setAttribute("name", "author");
        authorInput.setAttribute("value", dataR.author);
        authorInput.setAttribute("readonly", "true");

        var descriptionInput = document.createElement("input");
        descriptionInput.setAttribute("type", "text");
        descriptionInput.setAttribute("name", "description");
        descriptionInput.setAttribute("value", dataR.description);
        authorInput.setAttribute("readonly", "true");

        var imageInput = document.createElement("input");
        imageInput.setAttribute("type", "text");
        imageInput.setAttribute("name", "imageUrl");
        imageInput.setAttribute("value", dataR.imageUrl);
        imageInput.setAttribute("readonly", "true");

        let btn = document.createElement('input');
        btn.setAttribute("type", "submit");
        btn.setAttribute("value", "Read");

        formElement.appendChild(titleInput);
        formElement.appendChild(authorInput);
        formElement.appendChild(descriptionInput);
        formElement.appendChild(imageInput);
        formElement.appendChild(btn);
        formElement.appendChild(br);

        bodyElement.appendChild(formElement);
        titleInput.style.display = 'none';
        authorInput.style.display = 'none';
        descriptionInput.style.display = 'none';
        imageInput.style.display = 'none';

        cardElement.className = "storyCard";
        imageContainer.className = "image-container";
        infoContainer.className = "info-container"
        imageElement.className = "image";
        headingElement.className = "heading";
        authorElement.className = "author";
        paragraphElement.className = "paragraph";
        imageElement.src = dataR.imageUrl;
        imageElement.setAttribute("alt", "Image of story");
        headingElement.innerText = dataR.title;
        authorElement.innerText = "By: " + dataR.author;
        paragraphElement.innerText = "About: " + dataR.description;

        bodyElement.appendChild(cardElement);
        cardElement.append(imageContainer, infoContainer);

        imageContainer.appendChild(imageElement);
        infoContainer.append(headingElement, authorElement, paragraphElement, formElement);
    }
}

/**
 * Method storing a story in indexedDB
 * @returns {Promise<void>}
 */
async function storeStoryINIdb() {
    //Take the values of the story form fields.
    let author = document.getElementById('authorName').value;
    let title = document.getElementById('authorTitle').value;
    let desc = document.getElementById('authorDescription').value;
    let url = document.getElementById('image_url').value;
    // cache the data using the idb method
    storeCachedStory(author, title, desc, url);
    alert("Successfully created story");
}


/**
 * Called every time the user connects to a room.
 * So that we keep track of which rooms were visited.
 * @param roomId
 */
function selectRoom(roomId) {
    var roomList = JSON.parse(localStorage.getItem('roomList'));
    if (roomList == null)
        roomList = [];
    roomList.push(roomId);
    roomList = removeDuplicates(roomList);
    localStorage.setItem('roomList', JSON.stringify(roomList));
    console.log('room ' + roomId + ' added to roomList');
}

/**
 * Every time a story is created ,the title is stored
 * in local storage so we keep track of the stories and restore them.
 * @param story
 */
function addStoryToList(story) {
    var storyList = JSON.parse(localStorage.getItem('storyList'));
    if (storyList == null)
        storyList = [];
    storyList.push(story);
    localStorage.setItem('storyList', JSON.stringify(storyList));
    console.log('room ' + story + ' added to roomList');
}

/**
 * Given a list of rooms, it removes any duplicates
 * @param roomList
 * @returns {Array}
 */
function removeDuplicates(roomList) {
    // remove any duplicate
    var uniqueNames = [];
    $.each(roomList, function (i, el) {
        if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
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

    let roomId = document.getElementById('roomNo').value;
    let story = document.getElementById('story_title').value;
    const annot_object = new WrittenAnnotation(roomId, story, chatText); //Create the text(annotation) object as soon as it's created.Cache it using indexedDB(storecachedData)
    storeCachedAnnotation(annot_object);

    //send the chat message
    chat.emit('chat', roomNo, name, chatText);
    document.getElementById('chat_input').value = '';
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
async function connectToRoom() {
    roomNo = document.getElementById('roomNo').value;
    name = document.getElementById('firstname').value;
    let title = document.getElementById('story_title').value;

    selectRoom(roomNo); // Add the room to the lists of rooms visited.
    const storyData = await loadStoryData(title, false)
        .then((response) => {
            return JSON.stringify(response);
        })

    if (!name) name = 'Unknown-' + Math.random();
    //join the room
    chat.emit('create or join', roomNo, name);
    initCanvas(chat, JSON.parse(storyData).imageUrl);
    hideLoginInterface(roomNo, name);

    //set story details in view.
    let row = document.getElementById('story_desc');
    row.innerHTML =
        "<p>  <b>Author:</b>" + JSON.parse(storyData).author + "</p>" +
        "<p>  <b>Title:</b>" + JSON.parse(storyData).title + "</p>" +
        "<p>  <b>Description:</b>" + JSON.parse(storyData).description + "</p>";


}

/**
 * it appends the given html text to the history div
 * this is to be called when the socket receives the chat message (socket.on ('message'...)
 * @param text: the text to append
 */
function writeOnHistory(text) {
    if (text === '') return;
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
    document.getElementById('who_you_are').innerHTML = userId;
    document.getElementById('in_room').innerHTML = ' ' + room;
    document.getElementById('storiesBody').style.display = 'none';
}


function sendAxiosQuery(url, data) {
    axios.post(url, data)
        .then((dataR) => {// no need to JSON parse the result, as we are using
        })
        .catch(function (response) {
            alert(response);
        })
}

async function onSubmit(url) {
    var formArray = $("form").serializeArray();
    var data = {};
    for (index in formArray) {
        data[formArray[index].name] = formArray[index].value;
    }
    console.log("the DATA", data.authorTitle);

    addStoryToList(data.authorTitle);
    sendAxiosQuery(url, data);
    event.preventDefault();
}


/**
 * Method used for sending data to the server and retrieving all stories.
 * @param url
 * @param data
 * @returns {Promise<void>}
 */
async function sendAxiosQuery_2(url, data) {
    axios.post(url, data)
        .then((dataR) => {// no need to JSON parse the result, as we are using
            console.log(dataR.data);
            for (let d of dataR.data) {
                addToResults(d);
            }
        })
        .catch(async function (response) {
            alert(response);

        })
}


/**
 * Method called on the onload of the body in all stories page.
 * It calls the above method to get all stories data.
 * @param url
 * @returns {Promise<void>}
 */
async function onSubmit_2(url) {
    var formArray = $("form").serializeArray();
    var data = {};
    for (index in formArray) {
        data[formArray[index].name] = formArray[index].value;
    }
    // const data = JSON.stringify($(this).serializeArray());
    //addStoryToList(data.authorTitle);
    sendAxiosQuery_2(url, data);
    event.preventDefault();
}

// Create the annotations/story classes
// We define an annotation object by specifying story(the story where the annotation belongs to) and the body(the chat text).
class WrittenAnnotation {
    constructor(room, story, body) {
        this.room = room;
        this.story = story;
        this.body = body;
    }
}

class DrawnAnnotation {
    constructor(room, story, canvas_width, canvas_height, prevX, prevY, currX, currY, color, thickness) {
        this.room = room;
        this.story = story;
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

class KGAnnotation {
    constructor(room, story, resId, resName, resDescription, resUrl) {
        this.room = room;
        this.story = story;
        this.resId = resId;
        this.resName = resName;
        this.resDescription = resDescription;
        this.resUrl = resUrl;
    }
}