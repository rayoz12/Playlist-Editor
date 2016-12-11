#Playlist Editor
A cross platform playlist editor written in Javascript for Electron on Node.

It can be extended easily to other formats as an interface is used between the playlist parsing files and the app. You just need to provide an implementation in the Parser folder with the name of the extention. If it does not have an extention, name appropriately and a dialog will be shown to the user asking for the playlist type.  


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

---
##TODO
- Support for the following playlists
    - Audacious (audpl)
    - Windows Playlist (wpl)
