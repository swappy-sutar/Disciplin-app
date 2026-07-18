document.addEventListener('DOMContentLoaded', () => {
  // Add click handlers to all links to open in a new tab
  document.querySelectorAll('.app-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const url = link.getAttribute('href');
      
      // Open the URL in a new Chrome tab
      chrome.tabs.create({ url });
    });
  });
});
