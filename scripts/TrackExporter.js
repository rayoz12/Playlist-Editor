module.exports = {
	copy:copyPlaylist
}


var fs = require('fs');
var path = require('path');

function copyPlaylist(trackPaths, destination)
{
	for(let i=0;i<trackPaths.length;i++)
	{
		let trackName = path.basename(trackPaths[i]);
		fs.createReadStream(trackPaths[i]).pipe(fs.createWriteStream(path.resolve(destination, trackName)));
	}
	return path.resolve(destination, path.basename(trackPaths[0]));
}
