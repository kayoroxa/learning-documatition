export function fetchFolders() {
  return fetch('/folders').then(res => res.json())
}

export function fetchVideos(folder) {
  return fetch(`/videos?folder=${encodeURIComponent(folder)}`).then(res => res.json())
}

export function buildVideoUrl(video, start, duration) {
  return `/stream?path=${encodeURIComponent(video)}&start=${start}&clipDuration=${duration}&t=${Date.now()}`
}