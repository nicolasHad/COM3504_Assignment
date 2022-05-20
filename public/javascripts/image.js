//Variable declarations, take elements from ejs file
var start = document.getElementById("start");
var takePic = document.getElementById("capture");
var stop = document.getElementById("stop");
var stream = document.getElementById("stream");
var capture = document.getElementById("captureCanvas");
var snapshot = document.getElementById("snapshot");
var streamingCamera = null;

//Button listeners which take the functions below as parameters
start.addEventListener("click", liveStream);
takePic.addEventListener("click", snap);
stop.addEventListener("click", stopStream);

/**
 * This function utilises the fileReader API which allows for file upload
 * from local. It then transforms the image into base64 and writes it
 * on a text field
 * @param element
 *
 */
function uploadAndConvert(element) {
    var file = element.files[0];
    //Displays an alert when file is bigger than 70kb
    if (file.size > 70000) {
        alert("File is too big!");
    }
    var reader = new FileReader();
    //Base64 Conversion
    reader.onloadend = function () {
        const base64Field = document.getElementById("image_url")
        var base64result = reader.result;
        base64Field.value = base64result
    }
    reader.readAsDataURL(file);
}

/**
 * Starts streaming, throws an errors if it cannot access the camera,
 * throws an error if the browser does not support webRTC
 */
//Start Streaming returns error if it cannot access the device
function liveStream() {
    var media = 'mediaDevices' in navigator;
    if (media && null == streamingCamera) {
        navigator.mediaDevices.getUserMedia({video: true})
            .then(function (mediaStream) {
                streamingCamera = mediaStream;
                stream.srcObject = mediaStream;
                stream.play();
            })
            .catch(function (err) {
                console.log("Cannot access device: " + err);
            });
    } else {
        alert('Your browser is too old probably.');
        return;
    }
}

/**
 * Stops the live stream
 */
function stopStream() {
    if (null != streamingCamera) {
        var getStream = streamingCamera.getTracks()[0];
        getStream.stop();
        stream.load();
        streamingCamera = null;
    }
}

/**
 * Snaps a pic from the live stream, draws it into a canvas element and
 * converts it into base64. Fills a form field with the base64
 */
function snap() {
    if (null != streamingCamera) {
        //Gets canvas context
        var ctx = capture.getContext('2d');
        var img = new Image();
        //Draws the image onto canvas
        ctx.drawImage(stream, 0, 0, capture.width, capture.height);
        img.src = capture.toDataURL("image/png");
        img.width = 240;
        snapshot.innerHTML = '';
        snapshot.appendChild(img);
        //Conversion to base64
        const base64Field = document.getElementById("image_url")
        const base64 = capture.toDataURL();
        base64Field.value = base64
    }
}

/**
 * Jquery function which shows or hides the WebRTC stream and local file upload
 * depending on which item is selected on the dropdown list
 */
$(document).ready(function () {
    $('#selection').on('change', function () {
        if (this.value == '2') {
            $("#web").show();
            $("#fromLocal").hide();
        } else {
            $("#fromLocal").show();
            $("#web").hide();
        }
    });
});