
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
        slidesPerView: 2,
        spaceBetween: 20,
        grabCursor: true,
        freeMode: true,
        loop: false
    });

    new Swiper(".nextSwiper", {
        slidesPerView: 1,
        spaceBetween: 20,
        grabCursor: true
    });
}

//음악 플레이어 초기화
function initPlayer() {
    let audioPlayer = document.getElementById("audioPlayer");
    let playerImg = document.getElementById("player-img");
    let playerTitle = document.getElementById("player-title");
    let playerArtist = document.getElementById("player-artist");
    let playPauseBtn = document.getElementById("playPauseBtn");
    let prevBtn = document.getElementById("prevBtn");
    let nextBtn = document.getElementById("nextBtn");

    if (!audioPlayer || !playerImg || !playerTitle || !playerArtist || !playPauseBtn) {
        console.error("플레이어 관련 요소를 찾을 수 없습니다.");
        return;
    }

    return { audioPlayer, playerImg, playerTitle, playerArtist, playPauseBtn, prevBtn, nextBtn };
}

//노래 리스트 초기화
// JSON에서 노래 데이터 로드
async function loadSongs() {
    try {
        const response = await fetch('assets/data/songs.json');
        const songs = await response.json();
        console.log('🎵 로드된 노래 데이터:', songs);
        return songs;
    } catch (error) {
        console.error('🚨 노래 데이터를 불러오는 중 오류 발생:', error);
    }
}

// 노래 선택 시 재생
function playSong(song) {
    const { audioPlayer, playerImg, playerTitle, playerArtist, playPauseBtn } = initPlayer();

    playerImg.src = song.img;
    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist;
    audioPlayer.src = song.audio;

    audioPlayer.load();
    audioPlayer.play();

    playPauseBtn.classList.remove("paused");

    // 현재 재생 중인 노래 sessionStorage에 저장 (재생 시간 0초로)
    const songData = { ...song, currentTime: 0 };
    sessionStorage.setItem("currentSong", JSON.stringify(songData));
}

// HTML 요소와 JSON 데이터 매칭해서 클릭 이벤트 연결
function initSongs(songs) {
    document.querySelectorAll(".next, .recent").forEach((item) => {
        const title = item.dataset.title;
        const song = songs.find((s) => s.title === title);

        if (!song) {
            console.warn(`🔍 데이터에 없는 곡: ${title}`);
            return;
        }

        item.addEventListener("click", function () {
            playSong(song);
        });
    });
}

// 재생/일시정지 토글
function togglePlay() {
    let { audioPlayer, playPauseBtn } = initPlayer();
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.classList.remove("paused");
    } else {
        audioPlayer.pause();
        playPauseBtn.classList.add("paused");
    }
}

// 전체 초기화 실행
document.addEventListener("DOMContentLoaded", async function () {
    initSwipers();

    const songs = await loadSongs();

    initSongs(songs);

    let { playPauseBtn, prevBtn, nextBtn, audioPlayer } = initPlayer();

    playPauseBtn.addEventListener("click", togglePlay);

    // 이전/다음 곡 로직은 필요하면 나중에 확장 가능
    prevBtn.addEventListener("click", function () {
        console.log("이전 곡 기능은 필요시 구현");
    });

    nextBtn.addEventListener("click", function () {
        console.log("다음 곡 기능은 필요시 구현");
    });

    // 자동 다음 곡 기능
    audioPlayer.addEventListener("ended", function () {
        console.log("다음 곡 자동재생 기능 필요시 구현");
    });
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