module.exports = {
	audio:Sound
}


function Sound(filePath, Loop, Autoplay)
{
	this.audio = new Audio(filePath);	
	this.audio.loop = Loop;
	this.Autoplay = Autoplay;
	
	this.playing = false;
	
	//-----initialisation functions----
	if (this.Autoplay === true)
	{
		this.Play();
	}
}

Sound.prototype.PlayPause = function() {
	this.playing ? this.Pause() : this.Play();	
}

Sound.prototype.Play = function() {
	this.audio.play();
	this.playing = true;
}

Sound.prototype.Pause = function() {
	this.audio.pause();
	this.playing = false;
}

Sound.prototype.Stop = function() {
	this.Pause()
	this.playing = false;
	this.audio.currentTime = 0;	
}

Sound.prototype.newFile = function(filePath) {
	this.Stop()
	this.audio.src = filePath;
	this.Play();
}

Sound.prototype.setVolume = function(newVolume) {
	this.audio.volume = newVolume;
}
