// Books stored in our catalog don't need a hand-picked image URL: we look up
// a real, matching cover at runtime from the Google Books API using the
// book's own title + author, and cache the result for the session.

const _coverCache = new Map();

async function getCoverUrl(title, author) {
  const key = (title + '|' + author).toLowerCase();
  if (_coverCache.has(key)) return _coverCache.get(key);

  const promise = (async () => {
    try {
      const q = encodeURIComponent(`intitle:${title} inauthor:${author}`);
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
      if (!res.ok) return null;
      const data = await res.json();
      const info = data.items && data.items[0] && data.items[0].volumeInfo;
      const links = info && info.imageLinks;
      let url = links ? (links.thumbnail || links.smallThumbnail) : null;
      if (url) url = url.replace('http://', 'https://').replace('zoom=1', 'zoom=2');
      return url || null;
    } catch (e) {
      return null;
    }
  })();

  _coverCache.set(key, promise);
  const result = await promise;
  _coverCache.set(key, result);
  return result;
}

// Wires up a `<div class="...cover-wrap..."><div class="cover-placeholder">...</div></div>`
// container: fetches the cover, and swaps in an <img> if one is found.
function mountCover(container, title, author) {
  const img = document.createElement('img');
  img.alt = title + ' cover';
  container.appendChild(img);

  getCoverUrl(title, author).then((url) => {
    if (!url) return;
    img.src = url;
    img.onload = () => {
      img.style.display = 'block';
      const placeholder = container.querySelector('.cover-placeholder');
      if (placeholder) placeholder.style.display = 'none';
    };
  });
}

function placeholderCoverHTML(title) {
  return `<div class="cover-placeholder"><span>${escapeHtml(title)}</span></div>`;
}
