
document.addEventListener("DOMContentLoaded", function () {
    let audioPlayer = document.getElementById("audioPlayer");
    let playPauseBtn = document.getElementById("playPauseBtn");
    let progressBar = document.getElementById("progress-bar");

    playPauseBtn.addEventListener("click", function () {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.textContent = "⏸️";
        } else {
            audioPlayer.pause();
            playPauseBtn.textContent = "▶️";
        }
    });

    audioPlayer.addEventListener("timeupdate", function () {
        progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    });

    progressBar.addEventListener("input", function () {
        audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
    });
});
