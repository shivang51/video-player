var video = document.querySelector('.main-video');
var video_container = document.querySelector('.vid-c');
var progress_bar = document.querySelector('.progress-bar');
var volume_bar = document.querySelector('.volume-bar');
var file_browser = document.querySelector('#filebrowser');
var controls = document.querySelector('.vid-c .controls');
var controls_hide_timer = setTimeout(()=>{},0);
var vol_per_hide_timer = setTimeout(()=>{},0);
var playlist_container = document.querySelector('.playlist-container');
var preview_c = document.querySelector('.preview');
var p_video = document.createElement('video');
var search_box = document.querySelector('#search_tb');
p_video.classList.add('preview-video');
var titles = [];
var title_url = {};
var url_title = {};
const play_pause_btn = document.querySelector('.play_pause');
var shuffle = false;
var repeat = false;
let played = [];


video.volume = 0.5;


//plays next song
async function play_next(){
  if(shuffle){
    try{
      const t = await getRandomTitle();
      console.log(t);
      play(t);
    }
    catch(error){
      console.log('error',error)
    }
  }
  else{
    if(titles.indexOf(document.querySelector('.main-title h2').innerText)+1 != titles.length)
        play(titles[titles.indexOf(document.querySelector('.main-title h2').innerText)+1]);
    else{
        play(titles[0])
    }
  }
}

//converts time to h-m-s
function convert_time(ts){
    var s = 0;
    var m = 0;
    var h = 0;
    var time = "";
    if (ts < 60){
        s = parseInt(ts);
        if(s.toString().length == 1)
          s = '0'+s;
        time = '00:'+s;
    }
    else if (ts >= 60){
        var m1 = parseInt(ts/60);
        if (m1 > 60){
            h = parseInt(m1/60);
            m = parseInt(m1 - (h*60));
            s = parseInt(ts - (h*60+m)*60);
            if(s.toString().length == 1)
              s='0'+s;
            if(m.toString().length == 1)
              m = '0'+m;
            if(h.toString().length == 1)
              h = '0'+h;
            time = h+":"+m+":"+s;
        }
        else{
            m = m1;
            s = parseInt(ts - (m1*60));
            if(s.toString().length == 1)
              s='0'+s;
            if(m.toString().length == 1)
              m = '0'+m;
            time = m+":"+s
        }
    }
    return time;
}

//plays or pause video on call
function toogle_play_pause(){
    if(video.paused){
        video.play();
        play_pause_btn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    else{
        video.pause();
        play_pause_btn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

//mute-unmute volume
function toogle_mute(){
    const vol_btn = document.querySelector('.volume_btn');
    if(video.muted){
        video.muted = false;
        vol_btn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
    else{
        video.muted = true;
        vol_btn.innerHTML = '<i class="fas fa-volume-off"></i>';
    }
}

//to hide controls
function hide_controls(t){
  controls_hide_timer = setTimeout(()=>{
    video.style.cursor = 'none';
    controls.classList.add('hide-controls');
    console.log("hide controls called")
  }, t)
}

//shows volume percent 
function show_volume_percent(){
  clearTimeout(vol_per_hide_timer);
  document.querySelector('.volume-percent').innerHTML = parseInt((video.volume/1)*100).toString()+'%';
  document.querySelector('.volume-percent-c').style.visibility = 'visible';
  vol_per_hide_timer = setTimeout(() => {
    document.querySelector('.volume-percent-c').style.visibility = 'hidden';
  },1000);
}

//also leave as well as enter
function enterfullscreen() {
  var elem = document.fullscreenElement;
  const video_c = document.getElementsByClassName('vid-c')[0];
  if (elem == null) {
    if (video_c.requestFullscreen) {
      video.classList.add('video-fs');
      video_c.requestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    video.classList.remove('video-fs');
  }
}

//draw preview video
function drawpreviewvideo(v_left, time){

  if(v_left+85 > progress_bar.clientWidth){
    v_left = progress_bar.clientWidth - 85;
  }
  else if(v_left < 75){
    v_left = 75;
  }

  preview_c.style.left = (v_left- 75).toString() + 'px';
  document.querySelector('.p-time-e').innerText = convert_time(time);
  p_video.currentTime = time;

  p_video.onseeked = () => {
    var canvas = preview_c.querySelector('canvas');
    var context = canvas.getContext('2d');
    context.drawImage(p_video, 0, 0, canvas.width, canvas.height);
  }
}

//gets random title
function getRandomTitle(){
  return new Promise(resolve => {
    let i = -1,found=false;

    while(!found){
      i = Math.floor(Math.random() * titles.length);
      if(shuffle && played.includes(titles[i])){
        if(played.length >= titles.length){
          played=[];
        }
      }
      else{
        found = true;
      }
    }
    resolve(titles[i]);
  })
}

//when video start playing
video.onplay = () => {
  play_pause_btn.innerHTML = '<i class="fas fa-pause"></i>';
};

//updates when time is updated on video
video.addEventListener('timeupdate',() => {
    var time_elapsed_percent = (video.currentTime/video.duration)*100;
    document.querySelector('.progress').style.width = time_elapsed_percent+'%';
    document.querySelector('.time-e').innerHTML = convert_time(video.currentTime);
    if(video.ended){
      if(repeat){
        play(titles[titles.indexOf(document.querySelector('.main-title h2').innerText)]);
      }
      else{
        if(shuffle){
          play_next()
        }
        else{
            if(titles.indexOf(document.querySelector('.main-title h2').innerText)+1 != titles.length)
                play(titles[titles.indexOf(document.querySelector('.main-title h2').innerText)+1]);
            else{
                play(titles[0])
            }
        }

      }
    }
})

//triggered when video is clicked
video.addEventListener('click', () => {
    toogle_play_pause();
})

//triggered when progress-bar is clicked
progress_bar.addEventListener('click', (e) => {
    var click_percent = e.offsetX/progress_bar.clientWidth * 100;
    document.querySelector('.progress').style.width = click_percent.toString() + '%';
    var current_time = (click_percent/100)*video.duration;
    video.currentTime = current_time;
})

//triggered when volume-bar is clicked
volume_bar.addEventListener('click', (e) => {
    var click_percent = e.offsetX/volume_bar.clientWidth * 100;
    document.querySelector('.volume').style.width = click_percent.toString() + '%';
    var current_volume = (click_percent/100);
    video.volume = current_volume;
})

//keyboard keys events
video.addEventListener('keydown', (e) => {
  e.preventDefault();

  if (e.code == 'Space') {
    toogle_play_pause();
  }

  else if (e.key == "ArrowUp") {
    var volume = video.volume + .1;
    if (volume > 1) {
      volume = 1;
    }
    video.volume = volume;

    video.muted = false;

    document.querySelector('.volume').style.width = volume * 100 + '%';
    
    show_volume_percent();
  }

  else if (e.key == "ArrowDown") {
    var volume = video.volume - .1;
    if (volume < 0) {
      volume = 0;
    }
    video.volume = volume;
    video.muted = false;

    document.querySelector('.volume').style.width = volume * 100 + '%';
    show_volume_percent();
  }

  else if (e.key == "ArrowLeft") {
    clearTimeout(controls_hide_timer);
    controls.classList.remove('hide-controls');
    hide_controls(1000);

    var duration = video.currentTime - 5;
    if (duration < 0) {
      duration = 0;
    }
    video.currentTime = duration;
    duration = (duration / video.duration) * 100;
  }

  else if (e.key == "ArrowRight") {
    clearTimeout(controls_hide_timer);
    controls.classList.remove('hide-controls');
    hide_controls(1000);

    var duration = video.currentTime + 5;
    if (duration > video.duration) {
      duration = video.duration;
    }
    video.currentTime = duration;
    duration = (duration / video.duration) * 100;
  }

  else if(e.key == 'n'){
    play_next();
  }

  else if(e.key == 's'){
    if(shuffle){
      document.querySelector('.shuffle').style.color = 'white';
      shuffle = false;
    }
    else{
      document.querySelector('.shuffle').style.color = 'green';
      shuffle = true;
    }
  }

  else if(e.key == 'r'){
    if(repeat){
      document.querySelector('.repeat').style.color = 'white';
      repeat = false;
    }
    else{
      document.querySelector('.repeat').style.color = 'green';
      repeat = true;
    }
  }
});

//when mouse wheel is moved over video
video.addEventListener('wheel', (e) =>{
    e.preventDefault();

    if(e.deltaY < 0 ){
        
      var volume = video.volume + .1;
      if (volume > 1) {
        volume = 1;
      }
      video.volume = volume;
  
      video.muted = false;
  
      document.querySelector('.volume').style.width = volume * 100 + '%';
    }
    else{
        
      var volume = video.volume - .1;
      if (volume < 0) {
        volume = 0;
      }
      video.volume = volume;
      video.muted = false;
  
      document.querySelector('.volume').style.width = volume * 100 + '%';
    }
    show_volume_percent();
})

//it hides controls after 4s
video.addEventListener('mousemove', () => {
  clearTimeout(controls_hide_timer);
  controls.classList.remove('hide-controls');
  video.style.cursor = 'default';
  hide_controls(4000);
})

//event when fullscreen change
document.querySelector('.vid-c').addEventListener("fullscreenchange", function() {
  var elem = document.fullscreenElement;
  if (elem == null && document.getElementsByClassName('video-fs')[0]) {
    const video_c = document.getElementsByClassName('video-fs')[0];
    video_c.classList.remove('video-fs');
  }
  if(video_container.clientWidth <= 755){
    playlist_container.setAttribute('style', "max-width:550px");
  }
});

var en;
let resizeObserver = new ResizeObserver((entries) => {

    function addCard(){
      document.querySelector('.playlist-container').classList.add('playlist-container-card');
    }

    function removeCard(){
      document.querySelector('.playlist-container').classList.remove('playlist-container-card');
    }

    en = entries;
    for (ent of entries){
      if(ent.target.classList.contains('vid-c'))
      {
        vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        if(ent.contentRect.width/vw *100 > 80 || vw < 700){
          document.querySelector('.main-c').style.display = "grid";
          document.querySelector('.main-c .left_container').classList.add('left_container_xs');
          video_container.style.width = '100%';
          addCard()
        }
        else{
          video_container.style.width = 'fit-content';
          document.querySelector('.main-c').style.display = "flex";
          document.querySelector('.main-c .left_container').classList.remove('left_container_xs');
          removeCard()
        }
      }
      else if(ent.target.tagName == 'BODY')
      {
        vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        if(vw < 700 || video_container.clientWidth/vw *100 >= 80){
          document.querySelector('.main-c').style.display = "grid";
          document.querySelector('.main-c .left_container').classList.add('left_container_xs');
          video_container.style.width = '100%';
          addCard()
        }
        else{
          document.querySelector('.main-c').style.display = "flex";
          document.querySelector('.main-c .left_container').classList.remove('left_container_xs');
          video_container.style.width = 'fit-content';
          removeCard()
        }
      }
    }
});

resizeObserver.observe(document.getElementsByTagName('body')[0]);
resizeObserver.observe(video_container);

//when mouse move over progress bar
progress_bar.addEventListener('mousemove',(e)=>{
  var p_percent = e.offsetX/progress_bar.clientWidth * 100;
  var p_time = (p_percent/100)*video.duration;
  drawpreviewvideo(e.offsetX, p_time);
});

//when mouse leave progress bar
progress_bar.addEventListener('mouseenter', ()=>{
  preview_c.style.visibility = 'visible';
  preview_c.style.position = 'relative';
});

//when mouse leave progress bar
progress_bar.addEventListener('mouseleave', ()=>{
  preview_c.style.visibility = 'hidden';
  preview_c.style.position = 'absolute';
});

//shuffle
document.querySelector('.shuffle').addEventListener('click', ()=>{
  if(shuffle){
    document.querySelector('.shuffle').style.color = 'white';
    shuffle = false;
  }
  else{
    document.querySelector('.shuffle').style.color = 'green';
    shuffle = true;
  }
});

//repeat
document.querySelector('.repeat').addEventListener('click', ()=>{
  if(repeat){
    document.querySelector('.repeat').style.color = 'white';
    repeat = false;
  }
  else{
    document.querySelector('.repeat').style.color = 'green';
    repeat = true;
  }
});

//next
document.querySelector('.next').addEventListener('click', () => {
  play_next();
});
