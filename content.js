console.log("YouTube Clipper loaded!");

const CLIP_VIEWER_BASE_URL = "http://localhost:8000/clip.html";

if (window.__youtubeClipperInitialized) {
  console.log("YouTube Clipper already initialized.");
} else {
  window.__youtubeClipperInitialized = true;

  if (!/^\/watch\b/.test(window.location.pathname)) {
    console.log("Not a YouTube watch page; exiting.");
  } else {
    let startTime = null;
    let endTime = null;

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

      const params = new URLSearchParams(window.location.search);
      const videoId = params.get("v");

      if (!videoId) {
        console.log("Could not find YouTube video ID.");
        return;
      }

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

    clipper.appendChild(startButton);
    clipper.appendChild(endButton);
    clipper.appendChild(copyButton);

    const addClipperToPage = () => {
      if (!document.body || document.body.contains(clipper)) {
        return;
      }

      document.body.appendChild(clipper);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addClipperToPage, { once: true });
    } else {
      addClipperToPage();
    }

    document.addEventListener("keydown", (e) => {
      const tag = e.target && e.target.tagName;

      if (tag === "INPUT" || tag === "TEXTAREA") {
        return;
      }

      if (e.key.toLowerCase() === "s") {
        startButton.click();
      } else if (e.key.toLowerCase() === "e") {
        endButton.click();
      }
    });
  }
}