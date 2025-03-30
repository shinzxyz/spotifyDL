document.addEventListener('DOMContentLoaded', function() { const downloadBtn = document.querySelector('.spotbtn'); const spotifyInput = document.getElementById('spotifyDownloader'); const resultBox = document.getElementById('result'); const trackInfo = document.getElementById('track-info'); const pasteBtn = document.querySelector('.paste-btn'); const clearBtn = document.querySelector('.clear-btn');

pasteBtn.addEventListener('click', async function() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            spotifyInput.value = text;
            spotifyInput.dispatchEvent(new Event('input'));
            if (isValidSpotifyUrl(text)) {
                spotifyInput.focus();
            }
        }
    } catch (err) {
        showResult('Gagal membaca clipboard', 'error');
        console.error('Failed to read clipboard:', err);
    }
});

clearBtn.addEventListener('click', function() {
    spotifyInput.value = '';
    spotifyInput.focus();
    spotifyInput.dispatchEvent(new Event('input'));
});

downloadBtn.addEventListener('click', async function() {
    const url = spotifyInput.value.trim();
    
    if (!url) {
        showResult('Silakan masukkan URL Spotify terlebih dahulu', 'error');
        return;
    }

    if (!isValidSpotifyUrl(url)) {
        showResult('URL Spotify tidak valid. Contoh URL yang valid: https://open.spotify.com/track/...', 'error');
        return;
    }

    showResult('Sedang memproses...', 'loading');
    trackInfo.style.display = 'none';
    
    await fetchWithFallback(url);
});

async function fetchWithFallback(url) {
    const apis = [
        `https://spotifydl.xbotzlauncher.biz.id/api/spotify/download?url=${encodeURIComponent(url)}`,
        `https://spotifyapi.caliphdev.com/api/info/track?url=${encodeURIComponent(url)}`,
        `https://api.suraweb.online/download/spotify?url=${encodeURIComponent(url)}`
    ];
    
    for (let api of apis) {
        try {
            let response = await fetch(api);
            if (!response.ok) throw new Error('Response not OK');
            let data = await response.json();
            
            if (data.status && data.code === 200) {
                showTrackInfo(data.result);
                return;
            } else if (data.title) {
                showTrackInfo({
                    metadata: {
                        title: data.title,
                        artist: data.artist,
                        album: data.album || '-',
                        cover: data.thumbnail
                    },
                    download: data.url
                });
                return;
            } else if (data.status && data.data) {
                showTrackInfo({
                    metadata: {
                        title: data.data.title,
                        artist: data.data.artist,
                        cover: data.data.cover
                    },
                    download: data.data.download
                });
                return;
            }
        } catch (error) {
            console.warn(`API gagal: ${api}, mencoba API berikutnya...`);
        }
    }
    showResult('Gagal memproses dari semua API', 'error');
}

function isValidSpotifyUrl(url) {
    const pattern = /^(https?:\/\/)?(www\.)?open\.spotify\.com\/(track|album|playlist)\/[a-zA-Z0-9]+(\?.*)?$/;
    return pattern.test(url);
}

function showTrackInfo(trackData) {
    resultBox.style.display = 'none';
    trackInfo.style.display = 'flex';
    
    document.getElementById('track-title').textContent = trackData.metadata.title;
    document.getElementById('track-artist').textContent = trackData.metadata.artist;
    document.getElementById('track-album').textContent = trackData.metadata.album || '-';
    document.getElementById('track-cover').src = trackData.metadata.cover;
    document.getElementById('download-link').href = trackData.download;
}

function showResult(message, type) {
    resultBox.style.display = 'flex';
    trackInfo.style.display = 'none';
    
    const iconClass = {
        'error': 'fa-times-circle',
        'loading': 'fa-spinner fa-spin',
        'success': 'fa-check-circle'
    };
    
    resultBox.innerHTML = `
        <i class="fas ${iconClass[type] || 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    resultBox.className = `result-box ${type === 'loading' ? 'loading' : ''}`;
    
    const icon = resultBox.querySelector('i');
    if (type === 'error') {
        icon.style.color = '#ff4444';
    } else if (type === 'success') {
        icon.style.color = '#1DB954';
    }
}

});

