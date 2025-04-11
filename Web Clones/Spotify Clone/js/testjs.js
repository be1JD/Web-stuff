console.log('Lets write Javascript');
let currentsong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    // Round off the seconds to the nearest whole number
    seconds = Math.round(seconds);

    // Calculate minutes and seconds
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;

    // Add leading zeros if necessary
    var formattedMinutes = (minutes < 10 ? '0' : '') + minutes;
    var formattedSeconds = (remainingSeconds < 10 ? '0' : '') + remainingSeconds;

    // Return the formatted time as a string
    return formattedMinutes + ':' + formattedSeconds;
}


//get all the songs
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href)
            // songs.push(element.href.split("/Songs/")[1])
        }
    }

    //Show all the songs in library playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName('ul')[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="logosetter" src="/Assets/music.svg">
        <div class="leftsonginfo">
        <div>${song.split(`${currFolder}`)[1].replaceAll("%20", " ")}</div>
        <div>${song.split(`${currFolder}`)[1].replaceAll("%20", " ").split("-")[0]}</div>
        <div>${song.split(`${currFolder}`)[1].replaceAll("%20", " ").split("-")[1].split(".mp3")[0]}</div>
        </div>
        <div class="playnow flex align-center">
        <span>Play Now</span>
        <img class="logosetter" src="Assets/playbutton.svg" alt="">
        </div></li>`;
    }
    //Attach eventlistener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".leftsonginfo").firstElementChild.innerHTML)
        })
    })
    // load default song
    let defaultsong = songs[0].split(`${currFolder}`)[1].replaceAll("%20", " ")
    playMusic(defaultsong, true)

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("Songs/" + track)
    currentsong.src = `${currFolder}` + track
    if (!pause) {
        currentsong.play()
        play.src = "Assets/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track).split(".mp3")[0]
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/Songs`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a')
    let cards_container = document.querySelector(".cards_container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/Songs") && !e.href.includes(".htaccess")) {        // Line to ignore htaccess file 
            let folder = e.href.split("/").slice(-2)[0];

            // Get the metadata of the folder
            let a = await fetch(`/Songs/${folder}/info.json`);
            let response = await a.json();
            cards_container.innerHTML += `<div data-folder="${folder}" class="cards">
           <div class="play_btn">
               <img src="Assets/playbutton.svg" width="25px" height="25px" alt="">
           </div>
           <img src="/Songs/${folder}/Cover.jpg" alt="No image">
           <h4>${response.title}</h4>
           <p class="grey">${response.description}</p>
       </div>`
        }
    }

    //Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("cards")).forEach((e) => {
        e.addEventListener("click", async item => {
            await getSongs(`/Songs/${item.currentTarget.dataset.folder}/`)
            play.src = "Assets/playbutton.svg"
            // You can replace following 1 line code if you can add second page for each individual album or card
            document.querySelector('.left').style.left = "0" // If new song album or card is selected then new songs will show in library
            
            let defaultsong = songs[0].split(`${currFolder}`)[1].replaceAll("%20", " ") 
            // let defaultsong = songs[0].split(`${currFolder}`)[1]
            playMusic(defaultsong)
        })
    })
}


async function main() {
    //Get the list of all songs

    await getSongs(`/Songs/NCS/`);

    await displayAlbums()
    //Display all the albums on the page


    //Attach enetlister to play and pause 
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "Assets/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "Assets/playbutton.svg"
        }
    })

    // Listen for timeUpdate Event
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })
    // Add an eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100
    })

    // Add an eventlistener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // Add an eventlistener for close button in the left
    document.querySelector(".close_btn").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%";
    })
    // Add an eventlistener for playliists when left is pulled

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".playlists").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-150%"
        })
    })

    // Add an eventlistener to volume bar
    let volbar // Remembers the value of volume bar 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log("setting volume to " + e.target.value + " / 100"); // See the volumen out of 100
        currentsong.volume = (e.target.value / 100)
        volbar = document.querySelector(".range").getElementsByTagName("input")[0].value
    })

    // Add an eventlistener to volume button 
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (currentsong.muted) {
            currentsong.muted = false
            e.target.src = "Assets/volume.svg"
            document.querySelector(".range").getElementsByTagName("input")[0].value = volbar // repush the value of volume bar
        }
        else {
            currentsong.muted = true
            e.target.src = "Assets/muted.svg"
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
            //    console.log(document.querySelector(".range").getElementsByTagName("input")[0]);
        }
    })

    // Add an evenlistener to previous 
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src)
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1].split(`${currFolder}`)[1].replaceAll("%20", " "))
        }
    })

    // Add an eventlistener to next 
    next.addEventListener("click", () => {
        // console.log( currentsong.src.split("/").slice(-1) [0]); // I am not using this code because my url is different
        let index = songs.indexOf(currentsong.src)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1].split(`${currFolder}`)[1].replaceAll("%20", " "))
        }
    })
}
main();

