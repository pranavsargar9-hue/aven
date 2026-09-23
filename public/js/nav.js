const NAV_ITEMS = [
  { href: '/dashboard.html', label: 'Dashboard' },
  { href: '/discover.html', label: 'Discover' },
  { href: '/tbr.html', label: 'TBR' },
  { href: '/reading.html', label: 'Currently Reading' },
  { href: '/completed.html', label: 'Completed' },
  { href: '/recommendations.html', label: 'Recommendations' },
  { href: '/surprise.html', label: 'Surprise Me' },
  { href: '/insights.html', label: 'Insights' }
];

function renderNav(activeHref) {
  const el = document.getElementById('nav');
  if (!el) return;

  const user = getCurrentUser();
  const links = NAV_ITEMS.map(item => {
    const active = item.href === activeHref ? ' active' : '';
    return `<a href="${item.href}" class="${active.trim()}">${item.label}</a>`;
  }).join('');

  el.innerHTML = `
    <div class="topnav-inner">
      <a href="/dashboard.html" class="brand">AVEN</a>
      <nav class="nav-links">${links}</nav>
      <div class="nav-right">
        <span style="font-size:0.85rem;color:var(--charcoal-soft);">${user ? escapeHtml(user.name) : ''}</span>
        <button class="btn btn-ghost btn-sm" id="nav-logout-btn">Log out</button>
      </div>
    </div>
  `;

  document.getElementById('nav-logout-btn').addEventListener('click', logout);
}
