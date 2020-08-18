/* Author: Christopher Bartholomew, 08/18/2020
 * Purpose: Download Images & Videos - For Single Month.
 * Usage:
 * 1. Open Chrome
 * 2. Depending on what you're doing, you might be want to go to Chrome Settings and re-point 
 *    your download folder for the person you're downloading.  
 * 3. Login to Tadpoles
 * 4. Press F12 to bring up the developer menu, then select the "Console" Tab. 
 * 5. Select a child or "all children" 
 * 6. Select a Month
 * 7. Copy and Paste this script to the console.
 * 8. Press Enter to Run (Note, it might prompt you allow multiple downloads, select yes)
 * 9. Files are saved in Chrome's default download location.  
 */
 
// enable extended jquery commands for tadpoles (.each command)
var jqry = document.createElement('script');
jqry.src = "https://code.jquery.com/jquery-3.3.1.min.js";
document.getElementsByTagName('head')[0].appendChild(jqry);

// do not touch variables here. 
var index = 0;
var sleepTrack = 0;
var extPhoto = ".jpg";
var extVideo = ".mp4";
var VideoAuthHash = {};

// chrome only allows 10 downloads at once, this allows
// for the script to download more than 10 by pausing the requests 2 seconds. 
function sleep(milliseconds) {
    let timeStart = new Date().getTime();
    while (true) {
        let elapsedTime = new Date().getTime() - timeStart;
        if (elapsedTime > milliseconds) {
            break;
        }
    }
}


// primary function that builds a fake "download link" 
// then acts as if it is clicked. 
function downloadURI(uri,name, isVideo) {
	try {
		var link = document.createElement("a");
		link.download = (!isVideo) ? name + extPhoto : name + extVideo;
		link.href = uri;
		link.click();
	} catch(e) {		
		return false;
	}

  return true;
}

// for videos, each video has its own auth key, this builds a 
// dictionary of auth keys and stores them in a hash table by
// video id that is parsed from the div. 
function getKeys() {
	$("div").each(function(){ 
		if($(this).attr("rel") != null) 
		{ 
			var indexOfAuthKey = $(this).attr("rel").indexOf("&key=") ;
			var indexOfObj = $(this).attr("rel").indexOf("obj=");
			var lengthOfURL = $(this).attr("rel").length;
			var videoObj = $(this).attr("rel").substring(indexOfObj + 4,indexOfAuthKey);
			var key = $(this).attr("rel").substring(indexOfAuthKey + 5,lengthOfURL);
			
			VideoAuthHash[videoObj] = key
		} 
	});
}

// collect the keys
getKeys();

// for each image, collect the download link, then download. 
$(".fancybox").each(function(index)
	{ 
		var imageName = index;
		var isVideo = (this.type != "image") ? true : false;
		var videoKey = "";
		var uri = "";
		if(isVideo){
			var vId = this.id.replace("-default","").replace("-a","");			
			if(VideoAuthHash[vId]){
				videoKey = VideoAuthHash[vId];
			} else {				
				console.log("no auth key for: " + vId);
			}
			uri = "https://www.tadpoles.com/remote/v1/obj_attachment?obj=" + vId + "&key=" + videoKey + "&download=true";
		} else {
			uri = this.href + "&download=true"
		}
		
		// debug
		//console.log(uri)
		
		if(!downloadURI(uri,imageName,isVideo)) { 
			console.log(index);
		} else {
			sleepTrack++;
			if(sleepTrack > 9){
				sleep(2000);
				sleepTrack = 0;
			} 
		}
});