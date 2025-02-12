document.addEventListener("DOMContentLoaded", function () {
    // 🎵 세션에서 곡 데이터 가져오기
    const songData = JSON.parse(sessionStorage.getItem("currentSong"));

    if (!songData) {
        console.error("🚨 곡 정보가 없습니다.");
        return;
    }

    // 🎧 플레이어 UI 업데이트
    document.getElementById("player-img").src = songData.img;
    document.getElementById("player-title").textContent = songData.title;
    document.getElementById("player-artist").textContent = songData.artist;

    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.src = songData.audio;
    audioPlayer.load();
    audioPlayer.play();

    // 🎶 플레이어 컨트롤 변수
    let playPauseBtn = document.getElementById("playPauseBtn");
    let playPauseImg = document.getElementById("playPauseImg"); // 버튼 내부 이미지
    let progressBar = document.getElementById("progress-bar");
    let repeatBtn = document.getElementById("repeatBtn");
    let shuffleBtn = document.getElementById("shuffleBtn");
    let prevBtn = document.getElementById("prevBtn");
    let nextBtn = document.getElementById("nextBtn");

    let isRepeating = false;
    let isShuffling = false;

    initPlayer();

    // 🔹 플레이어 초기화
    function initPlayer() {
        playPauseImg.src = "assets/img2/stopbtn.png"; // 초기 버튼 이미지 설정

        // 버튼 이벤트 리스너 추가
        playPauseBtn.addEventListener("click", togglePlay);
        repeatBtn.addEventListener("click", toggleRepeat);
        shuffleBtn.addEventListener("click", toggleShuffle);
        prevBtn.addEventListener("click", playPrev);
        nextBtn.addEventListener("click", playNext);
        progressBar.addEventListener("input", updateAudioTime);

        // 오디오 이벤트 리스너 추가
        audioPlayer.addEventListener("timeupdate", updateProgressBar);
        audioPlayer.addEventListener("ended", resetPlayButton);
    }

    // ▶️ 재생 및 ⏸️ 일시정지 기능
    function togglePlay() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseImg.src = "assets/img2/playmusic.png"; 
        } else {
            audioPlayer.pause();
            playPauseImg.src = "assets/img2/stopbtn.png"; 
        }
    }

    // 🔄 반복 기능 토글
    function toggleRepeat() {
        isRepeating = !isRepeating;
        audioPlayer.loop = isRepeating;
        repeatBtn.style.opacity = isRepeating ? "0.7" : "1";
    }

    // 🔀 랜덤 재생 기능 토글
    function toggleShuffle() {
        isShuffling = !isShuffling;
        shuffleBtn.style.opacity = isShuffling ? "0.7" : "1";
    }

    // ⏮️ 이전 곡 재생 (현재는 곡 처음으로)
    function playPrev() {
        audioPlayer.currentTime = 0;
    }

    // ⏭️ 다음 곡 재생 (현재는 곡 처음으로)
    function playNext() {
        audioPlayer.currentTime = 0;
    }

    // 🎵 진행 바 업데이트
    function updateProgressBar() {
        progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    }

    // 🎚️ 사용자가 진행 바 조작 시
    function updateAudioTime() {
        audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
    }

    // ⏹️ 노래가 끝나면 재생 버튼으로 복구
    function resetPlayButton() {
        playPauseImg.src = "assets/img2/playmusic.png"; 
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const songData = JSON.parse(sessionStorage.getItem("currentSong"));

    if (!songData) {
        console.error("🚨 곡 정보가 없습니다.");
        return;
    }

    // 🎧 플레이어 UI 업데이트
    document.getElementById("player-img").src = songData.img;
    document.getElementById("player-title").textContent = songData.title;
    document.getElementById("player-artist").textContent = songData.artist;

    const audioPlayer = document.getElementById("audioPlayer");

    // 🔥 이미 다른 페이지에서 재생 중인 경우, 끊기지 않도록 유지
    if (!audioPlayer.src || audioPlayer.src !== songData.audio) {
        audioPlayer.src = songData.audio;
        audioPlayer.load();
        audioPlayer.play();
    }

    // ▶️ 재생/일시정지 버튼 기능 추가
    document.getElementById("playPauseBtn").addEventListener("click", function () {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    });

    // 🔄 곡이 끝나면 다시 재생
    audioPlayer.addEventListener("ended", function () {
        audioPlayer.play();
    });
});