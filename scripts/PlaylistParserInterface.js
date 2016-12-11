
//Setup exports
module.exports = {
	parse:parsePath,
	parseAdditionalPlaylist:additionalPlaylist,
	addTracks:addTracks,
	exportPlaylist:exportList,
	getPaths : getPaths,
	getTrackNames: getTrackNames,
	getPlaylistDir : getPlaylistDir,
	getPlaylistProps: getPlaylistProps
}

//classes implementing this interface should have the following methods:
//	- Constructor taking file path argument
//	- Constructor parsing the file 
//	- getAbsolutePaths - get the absolute file paths
//	----Notes for the future----
//	Perhaps options for relative or absolute track paths

//Behaviour for classes:
//  - Constructor 

let parser;

function parsePath(playlistFilePath)
{
	//returns the file extention without the dot
	let fileExt = playlistFilePath.split('.').pop();
	
	var requireParser = require("./Parser/" + fileExt + ".js");
	
	switch (fileExt)
	{	
		//m3u format
		case 'm3u':
			parser = new requireParser.parser(playlistFilePath);
			break;
		//raw audacious playlist format
		case 'audpl':
			parser = new requireParser.parser(playlistFilePath);
			break;
		case 'wpl':
		default:
			throw new Error("Not implemented!");
	}
}

function additionalPlaylist(playlistPath)
{
	parser.addPlaylist(playlistPath);
}

function addTracks(tracks)
{
	parser.addTrackPaths(null, tracks);
}

function getPaths()
{
	if (typeof parser == undefined)
		throw new Error("Could not parse playlist, or playlist not provided");
	return parser.getPaths();
}

//exportType is checks if to export as absolute or relative
function exportList(exportType = "absolute", savePath)
{
	if (exportType == "absolute")
		parser.exportPlaylistAbsolute(savePath);
	else if (exportType == "relative")
		parser.exportPlaylistRelative(savePath);
	else
		throw new Error("Invalid export type.");
}

function getPlaylistDir()
{
	return parser.playlistProps.dir;	
}

function getTrackNames()
{
	return parser.getTrackNames();
}

function getPlaylistProps()
{
	return parser.playlistProps;
}
