// popup.js
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  const resultsList = document.getElementById('results');
  const settingsLink = document.getElementById('open-settings');
  
  let customSites = [];
  let bookmarkItems = [];
  let searchBookmarks = true;
  let selectedIndex = -1;
  let allResults = [];
  
  // Focus on search input when popup opens
  searchInput.focus();
  
  // Load settings and initialize search
  loadSettingsAndData();
  
  // Event listeners
  searchInput.addEventListener('input', performSearch);
  searchInput.addEventListener('keydown', handleKeyDown);
  resultsList.addEventListener('click', handleResultClick);
  settingsLink.addEventListener('click', openSettings);
  
  function loadSettingsAndData() {
    // Load custom sites and settings
    browser.storage.sync.get({
      customSites: [],
      searchBookmarks: true
    }).then((items) => {
      customSites = items.customSites;
      searchBookmarks = items.searchBookmarks;
      
      // If enabled, load bookmarks
      if (searchBookmarks) {
        loadBookmarks();
      } else {
        performSearch();
      }
    });
  }
  
  function loadBookmarks() {
    browser.bookmarks.getTree().then((bookmarksTree) => {
      bookmarkItems = [];
      processBookmarksTree(bookmarksTree);
      performSearch();
    });
  }
  
  function processBookmarksTree(bookmarksNodes) {
    for (const node of bookmarksNodes) {
      if (node.url) {
        bookmarkItems.push({
          title: node.title,
          url: node.url
        });
      }
      
      if (node.children) {
        processBookmarksTree(node.children);
      }
    }
  }
  
  function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    resultsList.innerHTML = '';
    selectedIndex = -1;
    allResults = [];
    
    // Add custom sites that match the query
    customSites.forEach(site => {
      if (query === '' || site.title.toLowerCase().includes(query) || site.url.toLowerCase().includes(query)) {
        allResults.push({
          title: site.title,
          url: site.url,
          source: 'custom'
        });
      }
    });
    
    // Add bookmarks that match the query if enabled
    if (searchBookmarks) {
      bookmarkItems.forEach(bookmark => {
        if (query === '' || bookmark.title.toLowerCase().includes(query) || bookmark.url.toLowerCase().includes(query)) {
          allResults.push({
            title: bookmark.title,
            url: bookmark.url,
            source: 'bookmark'
          });
        }
      });
    }
    
    // Display results
    allResults.forEach((result, index) => {
      const li = document.createElement('li');
      li.className = 'result-item';
      li.setAttribute('data-index', index);
      
      const sourceTag = document.createElement('span');
      sourceTag.className = `source-tag ${result.source}-tag`;
      sourceTag.textContent = result.source;
      
      li.textContent = result.title;
      li.appendChild(sourceTag);
      
      resultsList.appendChild(li);
    });
  }
  
  function handleKeyDown(e) {
    const resultsItems = document.querySelectorAll('.result-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, allResults.length - 1);
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < allResults.length) {
        openUrl(allResults[selectedIndex].url);
      }
    }
  }
  
  function updateSelection() {
    const items = document.querySelectorAll('.result-item');
    items.forEach(item => item.classList.remove('selected'));
    
    if (selectedIndex >= 0 && items[selectedIndex]) {
      items[selectedIndex].classList.add('selected');
      items[selectedIndex].scrollIntoView({block: 'nearest'});
    }
  }
  
  function handleResultClick(e) {
    const item = e.target.closest('.result-item');
    if (!item) return;
    
    const index = parseInt(item.getAttribute('data-index'));
    if (index >= 0 && index < allResults.length) {
      openUrl(allResults[index].url);
    }
  }
  
  function openUrl(url) {
    browser.tabs.create({
      url: url
    });
    window.close();
  }
  
  function openSettings() {
    browser.runtime.openOptionsPage();
    window.close();
  }
});
