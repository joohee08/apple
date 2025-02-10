// 🎵 Swiper 초기화
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

// 🎧 음악 플레이어 초기화
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

// 🎶 노래 리스트 초기화
function initSongs() {
    let songs = [];
    document.querySelectorAll(".next").forEach((item, index) => {
        let song = {
            title: item.dataset.title || "Unknown Title",
            artist: item.dataset.artist || "Unknown Artist",
            img: item.dataset.img || "assets/img/default.jpg",
            audio: item.dataset.audio || "assets/audio/default.mp3" // 기본 mp3 파일 설정
        };
        songs.push(song);

         // 🔍 song 데이터 확인
         console.log(`🎵 [${index + 1}] 곡 정보:`, song);

        // 🎵 노래 클릭 시 플레이어 업데이트
        item.addEventListener("click", function () {
            playSong(index, songs);
        });
    });
    return songs;
}

// ▶️ 노래 재생 함수
function playSong(index, songs) {
    let { audioPlayer, playerImg, playerTitle, playerArtist, playPauseBtn } = initPlayer();
    let song = songs[index];

    if (!song || !song.audio) {
        console.error("오디오 파일을 찾을 수 없습니다.");
        return;
    }

    // 🔍 디버깅용 콘솔 로그 추가
    console.log("🎵 재생할 곡:", song.title);
    console.log("🎤 가수:", song.artist);
    console.log("🖼 앨범 이미지 경로:", song.img);
    console.log("🔊 오디오 경로:", song.audio);

    playerImg.src = song.img;
    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist;
    audioPlayer.src = song.audio;
    audioPlayer.load();
    audioPlayer.play();
    playPauseBtn.innerHTML = '<img src="assets/img/playbtn.png" alt="재생">';
}

// ⏯️ 재생/일시정지 토글
function togglePlay() {
    let { audioPlayer, playPauseBtn } = initPlayer();
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<img src="assets/img/playbtn.png" alt="재생" style="width: 100px; height: 100px;">';
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<img src="assets/img/Polygon01.png" alt="재생">';
    }
}


// ⏮️ 이전 곡 재생
function playPrev(songs, currentSongIndex) {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex, songs);
    return currentSongIndex;
}

// ⏭️ 다음 곡 재생
function playNext(songs, currentSongIndex) {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex, songs);
    return currentSongIndex;
}

// 전체 초기화 실행
document.addEventListener("DOMContentLoaded", function () {
    initSwipers();
    
    let songs = initSongs();
    let currentSongIndex = 0;

    let { playPauseBtn, prevBtn, nextBtn, audioPlayer } = initPlayer();

    playPauseBtn.addEventListener("click", function () {
        togglePlay();
    });

    prevBtn.addEventListener("click", function () {
        currentSongIndex = playPrev(songs, currentSongIndex);
    });

    nextBtn.addEventListener("click", function () {
        currentSongIndex = playNext(songs, currentSongIndex);
    });

    audioPlayer.addEventListener("ended", function () {
        currentSongIndex = playNext(songs, currentSongIndex);
    });

    console.log("🎵 음악 플레이어 및 Swiper 초기화 완료 ✅");
});
