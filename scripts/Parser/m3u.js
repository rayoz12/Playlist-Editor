//Exports
module.exports = {
	parser:parser,
};

var fs = require('fs');
var path = require('path');


function parser(playlistPath)
{
	this.validPlaylist = false;
	//if the file contains absolute paths
	this.isAbsolutePaths = false;
	this.rawTracks = [];
	this.absoluteTracks = [];
	this.playlistProps = {};

	var parserContext = this;
	fs.readFile(playlistPath, function(err, data) {
	    if(err) throw err;
		//Parsing the file here
		parserContext.playlistProps = path.parse(playlistPath);
		var readPath = fs.realpathSync(parserContext.playlistProps.dir);//resolves for system links
		parserContext.addPaths(readPath, data);
		parserContext.validPlaylist = true;
	})
	
}

parser.prototype.addPlaylist = function (playlistFilePath)
{
	var parserContext = this;
	fs.readFile(playlistFilePath, function(err, data) {
	    if(err) throw err;
		//Parsing the file here
		var playlistProps = path.parse(playlistFilePath);
		parserContext.addPaths(playlistProps.dir, data);
	});
}

parser.prototype.addPaths = function (basePlaylistDir, fileData)
{
	var rawPaths = this.getRawPaths(fileData);
	this.addTrackPaths(basePlaylistDir, rawPaths);
}

//tracks is array of file paths
parser.prototype.addTrackPaths = function (basePlaylistDir = null, tracks)
{
	this.rawTracks.concat(tracks);
	for (let i=0;i<tracks.length;i++)
	{		
		let baseDir = (basePlaylistDir !== null) ? basePlaylistDir : path.dirname(tracks[i]);
		let fixedPath = cleanPath(tracks[i]);
		fixedPath = convertToUnix(fixedPath, path.sep);
		
		//get absolute paths first
		if (!path.isAbsolute(fixedPath))
		{
			//is a relative path, need to convert
			this.absoluteTracks.push(this.getAbsolutePath(baseDir, fixedPath));
		}
		else
		{
			//no need to convert, already absolute
			this.absoluteTracks.push(fixedPath);
		}		
	}
}

parser.prototype.exportPlaylistAbsolute = function (savePath)
{
	writePlaylistFile(savePath, getUIPlaylist("#playlist"));
}

parser.prototype.exportPlaylistRelative = function (savePath)
{
	var dirName = path.dirname(savePath);
	var paths = getUIPlaylist("#playlist");
	var relPaths = paths.map(aPath => path.relative(dirName, aPath));
	writePlaylistFile(savePath, relPaths);
}

parser.prototype.getPaths = function()
{
	if (!this.validPlaylist)
		throw new Error("Valid playlist not provided!");

	return this.absoluteTracks;
}

parser.prototype.getRawPaths = function(data)
{
	let lineArray = data.toString().split("\n");
	let TrackPaths = [];
    for(var i=0;i<lineArray.length;i++)
	{
		//check if the current line is a path.
	    if(!lineArray[i].includes("#") && isPath(lineArray[i]))
		{
			TrackPaths.push(cleanPath(lineArray[i]));
		}
	}
	return TrackPaths;
}

parser.prototype.getAbsolutePaths = function(data) 
{
	let relPaths = (this.rawPaths.length == 0) ? this.getRawPaths(data) : this.relativeTracks;
	let trackPaths = [];

	for (var i = 0; i < relPaths.length; i++)
	{
		let normalPath = path.resolve(this.playlistProps.dir, fixedPath);
		trackPaths.push(normalPath.trim());
	}
	

	return trackPaths;
}

//from any platform relative path it is converted to absolute
parser.prototype.getAbsolutePath = function(base, relPath)
{
	return path.resolve(base, relPath);
}

parser.prototype.getTrackNames = function()
{
	return this.absoluteTracks.map(iPath => path.basename(iPath));
}

function getUIPlaylist(selector)
{
	playlistTracks = document.querySelector(selector).children;
	let paths = [];
	for (var i = 0; i < playlistTracks.length; i++) 
	{
		paths[i] = playlistTracks[i].dataset.path;
	}
	return paths;
}

/*http://stackoverflow.com/questions/17614123/node-js-how-to-write-an-array-to-file*/
function writePlaylistFile(savePath, trackArray)
{
	var file = fs.createWriteStream(savePath);
	file.on('error', function(err) { showDialog("Failed to write to file","error"); });
	trackArray.forEach(function(v) { file.write(v + '\n'); });
	file.end();
}

