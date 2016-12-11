#Playlist Editor
A cross platform playlist editor written in Javascript for Electron on Node.

It can be extended easily to other formats as an interface is used between the 
playlist parsing files and the app. You just need to provide an implementation 
in the Parser folder with the name of the extention. If it does not have an 
extention, name appropriately and a dialog will be shown to the user asking for 
the playlist type.

When writing a new script for another playlist type, refer to the m3u file to 
for a way to implement it. It was designed to playlist type independent so that
the only function you will have to change is the getRawPaths function to read
the playlist paths from the file. The option is still there however to provide 
your own implementation as long as it can respond to the interface correctly.

As an example for adding Audacious playlist support, I duplicated the m3u.js
file and changed the $.grep filter to grab the lines the .audpl file and added a
line in addTrackPaths to strip the extra text on the lines. Functionality to
decode the text and save the paths already existed so that was the extent of the
changes. The app could now play the tracks in the playlist and save it into the
m3u format.


##Features
- Cross platform
- Drag and Drop sorting of songs
- Embedded audio player to play songs
- Saving for absolute and relative file paths
- Exporting all the songs in a playlist to a folder
- Importing songs from another playlist into the current one
- Shuffling a playlist


##Playlist Support
- M3U
- Audacious (audpl)

---
##TODO
- Support for the following playlists
	- Windows Playlist (wpl)
