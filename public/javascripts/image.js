//Variable declarations, take elements from ejs file
var start = document.getElementById( "start" );
var takePic = document.getElementById( "capture" );
var stop = document.getElementById( "stop" );
var stream = document.getElementById( "stream" );
var capture = document.getElementById( "captureCanvas" );
var snapshot = document.getElementById( "snapshot" );
var streamingCamera = null;

//Button listeners which take the functions below as parameters
start.addEventListener( "click", liveStream);
takePic.addEventListener( "click", snap);
stop.addEventListener( "click", stopStream);

//This function allows for local file upload and base64 conversion
function uploadAndConvert(element) {
    var file = element.files[0];
    if (file.size > 70000){
        alert("File is too big!");
    }
    var reader = new FileReader();
    reader.onloadend = function() {
        const base64Field = document.getElementById("image_url")
        var base64result = reader.result;
        base64Field.value = base64result
    }
    reader.readAsDataURL(file);
}

//Start Streaming returns error if it cannot access the device
function liveStream() {
    var media = 'mediaDevices' in navigator;
    if( media && null == streamingCamera ) {
        navigator.mediaDevices.getUserMedia( { video: true } )
            .then( function( mediaStream ) {
                streamingCamera = mediaStream;
                stream.srcObject = mediaStream;
                stream.play();
                })
                .catch( function( err ) {
                    console.log( "Cannot access device: " + err );
                });
        }
        else {
            alert( 'Your browser is too old probably.' );
            return;
        }
    }

// Stop Streaming
function stopStream() {
        if( null != streamingCamera ) {
            var getStream = streamingCamera.getTracks()[ 0 ];
            getStream.stop();
            stream.load();
            streamingCamera = null;
        }
    }
//Snap a pic from stream and converts it to base64
function snap() {
    if( null != streamingCamera ) {
        var ctx = capture.getContext( '2d' );
        var img = new Image();
        ctx.drawImage( stream, 0, 0, capture.width, capture.height );
        img.src		= capture.toDataURL( "image/png" );
        img.width	= 240;
        snapshot.innerHTML = '';
        snapshot.appendChild( img );
        const base64Field = document.getElementById("image_url")
        const base64 = capture.toDataURL();
        base64Field.value = base64
        }
    }
//Hides and shows divs depending on dropdown list
$(document).ready(function(){
    $('#selection').on('change', function() {
        if ( this.value == '2')
        {
            $("#web").show();
            $("#fromLocal").hide();
        }
        else
        {
            $("#fromLocal").show();
            $("#web").hide();
        }
    });
});