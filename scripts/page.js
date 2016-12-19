var playlistParser = require('./scripts/PlaylistParserInterface');
var Sortable = require("sortablejs");

var AudioEngine = require("./scripts/AudioEngine");

var trackExporter = require("./scripts/TrackExporter");

const electron = require('electron');
const remote = electron.remote;
const dialog = remote.dialog;
const shell = electron.shell;

var audioPlayer;

document.getElementById("playlistSelect").addEventListener("click", loadPlaylist);
document.getElementById("importPlaylist").addEventListener("click", importPlaylist);

document.getElementById("refreshPlaylist").addEventListener("click", refreshPlaylist);

document.getElementById("SelectionUp").addEventListener("click", moveSelectionUp);
document.getElementById("SelectionDown").addEventListener("click", moveSelectionDown);
document.getElementById("Add").addEventListener("click", addTracks);
document.getElementById("SelectionDelete").addEventListener("click", deleteSelection);

document.getElementById("savePlaylist").addEventListener("click", savePlaylist);
document.getElementById("exportTracks").addEventListener("click", exportPlaylist);


document.getElementById("shufflePlaylist").addEventListener("click", shufflePlaylist);

document.getElementById("PlayPause").addEventListener("click", audioPlayPause);
document.getElementById("NextTrack").addEventListener("click", audioNext);
document.getElementById("PrevTrack").addEventListener("click", audioPrev);
document.getElementById("StopTrack").addEventListener("click", audioStop);
document.getElementById("VolumeRange").addEventListener("input", audioNewVolume);

$(window).on('resize',() => {
	//need a delay otherwise electron will get too laggy.
	//delay is defined in utils.js
	delay(pageResize, 2000);
}); 

function loadPlaylist()
{
	playlistParser.parse(openFileSync([{name: 'Playlists', extensions: ['m3u','audpl','wpl']}, {name: 'All Files', extensions:["*"]}]));
	setTimeout(refreshPlaylist, 200);//wait for async calls to finish from parsing the playlist
	//playlistParser.parse("/media/ryan/90B287ADB28795FE/Users/Ryan/Music/Playlists/Last Played.m3u")
}

function importPlaylist()
{
	openFile("Import a Playlist", [{name: 'Playlists', extensions: ['m3u','audpl','wpl']}, {name: 'All Files', extensions:["*"]}], (paths) => {
		playlistParser.parseAdditionalPlaylist(paths[0]);
		setTimeout(refreshPlaylist, 200);
	});	
}

function addTracks()
{
	var validExtentions = ['mp3', 'wav', 'm4a'];
	openFiles("Select Music Files", [{name: 'Music Files', extensions: validExtentions}, {name: 'All Files', extensions:["*"]}], (paths) => {
		playlistParser.addTracks(paths);
		setTimeout(refreshPlaylist, 200);
	});	
}


function refreshPlaylist()
{
	let trackNames = playlistParser.getTrackNames();
	let paths = playlistParser.getPaths();
	//console.log(paths);
	
	let nameSpan = document.getElementById("playlistName");
	let playlistElem = document.getElementById("playlist");
	
	//clear old playlist
	removeChildElements(playlistElem);
	
	nameSpan.innerHTML = playlistParser.getPlaylistProps().name;
	
	for (let i=0;i<paths.length;i++)
	{
		let li = document.createElement('li');
		let iTag = document.createElement('i');
		li.innerHTML = trackNames[i];//set track name
		li.dataset.path = paths[i];//set paths
		
		iTag.className = "playIcon fa fa-play";
		
		li.appendChild(iTag);
		playlistElem.appendChild(li);	
		
	}
	
	//Selection code to register it.
	$("li").click(function(e) {  //use a class, since your ID gets mangled
		if($(e.target).is(".fa-play")) return;
	
		if ($(this).hasClass("playlistSelected"))
			$(this).removeClass("playlistSelected");
		else
			$(this).addClass("playlistSelected"); 
  	});
}

function savePlaylist()
{
	var info = "Relative paths are well suited to windows and linux as it contains no OS dependent information." + "\n" +
		   "However some media players only work on absolute file paths so in some circumstances it is" + 
		   "better to export absolute, this has the draw back of being os dependent though.";
		   
	var options = ["Absolute", "Relative", "Information", "Cancel"]
	
	var choice = showDialog("Do you want to save with absolute or relative file paths?",
			"info", options, "Export Playlist");
	
	//if cancel was chosen.
	if (choice == 3)
		return;
	
	if (choice == 2)
	{
		showDialog(info, "info", ["OK"], "Information");
	}
	
	var savePath = saveFile();
	if (!isValidName(savePath))
		return;
	
	playlistParser.exportPlaylist(options[choice].toLowerCase(), savePath);	
}

function exportPlaylist()
{	
	openFolder((paths) => {
		var trackPaths = playlistParser.getPaths()
		var exportPath = trackExporter.copy(trackPaths, paths[0]);
		shell.showItemInFolder(exportPath);
	});	
}

function isValidName(savePath)
{
	if (savePath == undefined)
		return false;
	if (savePath.split('.').pop() != 'm3u')
	{
		response = showDialog("You are saving to a file without a .m3u file extention, are you sure you want to continue?",
					"warning", ["Yes", "No"], "Save File Warning");
		//if the user selected no.
		if (response == 1)
		{
			console.log("User stopped file saving");
			return false;
		}
	}
	return true;
}

//--------Player code------
function newAudioTrack(ElemItem)
{
	if (audioPlayer != undefined)
	{
		audioPlayer.newFile(ElemItem.dataset.path);
	}
	else
	{
		audioPlayer = new AudioEngine.audio(ElemItem.dataset.path, true, true);
	}

	var trackName = $("#trackName");
	trackName.get(0).innerHTML = ElemItem.textContent;
	
	if (trackName.get(0).scrollWidth > trackName.width()) {
        var scrollDistance = trackName.scrollWidth - trackName.width;
        // Stop any current animation
        trackName.stop();
        
        // Start animating the left scroll position over 3 seconds, using a smooth linear motion
        trackName.animate({scrollLeft: scrollDistance}, 3000, 'linear');
	}
}

function audioPlayPause()
{
	if (audioPlayer == undefined)
	{
		alert("no audio!");
		return;
	}
	var isPlaying = audioPlayer.playing
	audioPlayer.PlayPause();
	var elem = $("#PlayPause")[0];
	if (isPlaying)
	{
		elem.className = "fa fa-play controlsPad";
	}
	else
	{
		elem.className = "fa fa-pause controlsPad";
	}
}

function audioPrev()
{
	var currentPlayingElem = $("#playlist").find("[data-path='" + decodeURI(cleanPath(audioPlayer.audio.src)) + "']");
	if (currentPlayingElem.length != 0)
	{
		newAudioTrack(currentPlayingElem[0].previousSibling);
	}
}

function audioNext()
{
	var currentPlayingElem = $("#playlist").find("[data-path='" + decodeURI(cleanPath(audioPlayer.audio.src)) + "']");
	if (currentPlayingElem.length != 0)
	{
		newAudioTrack(currentPlayingElem[0].nextSibling);
	}
}

function audioNewVolume(event)
{
	if (audioPlayer == undefined)
	{
		alert("no audio!");
		return;
	}
	var vol = event.target.value;
	audioPlayer.setVolume(vol/100);
}

function audioStop()
{
	audioPlayer.Stop();
}
//----End Audio Code-----

//-----Selection Code------
function moveSelectionDown()
{
	var selected = $(".playlistSelected");
	if (selected == undefined)
		return;
	var nextElem = selected[selected.length - 1].nextSibling;
	selected.insertAfter(nextElem);
}

function moveSelectionUp()
{
	var selected = $(".playlistSelected");
	if (selected == undefined)
		return;
	var prevElem = selected[0].previousSibling;
	selected.insertBefore(prevElem);
	$('#playlist').scrollTop($('.playlistSelected').scrollTop()-20);
}

function deleteSelection()
{
	$(".playlistSelected").remove();
}




function pageResize() 
{
	pageWidth = $(window).width();
	pageHeight = $(window).height();
	$("#playlist").width(pageWidth * 0.90);
	$("#playlist").height(pageHeight * 0.55);
}


function init() 
{
	var el = document.getElementById('playlist');
	var sortable = Sortable.create(el, {
		filter: ".playIcon",
		onFilter: (event) => {newAudioTrack(event.item)}
	});
	
	pageResize();
}



//returns the file path of a selected file
//returns undefined if the user canceled the dialog
function openFileSync(fileFilter = [{}])
{
	return dialog.showOpenDialog({title: "Open a playlist", properties: ['openFile'], filters: fileFilter})[0];
}

function openFile(title = "Open a File", fileFilter = [{}], callback)
{
	return dialog.showOpenDialog({title: title, properties: ['openFile'], filters: fileFilter}, callback);
}

function openFiles(title = "Open Files", fileFilter = [{}], callback)
{
	return dialog.showOpenDialog({title: title, properties: ['openFile'], filters: fileFilter}, callback);
}

function openFolderSync()
{
	return dialog.showOpenDialog({properties: ['openDirectory', 'createDirectory']})[0];
}

function openFolder(callback)
{
	return dialog.showOpenDialog({properties: ['openDirectory', 'createDirectory']}, callback);
}

function saveFile()
{
	return dialog.showSaveDialog();
}

//returns which button was pressed in buttons array.
//refer to Electron dialog.showMessageBox
function showDialog(messageText, msgType = "info", msgButtonArray = ["OK"], msgTitle = undefined) 
{
	return dialog.showMessageBox({type:msgType, buttons:msgButtonArray, title: msgTitle, message:messageText});
}


function shufflePlaylist() 
{
	/*http://stackoverflow.com/questions/7070054/javascript-shuffle-html-list-element-order*/
	let playlistElem = document.getElementById("playlist");
	for (var i = playlistElem.children.length; i >= 0; i--) {
		playlistElem.appendChild(playlistElem.children[Math.random() * i | 0]);
	}
}



init();
