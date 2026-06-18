(function(){
function init(box){
var video=box.querySelector('video');
var btn=box.querySelector('.play-overlay');
if(!video)return;
var src=video.getAttribute('data-src');
var ready=false;
function attach(){
if(ready)return;
ready=true;
if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src}else if(window.Hls&&window.Hls.isSupported()){var hls=new window.Hls({enableWorker:true,lowLatencyMode:false});hls.loadSource(src);hls.attachMedia(video);video._hls=hls}else{video.src=src}
}
function start(){
if(btn)btn.classList.add('is-hidden');
attach();
var p=video.play();
if(p&&p.catch){p.catch(function(){})}
}
if(btn)btn.addEventListener('click',start);
video.addEventListener('click',function(){if(!ready)start()});
}
Array.prototype.forEach.call(document.querySelectorAll('.player-box'),init);
})();