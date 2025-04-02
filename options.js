// options.js
document.addEventListener('DOMContentLoaded', function() {
  const sitesContainer = document.getElementById('sites-container');
  const addSiteButton = document.getElementById('add-site');
  const saveButton = document.getElementById('save-settings');
  const searchBookmarksCheckbox = document.getElementById('search-bookmarks');
  const statusElement = document.getElementById('status');
  
  let customSites = [];
  
  // Load current settings
  loadSettings();
  
  // Event listeners
  addSiteButton.addEventListener('click', addEmptySite);
  saveButton.addEventListener('click', saveSettings);
  
  function loadSettings() {
    browser.storage.sync.get({
      customSites: [],
      searchBookmarks: true
    }).then((items) => {
      customSites = items.customSites;
      searchBookmarksCheckbox.checked = items.searchBookmarks;
      
      // Render existing sites
      renderSites();
    });
  }
  
  function renderSites() {
    sitesContainer.innerHTML = '';
    
    customSites.forEach((site, index) => {
      const siteElement = createSiteElement(site, index);
      sitesContainer.appendChild(siteElement);
    });
    
    // If no sites, add an empty one
    if (customSites.length === 0) {
      addEmptySite();
    }
  }
  
  function createSiteElement(site, index) {
    const div = document.createElement('div');
    div.className = 'site-entry';
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Website Name';
    titleInput.value = site.title || '';
    titleInput.addEventListener('input', () => updateSite(index, 'title', titleInput.value));
    
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'URL (e.g., https://example.com)';
    urlInput.value = site.url || '';
    urlInput.addEventListener('input', () => updateSite(index, 'url', urlInput.value));
    
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => removeSite(index));
    
    div.appendChild(titleInput);
    div.appendChild(urlInput);
    div.appendChild(removeButton);
    
    return div;
  }
  
  function updateSite(index, field, value) {
    customSites[index] = {
      ...customSites[index],
      [field]: value
    };
  }
  
  function addEmptySite() {
    customSites.push({
      title: '',
      url: ''
    });
    
    const newIndex = customSites.length - 1;
    const siteElement = createSiteElement(customSites[newIndex], newIndex);
    sitesContainer.appendChild(siteElement);
  }
  
  function removeSite(index) {
    customSites.splice(index, 1);
    renderSites();
  }
  
  function saveSettings() {
    // Filter out empty entries
    const validSites = customSites.filter(site => site.title.trim() !== '' && site.url.trim() !== '');
    
    browser.storage.sync.set({
      customSites: validSites,
      searchBookmarks: searchBookmarksCheckbox.checked
    }).then(() => {
      // Show success message
      statusElement.textContent = 'Settings saved successfully!';
      setTimeout(() => {
        statusElement.textContent = '';
      }, 3000);
      
      // Refresh the sites list with valid sites
      customSites = validSites;
      renderSites();
    });
  }
});
