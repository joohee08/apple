//Swiper 초기화
function initSwipers() {
    new Swiper(".mySwiper", {
        loop: true,
        autoplay: { delay: 3000, disableOnInteraction: false },
        slidesPerView: 1,
        spaceBetween: 20,
        grabCursor: true
    });

    new Swiper(".recentSwiper", {
        spaceBetween: 20,
        grabCursor: true,
        freeMode: true,
        loop: false,
        breakpoints: {
            768: { slidesPerView: 2.3 },   // 태블릿 이상
            1024: { slidesPerView: 2.3 }   // PC 이상
          }
    });

    new Swiper(".nextSwiper", {
        slidesPerView: 1,
        spaceBetween: 20,
        grabCursor: true
    });
}

let currentSongIndex = -1;
let songs = [];
let lastPrevClickTime = 0;

function initPlayer() {
    return {
        audioPlayer: document.getElementById("audioPlayer"),
        playerImg: document.getElementById("player-img"),
        playerTitle: document.getElementById("player-title"),
        playerArtist: document.getElementById("player-artist"),
        playPauseBtn: document.getElementById("playPauseBtn"),
        prevBtn: document.getElementById("prevBtn"),
        nextBtn: document.getElementById("nextBtn")
    };
}

async function loadSongs() {
    try {
        const response = await fetch('assets/data/songs.json');
        songs = await response.json();
        console.log('🎵 로드된 노래 데이터:', songs);
    } catch (error) {
        console.error('🚨 노래 데이터를 불러오는 중 오류 발생:', error);
    }
}

function playSong(song) {
    const { audioPlayer, playerImg, playerTitle, playerArtist, playPauseBtn } = initPlayer();

    playerImg.src = song.img;
    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist;
    audioPlayer.src = song.audio;

    audioPlayer.play().catch((e) => {
        console.warn("재생 실패:", e);
    });
    playPauseBtn.classList.remove("paused");

    currentSongIndex = songs.findIndex((s) => s.title === song.title);

    const songData = { ...song, currentTime: 0 };
    sessionStorage.setItem("currentSong", JSON.stringify(songData));
}

function togglePlay() {
    const { audioPlayer, playPauseBtn } = initPlayer();
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.classList.remove("paused");
    } else {
        audioPlayer.pause();
        playPauseBtn.classList.add("paused");
    }
}

function playPrevSong() {
    const now = Date.now();
    const timeDiff = now - lastPrevClickTime;

    if (timeDiff < 500) {
        if (currentSongIndex > 0) currentSongIndex--;
    } else {
        const { audioPlayer } = initPlayer();
        audioPlayer.currentTime = 0;
    }
    lastPrevClickTime = now;

    playSong(songs[currentSongIndex]);
}

function playNextSong() {
    if (currentSongIndex < songs.length - 1) {
        currentSongIndex++;
        playSong(songs[currentSongIndex]);
    } else {
        console.log("마지막 곡입니다.");
    }
}

function initSongs() {
    document.querySelectorAll(".next, .recent").forEach((item) => {
        const title = item.dataset.title;
        const song = songs.find((s) => s.title === title);
        if (!song) return;

        item.addEventListener("click", () => playSong(song));
    });
}

//플레이바 들었던 가장 최근(마지막곡)표시
function loadLastPlayedSong() {
    const lastSongData = sessionStorage.getItem("currentSong");

    if (lastSongData) {
        const songData = JSON.parse(lastSongData);

        const { playerImg, playerTitle, playerArtist } = initPlayer();
        playerImg.src = songData.img;
        playerTitle.textContent = songData.title;
        playerArtist.textContent = songData.artist;
    } else {
        console.log("최근 재생한 곡이 없습니다.");
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    initSwipers();
    await loadSongs();
    initSongs();

    const { playPauseBtn, prevBtn, nextBtn, audioPlayer } = initPlayer();

    playPauseBtn.addEventListener("click", togglePlay);
    prevBtn.addEventListener("click", playPrevSong);
    nextBtn.addEventListener("click", playNextSong);
    audioPlayer.addEventListener("ended", playNextSong);

    loadLastPlayedSong(); // 최근 곡 정보 불러와서 표시

    const currentSongData = sessionStorage.getItem("currentSong");
    if (currentSongData) {
        const songData = JSON.parse(currentSongData);
        const song = songs.find((s) => s.title === songData.title);
        if (song) {
            playSong(song);
            const { audioPlayer } = initPlayer();
            audioPlayer.currentTime = songData.currentTime;
        }
    }
});

// 현재 곡 데이터 sessionStorage에 저장 (플레이어 클릭시)
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (event) => {
        const playlistM = event.target.closest(".playlistM");
        const controls = event.target.closest(".playlist-controls");

        if (!playlistM || controls) return;

        console.log("🎵 플레이어 클릭됨 ✅");

        const songData = getCurrentSongData();
        saveSongDataToSession(songData);
        navigateToPlayerPage();
    });
});

function getCurrentSongData() {
    const audioPlayer = document.getElementById("audioPlayer");
    const currentTime = audioPlayer ? audioPlayer.currentTime : 0;

    return {
        title: document.getElementById("player-title").textContent,
        artist: document.getElementById("player-artist").textContent,
        img: document.getElementById("player-img").src,
        audio: audioPlayer.src,
        currentTime: currentTime
    };
}

function saveSongDataToSession(songData) {
    sessionStorage.setItem("currentSong", JSON.stringify(songData));
}

function navigateToPlayerPage() {
    window.location.href = "appleplayer.html";
}