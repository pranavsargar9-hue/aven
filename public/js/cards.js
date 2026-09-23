// Builds the HTML for one book card. `context` controls which action
// buttons show up (discover/recommendation vs a shelf the user already has
// the book on).
function bookCardHTML(book, context) {
  const id = book.book_id || book.id;
  const meta = `${book.pages} pages • ${book.publication_year}`;

  let actions = '';
  if (context === 'discover' || context === 'recommendation') {
    actions = `<button class="btn btn-primary btn-sm" data-action="add-tbr" data-book-id="${id}">Want to Read</button>`;
  } else if (context === 'tbr') {
    actions = `
      <button class="btn btn-primary btn-sm" data-action="start-reading" data-book-id="${id}">Start Reading</button>
      <button class="btn btn-secondary btn-sm" data-action="mark-completed" data-book-id="${id}">Mark Completed</button>
      <button class="btn btn-danger btn-sm" data-action="remove" data-book-id="${id}">Remove</button>
    `;
  } else if (context === 'completed') {
    actions = `<button class="btn btn-danger btn-sm" data-action="remove" data-book-id="${id}">Remove</button>`;
  }

  return `
    <div class="book-card" data-book-id="${id}">
      <div class="book-cover-wrap" data-action="view" data-book-id="${id}">
        ${placeholderCoverHTML(book.title)}
      </div>
      <div class="book-info">
        <span class="genre-tag">${escapeHtml(book.genre)}</span>
        <div class="title" data-action="view" data-book-id="${id}">${escapeHtml(book.title)}</div>
        <div class="author">${escapeHtml(book.author)}</div>
        <div class="meta">${meta}</div>
        ${book.rating ? starDisplayHTML(book.rating) : ''}
        <div class="actions">${actions}</div>
      </div>
    </div>
  `;
}

function starDisplayHTML(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) stars += i <= rating ? '★' : '☆';
  return `<div style="color:var(--rose);font-size:0.95rem;margin-top:2px;">${stars}</div>`;
}

function renderBookGrid(container, books, context) {
  if (!books.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📚</div>
        <h3>Nothing here yet</h3>
        <p>Head over to Discover to find your next read.</p>
      </div>
    `;
    return;
  }
  container.innerHTML = books.map(b => bookCardHTML(b, context)).join('');
  container.querySelectorAll('.book-cover-wrap').forEach(el => {
    const title = el.closest('.book-card').querySelector('.title').textContent;
    const author = el.closest('.book-card').querySelector('.author').textContent;
    mountCover(el, title, author);
  });
}

// Central handler for every data-action button in book cards / modal.
// Returns true if it handled the click (caller can then refresh its list).
async function handleBookAction(action, bookId) {
  try {
    if (action === 'add-tbr') {
      await apiFetch('/user-books', { method: 'POST', body: JSON.stringify({ book_id: bookId, status: 'TBR' }) });
      showToast('Added to Want to Read');
    } else if (action === 'start-reading') {
      await apiFetch('/user-books', { method: 'POST', body: JSON.stringify({ book_id: bookId, status: 'READING' }) });
      showToast('Moved to Currently Reading');
    } else if (action === 'mark-completed') {
      await apiFetch('/user-books', { method: 'POST', body: JSON.stringify({ book_id: bookId, status: 'COMPLETED' }) });
      showToast('Marked as Completed 🎉');
    } else if (action === 'remove') {
      await apiFetch(`/user-books/${bookId}`, { method: 'DELETE' });
      showToast('Removed from your shelf');
    } else {
      return false;
    }
    return true;
  } catch (err) {
    showToast(err.message);
    return false;
  }
}

// Wires click-delegation for a grid container: view opens the modal,
// everything else runs handleBookAction then calls onChange() to refresh.
function attachBookGridEvents(container, onChange) {
  container.addEventListener('click', async (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const bookId = target.dataset.bookId;

    if (action === 'view') {
      openBookModal(bookId, onChange);
      return;
    }
    const handled = await handleBookAction(action, bookId);
    if (handled && onChange) onChange();
  });
}

// ---------- Book details modal ----------

function ensureModal() {
  let modal = document.getElementById('book-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'book-modal';
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" id="modal-close-btn">✕</button>
      <div class="modal-cover" id="modal-cover"></div>
      <div class="modal-body" id="modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });
  modal.querySelector('#modal-close-btn').addEventListener('click', () => modal.classList.remove('show'));
  return modal;
}

async function openBookModal(bookId, onChange) {
  const modal = ensureModal();
  const coverEl = modal.querySelector('#modal-cover');
  const bodyEl = modal.querySelector('#modal-body');
  coverEl.innerHTML = '';
  bodyEl.innerHTML = '<p>Loading…</p>';
  modal.classList.add('show');

  try {
    const { book } = await apiFetch(`/books/${bookId}`);
    coverEl.innerHTML = placeholderCoverHTML(book.title);
    mountCover(coverEl, book.title, book.author);

    bodyEl.innerHTML = `
      <span class="genre-tag">${escapeHtml(book.genre)}</span>
      <h2 style="margin-top:12px;">${escapeHtml(book.title)}</h2>
      <div class="meta-line">${escapeHtml(book.author)} • ${book.pages} pages • ${book.publication_year}</div>
      <p>${escapeHtml(book.description)}</p>
      <div class="modal-actions">
        <button class="btn btn-primary" data-action="add-tbr" data-book-id="${book.id}">Add to TBR</button>
        <button class="btn btn-secondary" data-action="start-reading" data-book-id="${book.id}">Start Reading</button>
        <button class="btn btn-secondary" data-action="mark-completed" data-book-id="${book.id}">Mark Completed</button>
      </div>
    `;

    bodyEl.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const handled = await handleBookAction(btn.dataset.action, btn.dataset.bookId);
        if (handled) {
          modal.classList.remove('show');
          if (onChange) onChange();
        }
      });
    });
  } catch (err) {
    bodyEl.innerHTML = `<p>${escapeHtml(err.message)}</p>`;
  }
}
