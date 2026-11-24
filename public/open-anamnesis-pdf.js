(() => {
    const form = document.getElementById('pdf-access');
    const fallback = document.getElementById('pdf-panel');
    const token = window.location.hash.slice(1);
    if (!token) {
        window.location.replace(fallback.href);
        return;
    }
    if (!/^[A-Za-z0-9_-]{48}$/.test(token)) return;

    // Keep the capability out of the URL sent to link previews and HTTP logs.
    window.history.replaceState(null, '', window.location.pathname);
    form.elements.namedItem('token').value = token;
    form.submit();
})();
