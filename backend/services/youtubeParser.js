import axios from 'axios';

// Extract playlist ID from YouTube URL
export function extractPlaylistId(url) {
  if (!url) return null;
  const match = url.match(/[&?]list=([^&]+)/i);
  if (match) return match[1];
  return null;
}

// Convert ISO 8601 duration (e.g. PT15M33S or PT1H2M5S) to human readable MM:SS or HH:MM:SS
function parseISODuration(isoDuration) {
  if (!isoDuration) return '15:00';
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '15:00';

  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Dynamically parse ANY YouTube playlist using YouTube Data API v3
export async function parsePlaylist(playlistUrl) {
  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId) {
    throw new Error('Invalid YouTube playlist URL. Please provide a valid playlist link containing ?list=...');
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is missing from backend/.env');
  }

  try {
    console.log(`📡 Fetching live YouTube Playlist via API for ID: ${playlistId}`);

    // 1. Fetch Playlist Title & Metadata
    const playlistRes = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
      params: {
        part: 'snippet,contentDetails',
        id: playlistId,
        key: apiKey,
      },
    });

    if (!playlistRes.data.items || playlistRes.data.items.length === 0) {
      throw new Error('YouTube playlist not found or is set to private.');
    }

    const playlistSnippet = playlistRes.data.items[0].snippet;
    const title = playlistSnippet.title || 'YouTube Educational Playlist';

    // 2. Fetch ALL Playlist Items (handling pagination up to 150 videos)
    let items = [];
    let nextPageToken = '';

    do {
      const itemsRes = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          part: 'snippet,contentDetails',
          playlistId: playlistId,
          maxResults: 50,
          pageToken: nextPageToken || undefined,
          key: apiKey,
        },
      });

      const fetchedItems = itemsRes.data.items || [];
      items = items.concat(fetchedItems);
      nextPageToken = itemsRes.data.nextPageToken || '';
    } while (nextPageToken && items.length < 150);

    if (items.length === 0) {
      throw new Error('This YouTube playlist contains no videos.');
    }

    // 3. Extract Video IDs & Fetch Durations in Batches of 50
    const videoIds = items
      .map((item) => item.contentDetails?.videoId || item.snippet?.resourceId?.videoId)
      .filter(Boolean);

    let durationMap = {};
    for (let i = 0; i < videoIds.length; i += 50) {
      const batchIds = videoIds.slice(i, i + 50);
      const videosRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'contentDetails',
          id: batchIds.join(','),
          key: apiKey,
        },
      });

      (videosRes.data.items || []).forEach((v) => {
        durationMap[v.id] = parseISODuration(v.contentDetails?.duration);
      });
    }

    // 4. Transform into Lessons
    const lessons = items.map((item, index) => {
      const vId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId || `video_${index}`;
      return {
        id: `l_${index + 1}`,
        title: item.snippet?.title || `Lesson ${index + 1}`,
        videoId: vId,
        duration: durationMap[vId] || '15:00',
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
      };
    });

    // 5. Dynamically Group Lessons into Modules (6 lessons per module)
    const chunkSize = 6;
    const modules = [];
    for (let i = 0; i < lessons.length; i += chunkSize) {
      const modIndex = (Math.floor(i / chunkSize) + 1).toString().padStart(2, '0');
      const chunk = lessons.slice(i, i + chunkSize);

      const firstTitle = chunk[0]?.title || '';
      const cleanTitle = firstTitle.includes('-')
        ? firstTitle.split('-')[0].trim()
        : firstTitle.split('|')[0].trim();

      modules.push({
        index: modIndex,
        title: `Module ${modIndex}: ${cleanTitle || 'Section Content'}`,
        lessons: chunk,
      });
    }

    console.log(`✅ Successfully generated dynamic course: "${title}" (${lessons.length} videos, ${modules.length} modules)`);

    return {
      courseId: playlistId,
      title,
      playlistUrl,
      totalVideos: lessons.length,
      totalDuration: `${Math.round(lessons.length * 0.4)} hours`,
      modules,
    };
  } catch (err) {
    const errorMsg = err.response?.data?.error?.message || err.message || 'Failed to parse YouTube playlist';
    console.error('❌ Error parsing YouTube playlist:', errorMsg);
    throw new Error(errorMsg);
  }
}
