// HTML template will be injected here during build
const STATS_PANEL_HTML_TEMPLATE = `<!-- STATS_PANEL_HTML_TEMPLATE_PLACEHOLDER -->`;

let statisticsPanel = null;
let statsUpdateInterval = null;

// Create and show statistics panel
function createStatisticsPanel() {
  if (statisticsPanel) {
    toggleStatisticsPanel();
    return statisticsPanel;
  }

  // Create a container element to hold our HTML
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = STATS_PANEL_HTML_TEMPLATE.trim();
  
  // Get the panel container from the template
  statisticsPanel = tempContainer.firstChild;
  statisticsPanel.classList.add('statistics-panel-container');
  
  // Position to the right of the automation menu with some distance
  const automationMenu = document.getElementById('molehill-automation-menu');
  const menubg = document.getElementById('menubg');
  const rahmenQuer = document.getElementById('rahmen_quer');
  
  if (automationMenu) {
    const menuRect = automationMenu.getBoundingClientRect();
    
    // Position to the right of the automation menu with 20px gap
    statisticsPanel.style.left = (menuRect.right + 20) + 'px';
    
    if (menubg && rahmenQuer) {
      const menubgRect = menubg.getBoundingClientRect();
      const rahmenRect = rahmenQuer.getBoundingClientRect();
      
      // Align the top of the panel with the top of menubg
      statisticsPanel.style.top = menubgRect.top + 'px';
      
      // Set a fixed height that exactly spans from menubg top to rahmen_quer bottom
      const exactHeight = rahmenRect.bottom - menubgRect.top;
      statisticsPanel.style.height = `${exactHeight}px`;
    } else {
      statisticsPanel.style.top = menuRect.top + 'px';
      statisticsPanel.style.height = menuRect.height + 'px';
    }
  } else {
    // Fallback - try to find contentwrapper if automation menu not found
    const contentWrapper = document.getElementById('contentwrapper');
    if (contentWrapper) {
      const contentRect = contentWrapper.getBoundingClientRect();
      
      // Position to the right of the content area with additional offset for menu width + gaps
      statisticsPanel.style.left = (contentRect.right + 20 + 320 + 20) + 'px'; // content + gap + menu width + gap
      
      if (menubg && rahmenQuer) {
        const menubgRect = menubg.getBoundingClientRect();
        const rahmenRect = rahmenQuer.getBoundingClientRect();
        
        statisticsPanel.style.top = menubgRect.top + 'px';
        const exactHeight = rahmenRect.bottom - menubgRect.top;
        statisticsPanel.style.height = `${exactHeight}px`;
      } else {
        statisticsPanel.style.top = contentRect.top + 'px';
      }
    } else {
      // Final fallback position
      statisticsPanel.style.left = '400px';
      statisticsPanel.style.top = '50px';
    }
  }

  // Initially hidden
  statisticsPanel.style.display = 'none';
  
  // Add to document
  document.body.appendChild(statisticsPanel);
  
  // Setup event listeners
  setupStatisticsPanelEvents();
  
  return statisticsPanel;
}

// Setup event listeners for the statistics panel
function setupStatisticsPanelEvents() {
  if (!statisticsPanel) return;

  // Close button
  const closeBtn = statisticsPanel.querySelector('#close-stats-panel');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideStatisticsPanel);
  }

  // Reset button
  const resetBtn = statisticsPanel.querySelector('#reset-stats');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
        resetAllStatistics();
        updateStatisticsDisplay();
      }
    });
  }

  // Export button
  const exportBtn = statisticsPanel.querySelector('#export-stats');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportStatsToFile);
  }

  // Import button
  const importBtn = statisticsPanel.querySelector('#import-stats');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = importStatsFromFile;
      input.click();
    });
  }

  // Refresh button
  const refreshBtn = statisticsPanel.querySelector('#refresh-stats');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', updateStatisticsDisplay);
  }
}

// Toggle statistics panel visibility
function toggleStatisticsPanel() {
  if (!statisticsPanel) {
    createStatisticsPanel();
  }

  const isVisible = statisticsPanel.style.display !== 'none';
  
  if (isVisible) {
    hideStatisticsPanel();
  } else {
    showStatisticsPanel();
  }
}

// Show statistics panel
function showStatisticsPanel() {
  if (!statisticsPanel) {
    createStatisticsPanel();
  }

  statisticsPanel.style.display = 'block';
  updateStatisticsDisplay();
  
  // Start auto-refresh
  if (statsUpdateInterval) {
    clearInterval(statsUpdateInterval);
  }
  statsUpdateInterval = setInterval(updateStatisticsDisplay, 5000);
}

// Hide statistics panel
function hideStatisticsPanel() {
  if (statisticsPanel) {
    statisticsPanel.style.display = 'none';
  }
  
  // Stop auto-refresh
  if (statsUpdateInterval) {
    clearInterval(statsUpdateInterval);
    statsUpdateInterval = null;
  }
}

// Update the statistics display
function updateStatisticsDisplay() {
  if (!statisticsPanel) return;

  const stats = getFormattedStatistics();
  
  // Update lifetime stats
  updateStatElement('#lifetime-checks', stats.lifetime.totalChecks);
  updateStatElement('#lifetime-harvested', stats.lifetime.totalHarvested);
  updateStatElement('#lifetime-planted', stats.lifetime.totalPlanted);
  updateStatElement('#lifetime-watered', stats.lifetime.totalWatered);
  updateStatElement('#lifetime-runs', stats.lifetime.totalAutomationRuns);
  updateStatElement('#lifetime-errors', stats.lifetime.automationErrors);
  updateStatElement('#lifetime-avg-actions', stats.lifetime.averageActionsPerRun);
  updateStatElement('#lifetime-longest-session', stats.lifetime.longestSession);
  updateStatElement('#lifetime-total-sessions', stats.lifetime.totalSessions);
  updateStatElement('#lifetime-last-automation', stats.lifetime.lastAutomationTime);

  // Update session stats
  updateStatElement('#session-checks', stats.session.totalChecks);
  updateStatElement('#session-harvested', stats.session.totalHarvested);
  updateStatElement('#session-planted', stats.session.totalPlanted);
  updateStatElement('#session-watered', stats.session.totalWatered);
  updateStatElement('#session-runs', stats.session.totalAutomationRuns);
  updateStatElement('#session-errors', stats.session.automationErrors);
  updateStatElement('#session-uptime', stats.session.uptime);

  // Update top crops
  updateTopCropsDisplay(stats.crops);
}

// Helper function to update a stat element
function updateStatElement(selector, value) {
  const element = statisticsPanel.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

// Update top crops display
function updateTopCropsDisplay(crops) {
  const container = statisticsPanel.querySelector('#top-crops-list');
  if (!container) return;

  container.innerHTML = '';

  if (crops.length === 0) {
    container.innerHTML = '<div class="no-data">No crop data yet</div>';
    return;
  }

  crops.forEach((crop, index) => {
    const cropName = getCropName(crop.cropType) || `Crop ${crop.cropType}`;
    const cropColors = getCropColor(crop.cropType);
    
    const cropElement = document.createElement('div');
    cropElement.className = 'crop-stat-item';
    cropElement.innerHTML = `
      <div class="crop-stat-header">
        <div class="crop-indicator" style="background-color: ${cropColors.border}"></div>
        <span class="crop-name">#${index + 1} ${cropName}</span>
      </div>
      <div class="crop-stat-details">
        <span>Planted: ${crop.planted.toLocaleString()}</span>
        <span>Harvested: ${crop.harvested.toLocaleString()}</span>
      </div>
    `;
    
    container.appendChild(cropElement);
  });
}

// Export statistics to file
function exportStatsToFile() {
  try {
    const statsData = exportStatistics();
    const blob = new Blob([statsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `molehill-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Statistics exported successfully!');
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export statistics.');
  }
}

// Import statistics from file
function importStatsFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const success = importStatistics(e.target.result);
      if (success) {
        updateStatisticsDisplay();
        alert('Statistics imported successfully!');
      } else {
        alert('Failed to import statistics. Please check the file format.');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import statistics. Invalid file format.');
    }
  };
  reader.readAsText(file);
}

// Add statistics button to main menu
function addStatisticsButtonToMenu() {
  const menuControls = document.querySelector('.ma-menu-controls');
  if (!menuControls) return;

  // Check if button already exists
  if (document.getElementById('show-statistics')) return;

  const statsButton = document.createElement('button');
  statsButton.id = 'show-statistics';
  statsButton.className = 'ma-menu-button';
  statsButton.textContent = 'Show Statistics';
  statsButton.addEventListener('click', toggleStatisticsPanel);

  // Insert before the auto-harvest section
  const autoHarvestSection = menuControls.querySelector('.auto-harvest-section');
  if (autoHarvestSection) {
    menuControls.insertBefore(statsButton, autoHarvestSection);
  } else {
    menuControls.insertBefore(statsButton, menuControls.firstChild);
  }
}
