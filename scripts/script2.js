var n_titles = [];
var searchResult_c = document.querySelector(".search-results-c");
var search_results = [];
var mouse = false;

//set main-title,other titles
function set_title() {
  document.querySelector(".main-title h2").innerText = video.name;
  document.querySelector("title").innerText = video.name;
}

//generates new playlist song item on call
function generate_new_playlist_item() {
  var rmClick;
  var playlist_song = document.createElement("div");
  playlist_song.classList.add("playlist-song");

  var playlist_s_img = document.createElement("canvas");
  playlist_s_img.classList.add("playlist-song-img");
  playlist_song.appendChild(playlist_s_img);

  var playlist_s_title = document.createElement("div");
  playlist_s_title.classList.add("playlist-song-title");
  playlist_s_title.appendChild(document.createElement("h4"));
  playlist_song.appendChild(playlist_s_title);

  var extra = document.createElement("div");
  extra.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
  extra.classList.add("extra");
  playlist_song.appendChild(extra);

  var removeItem = document.createElement("h6");
  removeItem.innerText = "X";
  removeItem.setAttribute("title", "Remove");
  removeItem.classList.add("remove-btn");

  var addButton = document.createElement("h6");
  addButton.innerText = "+";
  addButton.title = "Add";

  var menu = document.createElement("div");
  menu.classList.add("menu");

  menu.appendChild(removeItem);
  menu.appendChild(addButton);

  extra.appendChild(menu);

  removeItem.addEventListener("click", (e) => {
    rmClick = true;
    var el = playlist_song;
    var i = titles.indexOf(el.querySelector("h4").innerText);
    var pi;
    if (el.classList.contains("playing")) {
      if (shuffle) {
        let r = Math.floor(Math.random() * titles.length);
        pi = r;
      } else {
        if (titles.indexOf(video.name) + 1 != titles.length)
          pi = titles.indexOf(video.name);
        else {
          if (titles.length != 1) pi = 0;
          else {
            video.src = "\t";
            titles.splice(0, titles.length);
            title_url = {};
            url_title = {};
            played.splice(0, titles.length);
            document.querySelector(".main-c").style.visibility = "hidden";
            document.querySelector(".main-c2").style.visibility = "visible";
            document.querySelector(".main-c2").style.display = "flex";
          }
        }
      }
    }

    delete url_title[title_url[titles[i]]];
    delete title_url[titles[i]];
    titles.splice(i, 1);
    playlist_container.removeChild(el);
    document.querySelector(".right_container h3").innerText =
      "Total: " + titles.length;

    if (pi || pi == 0) {
      play(titles[pi], false);
    }

    video.focus();
  });

  playlist_song.addEventListener("click", () => {
    if (!rmClick) {
      const name = playlist_song.querySelector(".playlist-song-title h4")
        .innerText;
      play(name);
    } else {
      rmClick = false;
    }
  });

  return playlist_song;
}

//sets thumbnail for playlist
async function set_thumnail(name, newitem) {
  return new Promise((resolve) => {
    try {
      var t_video = document.createElement("video");
      t_video.src = title_url[name];
      t_video.addEventListener("loadedmetadata", () => {
        t_video.currentTime = 3;
      });

      t_video.addEventListener("error", () => {
        resolve("error");
      });

      t_video.onseeked = () => {
        var canvas = newitem.querySelector("canvas");
        var context = canvas.getContext("2d");
        context.drawImage(t_video, 0, 0, canvas.width, canvas.height);
        resolve("resolved");
      };
    } catch (e) {
      console.log(e);
    }
  });
}

//set playlist
async function set_playlist() {
  document.querySelector(".right_container h3").innerText =
    "Total: " + titles.length;

  for (name of n_titles) {
    var new_item = generate_new_playlist_item();
    var status = await set_thumnail(name, new_item);
    if (status != "error") {
      new_item.querySelector(".playlist-song-title h4").innerText = name;
      new_item.querySelector(".playlist-song-title h4").title = name;
      playlist_container.appendChild(new_item);
    } else {
      var i = titles.indexOf(name);
      delete url_title[title_url[titles[i]]];
      delete title_url[titles[i]];
      titles.splice(i, 1);
    }
    if (video.src == title_url[name]) {
      document.querySelectorAll(".playlist-song")[0].classList.add("playing");
    }
  }
  n_titles = [];
}

//play video by title
function play(title, check = true) {
  if (
    video.src &&
    video.src != "http://localhost:800/" &&
    (!video.src.includes("file://") || video.src.includes("blob")) &&
    check
  ) {
    if (document.querySelector(".playing")) {
      try {
        let p_top = document.querySelector(".playing").offsetTop - 100;
        document.querySelector(".playing").classList.remove("playing");
        document
          .querySelectorAll(".playlist-song")
          [titles.indexOf(title)].classList.add("playing");
        document
          .querySelector(".playlist-container")
          .scrollTo(p_top, document.querySelector(".playing").offsetTop - 100);
      } catch {}
    } else {
      document
        .querySelectorAll(".playlist-song")
        [titles.indexOf(title)].classList.add("playing");
      document
        .querySelector(".playlist-container")
        .scrollTo(0, document.querySelector(".playing").offsetTop - 100);
    }
  } else if (!check) {
    document
      .querySelectorAll(".playlist-song")
      [titles.indexOf(title)].classList.add("playing");
    document
      .querySelector(".playlist-container")
      .scrollTo(0, document.querySelector(".playing").offsetTop - 100);
  }
  video.src = title_url[title];
  video.name = title;
  played.push(title);
  p_video.src = title_url[title];
  video.focus();
}

//triggers when video's is meta-data is loaded
video.addEventListener("loadedmetadata", () => {
  document.querySelectorAll(".time-d")[0].innerHTML =
    "/" + convert_time(video.duration);
  document.querySelectorAll(".time-d")[1].innerHTML =
    "/" + convert_time(video.duration);
  video.name = url_title[video.src];
  set_title();
});

//when new files are browsed
file_browser.addEventListener("change", () => {
  for (file of file_browser.files) {
    var file_name = file.name;
    file_name = file_name.replace("  ", " ").replace("  ", " ");
    if (!titles.includes(file_name)) {
      n_titles.push(file_name);
      titles.push(file_name);
      var url = window.URL.createObjectURL(file);
      title_url[file_name] = url;
      url_title[url] = file_name;
    }
  }

  set_playlist();

  if (
    (!video.src ||
      video.src == "http://localhost:800/" ||
      (video.src.includes("file://") && video.src.includes("index.html"))) &&
    titles.length > 0
  ) {
    play(titles[0]);
    document.querySelector(".main-c").style.visibility = "visible";
    document.querySelector(".main-c2").style.visibility = "hidden";
    document.querySelector(".main-c2").style.display = "none";
  }
});

function search_result_click(e) {
  play(e.toElement.innerText);
  video.focus();
  search_box.value = "";
  mouse = false;
  searchResult_c.style.visibility = "hidden";
}

//when search query is entered or changed
search_box.addEventListener("input", (e) => {
  searchResult_c.style.visibility = "visible";
  if (document.querySelector(".search-result")) {
    document.querySelectorAll(".search-result").forEach((r) => {
      searchResult_c.removeChild(r);
    });
  }

  if (search_box.value) {
    search_results = [];
    titles.forEach((title) => {
      if (title.toLowerCase().includes(search_box.value.toLowerCase())) {
        search_results.push(title);
      }
    });
    if (search_results) {
      search_results.forEach((r) => {
        var result = document.createElement("h5");
        result.classList.add("search-result");
        result.innerText = r;
        searchResult_c.appendChild(result);

        result.addEventListener("click", search_result_click);
      });
    }
  }
});

//search box key down
search_box.addEventListener("keydown", (e) => {
  if (e.key == "ArrowUp") {
    e.preventDefault();
    var active_el = document.querySelector(".search-results-c .active");
    var i;
    if (active_el) {
      i = search_results.indexOf(active_el.innerText);
      active_el.classList.remove("active");
    } else {
      i = 0;
    }
    var new_ae;

    if (i - 1 >= 0) {
      i = i - 1;
      searchResult_c.scrollTo(
        document.querySelectorAll(".search-result")[i + 1].offsetTop,
        document.querySelectorAll(".search-result")[i].offsetTop - 50
      );
    }

    new_ae = document.querySelectorAll(".search-result")[i];
    new_ae.classList.add("active");
  }

  if (e.key == "ArrowDown") {
    e.preventDefault();
    var active_el = document.querySelector(".search-results-c .active");
    var i;
    if (active_el) {
      i = search_results.indexOf(active_el.innerText);
      active_el.classList.remove("active");
    } else {
      i = -1;
    }
    var new_ae;

    if (i + 1 < document.querySelectorAll(".search-result").length) {
      i = i + 1;
      if (i > 2) {
        searchResult_c.scrollTo(
          document.querySelectorAll(".search-result")[i - 1].offsetTop + 40,
          document.querySelectorAll(".search-result")[i].offsetTop - 20
        );
      }
    }

    new_ae = document.querySelectorAll(".search-result")[i];
    new_ae.classList.add("active");
  }

  if (e.key == "Enter") {
    e.preventDefault();
    play(document.querySelector(".search-results-c .active").innerText);
    mouse = false;
    video.focus();
    search_box.value = "";
    searchResult_c.style.visibility = "hidden";
  }
});

//search box loses focus
search_box.addEventListener("blur", () => {
  if (!mouse) searchResult_c.style.visibility = "hidden";
});

searchResult_c.addEventListener("mouseenter", (e) => {
  mouse = true;
});

searchResult_c.addEventListener("mouseleave", (e) => {
  mouse = false;
});
