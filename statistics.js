// Statistics tracking class
class AutomationStatistics {
  constructor() {
    this.stats = this.loadStats();
    this.sessionStats = this.createEmptyStats();
    this.startTime = Date.now();
  }

  createEmptyStats() {
    return {
      totalChecks: 0,
      totalHarvested: 0,
      totalPlanted: 0,
      totalWatered: 0,
      totalAutomationRuns: 0,
      cropStats: {},
      lastAutomationTime: null,
      automationErrors: 0,
      uptime: 0,
      averageActionsPerRun: 0,
      longestSession: 0,
      totalSessions: 0
    };
  }

  loadStats() {
    const saved = localStorage.getItem('molehillAutomationStats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading stats:', e);
      }
    }
    return this.createEmptyStats();
  }

  saveStats() {
    try {
      localStorage.setItem('molehillAutomationStats', JSON.stringify(this.stats));
    } catch (e) {
      console.error('Error saving stats:', e);
    }
  }

  // Track automation check
  recordCheck() {
    this.stats.totalChecks++;
    this.sessionStats.totalChecks++;
    this.saveStats();
  }

  // Track harvest action
  recordHarvest(cropType, count = 1) {
    this.stats.totalHarvested += count;
    this.sessionStats.totalHarvested += count;
    
    if (!this.stats.cropStats[cropType]) {
      this.stats.cropStats[cropType] = { harvested: 0, planted: 0 };
    }
    this.stats.cropStats[cropType].harvested += count;
    
    this.saveStats();
  }

  // Track plant action
  recordPlant(cropType, count = 1) {
    this.stats.totalPlanted += count;
    this.sessionStats.totalPlanted += count;
    
    if (!this.stats.cropStats[cropType]) {
      this.stats.cropStats[cropType] = { harvested: 0, planted: 0 };
    }
    this.stats.cropStats[cropType].planted += count;
    
    this.saveStats();
  }

  // Track water action
  recordWater(count = 1) {
    this.stats.totalWatered += count;
    this.sessionStats.totalWatered += count;
    this.saveStats();
  }

  // Track automation run
  recordAutomationRun(harvested, planted, watered, hasError = false) {
    this.stats.totalAutomationRuns++;
    this.sessionStats.totalAutomationRuns++;
    this.stats.lastAutomationTime = Date.now();
    
    if (hasError) {
      this.stats.automationErrors++;
      this.sessionStats.automationErrors++;
    }

    // Update average actions per run
    const totalActions = this.stats.totalHarvested + this.stats.totalPlanted + this.stats.totalWatered;
    this.stats.averageActionsPerRun = totalActions / this.stats.totalAutomationRuns;
    
    this.saveStats();
  }

  // Update session time
  updateSessionTime() {
    const currentUptime = Date.now() - this.startTime;
    this.sessionStats.uptime = currentUptime;
    
    if (currentUptime > this.stats.longestSession) {
      this.stats.longestSession = currentUptime;
    }
    
    this.saveStats();
  }

  // Start new session
  startNewSession() {
    this.stats.totalSessions++;
    this.sessionStats = this.createEmptyStats();
    this.startTime = Date.now();
    this.saveStats();
  }

  // Get formatted statistics
  getFormattedStats() {
    this.updateSessionTime();
    
    return {
      lifetime: {
        totalChecks: this.stats.totalChecks.toLocaleString(),
        totalHarvested: this.stats.totalHarvested.toLocaleString(),
        totalPlanted: this.stats.totalPlanted.toLocaleString(),
        totalWatered: this.stats.totalWatered.toLocaleString(),
        totalAutomationRuns: this.stats.totalAutomationRuns.toLocaleString(),
        automationErrors: this.stats.automationErrors.toLocaleString(),
        averageActionsPerRun: this.stats.averageActionsPerRun.toFixed(1),
        longestSession: this.formatDuration(this.stats.longestSession),
        totalSessions: this.stats.totalSessions.toLocaleString(),
        lastAutomationTime: this.stats.lastAutomationTime ? 
          new Date(this.stats.lastAutomationTime).toLocaleString() : 'Never'
      },
      session: {
        totalChecks: this.sessionStats.totalChecks.toLocaleString(),
        totalHarvested: this.sessionStats.totalHarvested.toLocaleString(),
        totalPlanted: this.sessionStats.totalPlanted.toLocaleString(),
        totalWatered: this.sessionStats.totalWatered.toLocaleString(),
        totalAutomationRuns: this.sessionStats.totalAutomationRuns.toLocaleString(),
        automationErrors: this.sessionStats.automationErrors.toLocaleString(),
        uptime: this.formatDuration(this.sessionStats.uptime)
      },
      crops: this.getTopCrops()
    };
  }

  // Get top crops by activity
  getTopCrops(limit = 5) {
    const crops = Object.entries(this.stats.cropStats)
      .map(([cropType, stats]) => ({
        cropType: parseInt(cropType),
        ...stats,
        total: stats.harvested + stats.planted
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);

    return crops;
  }

  // Format duration in milliseconds to readable string
  formatDuration(ms) {
    if (!ms) return '0s';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Reset all statistics
  resetStats() {
    this.stats = this.createEmptyStats();
    this.sessionStats = this.createEmptyStats();
    this.startTime = Date.now();
    this.saveStats();
  }

  // Export stats for backup
  exportStats() {
    return JSON.stringify({
      stats: this.stats,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  // Import stats from backup
  importStats(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.stats) {
        this.stats = { ...this.createEmptyStats(), ...data.stats };
        this.saveStats();
        return true;
      }
    } catch (e) {
      console.error('Error importing stats:', e);
    }
    return false;
  }
}

// Global instance
let statsManager = null;

// Initialize statistics manager
function initializeStatistics() {
  if (!statsManager) {
    statsManager = new AutomationStatistics();
  }
  return statsManager;
}

// Export functions for use in other modules
function getStatsManager() {
  return statsManager || initializeStatistics();
}

function recordAutomationCheck() {
  getStatsManager().recordCheck();
}

function recordAutomationHarvest(cropType, count = 1) {
  getStatsManager().recordHarvest(cropType, count);
}

function recordAutomationPlant(cropType, count = 1) {
  getStatsManager().recordPlant(cropType, count);
}

function recordAutomationWater(count = 1) {
  getStatsManager().recordWater(count);
}

function recordAutomationRun(harvested, planted, watered, hasError = false) {
  getStatsManager().recordAutomationRun(harvested, planted, watered, hasError);
}

function getFormattedStatistics() {
  return getStatsManager().getFormattedStats();
}

function resetAllStatistics() {
  getStatsManager().resetStats();
}

function exportStatistics() {
  return getStatsManager().exportStats();
}

function importStatistics(jsonData) {
  return getStatsManager().importStats(jsonData);
}
