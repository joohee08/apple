let currentSongIndex = -1;
let songs = [];
let lastPrevClickTime = 0;

// JSON 데이터 로드 함수
async function loadSongs() {
    try {
        const response = await fetch('assets/data/songs.json');
        return await response.json();
    } catch (error) {
        console.error('🚨 노래 데이터를 불러오는 중 오류 발생:', error);
    }
}

function getCurrentLyricsBlock(currentTime, lyrics) {
    let currentBlock = null;
    for (let i = 0; i < lyrics.length; i++) {
        const block = lyrics[i];
        const nextBlock = lyrics[i + 1];

        if (currentTime >= block.time && (!nextBlock || currentTime < nextBlock.time)) {
            currentBlock = block;
            break;
        }
    }
    return currentBlock;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function setSongInfo(song) {
    const playerImg = document.getElementById("player-img");
    const playerTitle = document.getElementById("player-title");
    const playerArtist = document.getElementById("player-artist");

    playerImg.src = song.img;
    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist;
}

function setLikes(song) {
    const likeBtn = document.getElementById("likeBtn");
    const likeCount = document.querySelector(".like-count");

    const storedLikes = parseInt(sessionStorage.getItem(`${song.title}_likes`)) || song.likes || 0;
    const isLiked = sessionStorage.getItem(`${song.title}_liked`) === 'true';

    likeCount.textContent = storedLikes.toLocaleString();
    likeBtn.textContent = isLiked ? '🖤' : '♡';
    likeBtn.classList.toggle('liked', isLiked);

    return { storedLikes, isLiked };
}

function updateLyrics(lyricsContainer, currentLyricsBlock) {
    if (currentLyricsBlock) {
        lyricsContainer.innerHTML = currentLyricsBlock.lines.join("<br>");
    } else {
        lyricsContainer.innerHTML = "";
    }
}

function updateProgressBar(audioPlayer, song) {
    const progressBar = document.getElementById("progress-bar");
    const currentTimeDisplay = document.getElementById("currentTimeDisplay");
    const durationDisplay = document.getElementById("durationDisplay");
    const lyricsContainer = document.querySelector(".song-lyrics p");

    if (!isNaN(audioPlayer.duration)) {
        const progressValue = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progressValue.toFixed(2);

        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        durationDisplay.textContent = formatTime(audioPlayer.duration);

        if (song.lyrics) {
            const currentLyricsBlock = getCurrentLyricsBlock(audioPlayer.currentTime, song.lyrics);
            updateLyrics(lyricsContainer, currentLyricsBlock);
        }
    }
}

function seekAudio(audioPlayer) {
    const progressBar = document.getElementById("progress-bar");
    const seekTime = (progressBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
}

function playSong(song) {
    const audioPlayer = document.getElementById("audioPlayer");
    const playPauseImg = document.getElementById("playPauseImg");

    setSongInfo(song);
    audioPlayer.src = song.audio;
    audioPlayer.currentTime = 0;
    audioPlayer.play();

    playPauseImg.src = "assets/img2/playmusic.png";

    currentSongIndex = songs.findIndex(s => s.title === song.title);

    sessionStorage.setItem("currentSong", JSON.stringify({ ...song, currentTime: 0 }));

    // 좋아요 상태, 가사, 진행바 즉시 업데이트
    setLikes(song);
    updateProgressBar(audioPlayer, song);
}

async function setupPlayer() {
    const songData = JSON.parse(sessionStorage.getItem("currentSong"));
    if (!songData) {
        console.error("🚨 곡 정보가 없습니다.");
        return;
    }

    songs = await loadSongs();
    currentSongIndex = songs.findIndex(song => song.title === songData.title);
    if (currentSongIndex === -1) {
        console.error(`🚨 ${songData.title} 곡 정보를 찾을 수 없습니다.`);
        return;
    }

    const audioPlayer = document.getElementById("audioPlayer");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const playPauseImg = document.getElementById("playPauseImg");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const progressBar = document.getElementById("progress-bar");
    const likeBtn = document.getElementById("likeBtn");

    let isPlaying = false;
    let lastPrevClickTime = 0;

    function getCurrentSong() {
        return songs[currentSongIndex];
    }

    function playCurrentSong() {
        playSong(getCurrentSong());
    }

    setSongInfo(getCurrentSong());
    audioPlayer.src = getCurrentSong().audio;
    audioPlayer.currentTime = songData.currentTime || 0;
    setLikes(getCurrentSong());

    // 재생/일시정지 버튼
    playPauseBtn.addEventListener("click", () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseImg.src = "assets/img2/playmusic.png";
            isPlaying = true;
        } else {
            audioPlayer.pause();
            playPauseImg.src = "assets/img2/stopbtn.png";
            isPlaying = false;
        }
    });

    // 이전곡 / 처음부터
    prevBtn.addEventListener("click", () => {
        const now = Date.now();
        if (now - lastPrevClickTime < 500) {
            if (currentSongIndex > 0) {
                currentSongIndex--;
                playCurrentSong();
            }
        } else {
            audioPlayer.currentTime = 0;
        }
        lastPrevClickTime = now;
    });

    // 다음곡
    nextBtn.addEventListener("click", () => {
        if (currentSongIndex < songs.length - 1) {
            currentSongIndex++;
            playCurrentSong();
        }
    });

    
   // 좋아요 버튼
    likeBtn.addEventListener("click", () => {
        const likeCount = document.querySelector(".like-count");
        const currentSong = getCurrentSong();

        const isLiked = likeBtn.classList.toggle("liked");
        let currentLikes = parseInt(likeCount.textContent.replace(/,/g, ""));

        if (isLiked) {
            currentLikes += 1;
        } else {
            currentLikes = Math.max(currentLikes - 1, 0); // 0 밑으로 안내려가게
        }

        likeBtn.textContent = isLiked ? "🖤" : "♡";
        likeCount.textContent = currentLikes.toLocaleString();

        sessionStorage.setItem(`${currentSong.title}_likes`, currentLikes);
        sessionStorage.setItem(`${currentSong.title}_liked`, isLiked);
    });


    // 진행바
    progressBar.addEventListener("input", () => seekAudio(audioPlayer));

    // 재생 중일 때 업데이트
    audioPlayer.addEventListener("timeupdate", () => {
        updateProgressBar(audioPlayer, getCurrentSong());
    });

    // 노래 끝났을 때 다음 곡 자동 재생
    audioPlayer.addEventListener("ended", () => {
        if (currentSongIndex < songs.length - 1) {
            currentSongIndex++;
            playCurrentSong();
        }
    });

    // 새로고침 시 현재 위치 저장
    window.addEventListener("beforeunload", () => {
        sessionStorage.setItem(
            "currentSong",
            JSON.stringify({
                ...getCurrentSong(),
                currentTime: audioPlayer.currentTime,
            })
        );
    });
}

document.addEventListener("DOMContentLoaded", setupPlayer);
