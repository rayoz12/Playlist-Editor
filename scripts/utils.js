
function removeChildElements(element)
{
	while (element.firstChild) 
	{
    	element.removeChild(element.firstChild);
	}
}

delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();


function openInShell(fullPath)
{
	shell.openItem(fullPath);
}

//This is just to get the platform, http://stackoverflow.com/questions/29902347/open-a-file-with-default-program-in-node-webkit
function getCommandLine() {
   switch (process.platform) { 
      case 'darwin' : return 'open';
      case 'win32' : return 'start';
      case 'win64' : return 'start';
      default : return 'xdg-open';
   }
}

function isPath(string)
{
	return /[\/\\]/g.test(string);
}

//This should be done before fixing the path
function cleanPath(path)
{
	//decode from URI
	path = decodeURIComponent(path);
	//remove protocol
	path = path.replace(/^file:\/\//,'');
	var newPath = path.trim();
	
	return newPath;
}
//Path is an array
function fixPaths(filePath, sep)
{
	returnArray = [];
	for (let i=0;i<filePath.length;i++)
	{
		returnArray.push(filePath[i].replace(/[\/\\]/g, sep));
	}
	return returnArray;
}


function convertToUnix(filePath, sep)
{
	return filePath.replace(/[\/\\]/g, sep)
}


