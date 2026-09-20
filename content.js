console.log("YouTube Clipper loaded!");

const CLIP_VIEWER_BASE_URL =
    "https://cagneyc9.github.io/Youtube_Clip/";

if (window.__youtubeClipperInitialized) {
    console.log("YouTube Clipper already initialized.");
} else {
    window.__youtubeClipperInitialized = true;

    let startTime = null;
    let endTime = null;
    let currentVideoId = null;

    // Create the clipper UI
    const clipper = document.createElement("div");
    clipper.id = "youtube-clipper-root";

    const startButton = document.createElement("button");
    startButton.type = "button";
    startButton.textContent = "Set Start";

    const endButton = document.createElement("button");
    endButton.type = "button";
    endButton.textContent = "Set End";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "Copy Clip Link";

    const getVideo = () => document.querySelector("video");

    const getVideoId = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get("v");
    };

    const isWatchPage = () => {
        return window.location.pathname === "/watch" && getVideoId();
    };

    // Reset clip when changing YouTube videos
    const resetClip = () => {
        startTime = null;
        endTime = null;

        startButton.textContent = "Set Start";
        endButton.textContent = "Set End";
        copyButton.textContent = "Copy Clip Link";

        console.log("Clip times reset.");
    };

    const handleNavigation = () => {
        const newVideoId = getVideoId();

        // Hide controls if we're not watching a video
        if (!isWatchPage()) {
            clipper.style.display = "none";
            currentVideoId = null;
            resetClip();
            return;
        }

        clipper.style.display = "";

        // Reset timestamps if the video changed
        if (currentVideoId !== newVideoId) {
            currentVideoId = newVideoId;
            resetClip();

            console.log("Current video:", currentVideoId);
        }
    };

    // Set start time
    startButton.onclick = () => {
        const video = getVideo();

        if (!video) {
            console.log("No video element found.");
            return;
        }

        startTime = Math.floor(video.currentTime);

        console.log("Start:", startTime);

        startButton.textContent = `Start: ${startTime}s`;
    };

    // Set end time
    endButton.onclick = () => {
        const video = getVideo();

        if (!video) {
            console.log("No video element found.");
            return;
        }

        endTime = Math.floor(video.currentTime);

        console.log("End:", endTime);

        endButton.textContent = `End: ${endTime}s`;
    };

    // Clipboard helper
    const copyToClipboard = async (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const helper = document.createElement("textarea");

        helper.value = text;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";

        document.body.appendChild(helper);

        helper.select();

        try {
            document.execCommand("copy");
        } finally {
            helper.remove();
        }
    };

    // Copy clip link
    copyButton.onclick = async () => {
        if (startTime === null || endTime === null) {
            console.log("Set a start and end time first.");

            copyButton.textContent = "Set Start/End First";

            setTimeout(() => {
                copyButton.textContent = "Copy Clip Link";
            }, 1500);

            return;
        }

        if (endTime <= startTime) {
            console.log("End time must be after start time.");

            copyButton.textContent = "Invalid Times";

            setTimeout(() => {
                copyButton.textContent = "Copy Clip Link";
            }, 1500);

            return;
        }

        const videoId = getVideoId();

        if (!videoId) {
            console.log("Could not find YouTube video ID.");
            return;
        }

        // Build the shareable clip URL
        const clipUrl = new URL(CLIP_VIEWER_BASE_URL);

        clipUrl.searchParams.set("v", videoId);
        clipUrl.searchParams.set("s", String(startTime));
        clipUrl.searchParams.set("e", String(endTime));

        try {
            await copyToClipboard(clipUrl.toString());

            console.log("Video ID:", videoId);
            console.log("Start:", startTime);
            console.log("End:", endTime);
            console.log("Copied:", clipUrl.toString());

            copyButton.textContent = "Copied!";

            setTimeout(() => {
                copyButton.textContent = "Copy Clip Link";
            }, 1500);
        } catch (error) {
            console.error("Clipboard copy failed:", error);

            copyButton.textContent = "Copy Failed";

            setTimeout(() => {
                copyButton.textContent = "Copy Clip Link";
            }, 1500);
        }
    };

    // Add buttons
    clipper.appendChild(startButton);
    clipper.appendChild(endButton);
    clipper.appendChild(copyButton);

    const addClipperToPage = () => {
        if (!document.body) {
            return;
        }

        if (!document.body.contains(clipper)) {
            document.body.appendChild(clipper);
        }

        handleNavigation();
    };

    // Add UI once page is ready
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            addClipperToPage,
            { once: true }
        );
    } else {
        addClipperToPage();
    }

    // YouTube uses SPA navigation.
    // This fires when navigating between videos without refreshing.
    document.addEventListener("yt-navigate-finish", () => {
        addClipperToPage();
        handleNavigation();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        const target = e.target;

        // Don't trigger shortcuts while typing
        if (
            target instanceof HTMLElement &&
            (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            )
        ) {
            return;
        }

        if (!isWatchPage()) {
            return;
        }

        if (e.key.toLowerCase() === "s") {
            startButton.click();
        } else if (e.key.toLowerCase() === "e") {
            endButton.click();
        }
    });

    // Initial check
    handleNavigation();
}