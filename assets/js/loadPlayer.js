document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (event) => {
        const playlistM = event.target.closest(".playlistM");
        if (!playlistM) return;

        console.log("🎵 플레이어 클릭됨 ✅");

        const songData = getCurrentSongData();
        saveSongDataToSession(songData);
        navigateToPlayerPage();
    });
});

/**
 * 🎶 현재 선택된 곡 정보를 가져오는 함수
 */
function getCurrentSongData() {
    return {
        title: document.getElementById("player-title")?.textContent || "Unknown Title",
        artist: document.getElementById("player-artist")?.textContent || "Unknown Artist",
        img: document.getElementById("player-img")?.src || "assets/img/default.jpg",
        audio: document.getElementById("audioPlayer")?.src || "assets/audio/default.mp3"
    };
}

/**
 * 🎵 곡 정보를 `sessionStorage`에 저장
 */
function saveSongDataToSession(songData) {
    sessionStorage.setItem("currentSong", JSON.stringify(songData));
}

/**
 * 🔄 새로운 페이지(`appleplayer.html`)로 이동 (URL 짧게 유지)
 */
function navigateToPlayerPage() {
    window.location.href = "appleplayer.html"; // ✅ URL이 간단해짐
}
