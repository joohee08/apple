let currentSongIndex = -1;
let songs = [];
let lastPrevClickTime = 0;
let isRepeat = false;
let isShuffle = false;

// JSON 데이터 로드 함수
async function loadSongs() {
    try {
        const response = await fetch("assets/data/songs.json");
        return await response.json();
    } catch (error) {
        console.error("🚨 노래 데이터를 불러오는 중 오류 발생:", error);
        return [];
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
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
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
    const isLiked = sessionStorage.getItem(`${song.title}_liked`) === "true";

    likeCount.textContent = storedLikes.toLocaleString();
    likeBtn.textContent = isLiked ? "🖤" : "♡";
    likeBtn.classList.toggle("liked", isLiked);
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

/**
 * 곡 재생 함수
 * - song: 곡 정보 (img, title, artist, audio, lyrics 등)
 * - currentTime: 마지막 재생 위치를 복원할 때 사용 (기본값=0)
 */
function playSong(song, currentTime = 0) {
    const audioPlayer = document.getElementById("audioPlayer");
    const playPauseImg = document.getElementById("playPauseImg");

    setSongInfo(song);
    audioPlayer.src = song.audio;
    audioPlayer.currentTime = currentTime; // 복원된 위치에서 재생
    audioPlayer.play();

    playPauseImg.src = "assets/img2/playmusic.png";

    // 현재 곡 인덱스 갱신
    currentSongIndex = songs.findIndex((s) => s.title === song.title);

    // sessionStorage에 현재 곡 정보 & 재생 위치 저장
    saveCurrentSongData(song, currentTime);

    // 좋아요, 가사, 진행바 등 즉시 업데이트
    setLikes(song);
    updateProgressBar(audioPlayer, song);
}

// sessionStorage에 현재 곡, 재생 위치 저장
function saveCurrentSongData(song, currentTime) {
    sessionStorage.setItem(
        "currentSong",
        JSON.stringify({
            ...song,
            currentTime,
        })
    );
}

async function setupPlayer() {
    // 1. 곡 데이터 로드
    songs = await loadSongs();

    // 2. 최근 재생 곡(sessionStorage) 확인
    const savedSongData = JSON.parse(sessionStorage.getItem("currentSong"));

    // 3. 만약 있으면 인덱스 찾아서 playSong()으로 재생, 없으면 인덱스=0
    if (savedSongData) {
        const savedSongIndex = songs.findIndex((s) => s.title === savedSongData.title);
        if (savedSongIndex !== -1) {
            currentSongIndex = savedSongIndex;
            playSong(songs[currentSongIndex], savedSongData.currentTime);
        } else {
            console.warn("🚨 최근 재생 곡이 목록에 없어요. 첫 번째 곡으로 재생합니다.");
            currentSongIndex = 0;
            playSong(songs[0]);
        }
    } else {
        // 최근 재생 곡 없으면 첫 번째 곡
        currentSongIndex = 0;
        playSong(songs[0]);
    }

    // 4. 각종 DOM 요소 가져오기
    const audioPlayer = document.getElementById("audioPlayer");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const progressBar = document.getElementById("progress-bar");
    const repeatBtn = document.getElementById("repeatBtn");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const likeBtn = document.getElementById("likeBtn");
    const playPauseImg = document.getElementById("playPauseImg");

    // 5. 재생/일시정지 버튼
    playPauseBtn.addEventListener("click", () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseImg.src = "assets/img2/playmusic.png";
        } else {
            audioPlayer.pause();
            playPauseImg.src = "assets/img2/stopbtn.png";
        }
    });

    // 6. 이전곡
    prevBtn.addEventListener("click", () => {
        const now = Date.now();
        if (now - lastPrevClickTime < 500) {
            // 더블 클릭 시 이전 곡
            if (currentSongIndex > 0) {
                currentSongIndex--;
                playSong(songs[currentSongIndex]);
            }
        } else {
            // 싱글 클릭 시 처음부터
            audioPlayer.currentTime = 0;
        }
        lastPrevClickTime = now;
    });

    // 7. 다음곡
    nextBtn.addEventListener("click", () => {
        if (isShuffle) {
            currentSongIndex = Math.floor(Math.random() * songs.length);
        } else if (currentSongIndex < songs.length - 1) {
            currentSongIndex++;
        }
        playSong(songs[currentSongIndex]);
    });

    // 8. 좋아요 버튼
    likeBtn.addEventListener("click", () => {
        const currentSong = songs[currentSongIndex];
        const likeCountElem = document.querySelector(".like-count");

        const isLiked = likeBtn.classList.toggle("liked");
        let currentLikes = parseInt(likeCountElem.textContent.replace(/,/g, "")) || 0;

        if (isLiked) currentLikes++;
        else currentLikes = Math.max(currentLikes - 1, 0);

        likeBtn.textContent = isLiked ? "🖤" : "♡";
        likeCountElem.textContent = currentLikes.toLocaleString();

        // 저장
        sessionStorage.setItem(`${currentSong.title}_likes`, currentLikes);
        sessionStorage.setItem(`${currentSong.title}_liked`, isLiked);
    });

    // 9. 진행바 시크
    progressBar.addEventListener("input", () => seekAudio(audioPlayer));

    // 10. 재생 중일 때 (timeupdate): 진행바 업데이트 & 재생 위치 저장
    audioPlayer.addEventListener("timeupdate", () => {
        updateProgressBar(audioPlayer, songs[currentSongIndex]);
        saveCurrentSongData(songs[currentSongIndex], audioPlayer.currentTime);
    });

    // 11. 반복 버튼
    repeatBtn.addEventListener("click", () => {
        isRepeat = !isRepeat;
        repeatBtn.style.transform = isRepeat ? "scale(0.9)" : "scale(1)";
    });

    // 12. 셔플 버튼
    shuffleBtn.addEventListener("click", () => {
        isShuffle = !isShuffle;
        shuffleBtn.style.transform = isShuffle ? "scale(0.9)" : "scale(1)";
    });

    // 13. 곡 끝날 때
    audioPlayer.addEventListener("ended", () => {
        if (isRepeat) {
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else {
            nextBtn.click();
        }
    });

    // 14. 페이지 떠날 때(새로고침 등) 현재 곡 정보 저장
    window.addEventListener("beforeunload", () => {
        saveCurrentSongData(songs[currentSongIndex], audioPlayer.currentTime);
    });

    // 15. 드롭다운(있다면)
    const dropBtn = document.querySelector(".drop img");
    if (dropBtn) {
        dropBtn.addEventListener("click", () => {
            window.location.href = "apple01.html#playerSection"; // 필요 시 수정
        });
    }
}

// 페이지 로드 시
document.addEventListener("DOMContentLoaded", setupPlayer);
