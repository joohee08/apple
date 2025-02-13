// JSON 데이터 로드 함수
async function loadSongs() {
    try {
        const response = await fetch('assets/data/songs.json');
        const songs = await response.json();
        return songs;
    } catch (error) {
        console.error('🚨 노래 데이터를 불러오는 중 오류 발생:', error);
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    // 🎵 세션에서 현재 재생 중인 곡 데이터 가져오기
    const songData = JSON.parse(sessionStorage.getItem("currentSong"));

    if (!songData) {
        console.error("🚨 곡 정보가 없습니다.");
        return;
    }

    // 🎵 JSON에서 전체 곡 목록 불러오기
    const songs = await loadSongs();

    // 현재 재생 중인 곡의 추가 정보(가사, 좋아요 수) 가져오기
    const currentSong = songs.find((song) => song.title === songData.title);

    if (!currentSong) {
        console.error(`🚨 ${songData.title} 곡 정보를 찾을 수 없습니다.`);
        return;
    }

    // 🎧 플레이어 UI 요소들
    const audioPlayer = document.getElementById("audioPlayer");
    const playerImg = document.getElementById("player-img");
    const playerTitle = document.getElementById("player-title");
    const playerArtist = document.getElementById("player-artist");

    const playPauseBtn = document.getElementById("playPauseBtn");
    const playPauseImg = document.getElementById("playPauseImg");
    const progressBar = document.getElementById("progress-bar");

    const repeatBtn = document.getElementById("repeatBtn");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    const likeCount = document.querySelector(".like-count");
    const lyricsContainer = document.querySelector(".song-lyrics p");

    // 좋아요
    const likeBtn = document.getElementById("likeBtn");

    // 관리자 좋아요 초기화버튼
    const resetLikesBtn = document.getElementById("resetLikesBtn");

    let isRepeating = false;
    let isShuffling = false;
    let isPlaying = false;

    // 🎵 UI에 곡 정보 세팅
    playerImg.src = currentSong.img;
    playerTitle.textContent = currentSong.title;
    playerArtist.textContent = currentSong.artist;
    audioPlayer.src = currentSong.audio;

    // ❤️ 좋아요 수, 가사 표시
    let currentLikes = parseInt(sessionStorage.getItem(`${currentSong.title}_likes`)) || currentSong.likes || 0;
    likeCount.textContent = currentLikes.toLocaleString();

    // 가사가 문자열인지 확인하고, 문자열이 아니면 "가사가 없습니다." 처리
    const lyricsText = Array.isArray(currentSong.lyrics)
    ? currentSong.lyrics.join("<br>")
    : currentSong.lyrics || "가사가 없습니다.";

    lyricsContainer.innerHTML = lyricsText;

    // ⏯️ 초기 재생 위치 설정 및 자동재생 시도
    audioPlayer.addEventListener("loadedmetadata", function () {
        if (songData.currentTime) {
            audioPlayer.currentTime = songData.currentTime;
        }

        // 자동 재생 시도
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                playPauseImg.src = "assets/img2/playmusic.png";
            }).catch(error => {
                console.warn("자동 재생이 차단됨:", error);
            });
        }
    });

    // 좋아요 버튼 클릭 이벤트
    likeBtn.addEventListener("click", function () {
        currentLikes += 1;
        likeCount.textContent = currentLikes.toLocaleString();

        // 좋아요 수를 개별 저장 (곡별로 유지됨)
        sessionStorage.setItem(`${currentSong.title}_likes`, currentLikes);
    });

    resetLikesBtn.addEventListener("click", function () {
        currentLikes = 0;
        likeCount.textContent = "0";
        sessionStorage.setItem(`${currentSong.title}_likes`, 0);
        alert('좋아요 초기화 완료!');
    });

    // ▶️⏸️ 재생 및 일시정지 토글
    playPauseBtn.addEventListener("click", function () {
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

    // 🔄 반복 설정 토글
    repeatBtn.addEventListener("click", function () {
        isRepeating = !isRepeating;
        audioPlayer.loop = isRepeating;
        repeatBtn.style.opacity = isRepeating ? "0.7" : "1";
    });

    // 🔀 랜덤 설정 토글 (랜덤 재생 기능은 필요시 추가 구현)
    shuffleBtn.addEventListener("click", function () {
        isShuffling = !isShuffling;
        shuffleBtn.style.opacity = isShuffling ? "0.7" : "1";
    });

    // ⏮️ 이전 곡(현재 곡 처음으로 돌아감)
    prevBtn.addEventListener("click", function () {
        audioPlayer.currentTime = 0;
    });

    // ⏭️ 다음 곡(현재 곡 처음으로 돌아감)
    nextBtn.addEventListener("click", function () {
        audioPlayer.currentTime = 0;
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    // 🎵 진행 바 업데이트
    audioPlayer.addEventListener("timeupdate", function () {
        if (!isNaN(audioPlayer.duration)) {
            const progressValue = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.value = progressValue.toFixed(2); // 소수점 2자리까지
    
            currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
            durationDisplay.textContent = formatTime(audioPlayer.duration);
        }
    });
    

    // 🎚️ 진행 바 이동
    progressBar.addEventListener("input", function () {
        const seekTime = (progressBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    });

    // ⏹️ 노래가 끝났을 때 일시정지 상태로 변경
    audioPlayer.addEventListener("ended", function () {
        isPlaying = false;
        playPauseImg.src = "assets/img2/playmusic.png";
    });

    // 🚀 페이지 이탈 시 현재 재생 시간 저장
    window.addEventListener("beforeunload", function () {
        sessionStorage.setItem(
            "currentSong",
            JSON.stringify({
                ...currentSong,
                currentTime: audioPlayer.currentTime,
            })
        );

        // 좋아요 수도 함께 저장(혹시 빠뜨릴까 추가해둠)
        sessionStorage.setItem(`${currentSong.title}_likes`, currentLikes);
    });
});
