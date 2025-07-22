// Helpers
const generateId = () => Math.random().toString(36).substring(2, 9);

// Initialize default map if none exists
const initializeDefaultMap = () => {
  try {
    const maps = getMaps();
    const activeMapId = getActiveMapId();
    
    // If no maps exist at all, create default map
    if (Object.keys(maps).length === 0) {
      const legacyIdeas = JSON.parse(localStorage.getItem('ideas') || '[]');
      const legacyLinks = JSON.parse(localStorage.getItem('brainstorm-links') || '[]');
      
      maps['default-map'] = { 
        name: 'Default Map', 
        ideas: legacyIdeas,
        links: legacyLinks
      };
      saveMaps(maps);
      setActiveMapId('default-map');
      return;
    }
    
    // If default map doesn't exist but other maps do
    if (!maps['default-map']) {
      maps['default-map'] = { 
        name: 'Default Map', 
        ideas: [],
        links: []
      };
      saveMaps(maps);
    }
    
    // If no active map is set, set to default
    if (!activeMapId || !maps[activeMapId]) {
      setActiveMapId('default-map');
    }
  } catch (error) {
    console.error('Error initializing default map:', error);
    // Reset to clean state if there's corruption
    const cleanMaps = {
      'default-map': { name: 'Default Map', ideas: [], links: [] }
    };
    saveMaps(cleanMaps);
    setActiveMapId('default-map');
  }
};

// 🔹 Get all maps
export const getMaps = () => {
  try {
    const data = localStorage.getItem("brainstorm-maps");
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting maps:', error);
    return {};
  }
};

// 🔹 Save all maps
export const saveMaps = (maps) => {
  try {
    localStorage.setItem("brainstorm-maps", JSON.stringify(maps));
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('storageUpdate'));
  } catch (error) {
    console.error('Error saving maps:', error);
  }
};

// 🔹 Get current active map ID
export const getActiveMapId = () => {
  try {
    return localStorage.getItem("active-map-id") || 'default-map';
  } catch (error) {
    console.error('Error getting active map ID:', error);
    return 'default-map';
  }
};

// 🔹 Set active map ID
export const setActiveMapId = (id) => {
  try {
    localStorage.setItem("active-map-id", id);
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('mapChanged', { detail: id }));
  } catch (error) {
    console.error('Error setting active map ID:', error);
  }
};

// 🔹 Create a new map
export const createNewMap = (name = "Untitled Map") => {
  try {
    const id = generateId();
    const maps = getMaps();
    maps[id] = { 
      name, 
      ideas: [], 
      links: [],
      created: new Date().toISOString()
    };
    saveMaps(maps);
    setActiveMapId(id);
    return id;
  } catch (error) {
    console.error('Error creating new map:', error);
    return null;
  }
};

// 🔹 Duplicate an existing map
export const duplicateMap = (sourceMapId, newName = null) => {
  try {
    const maps = getMaps();
    const sourceMap = maps[sourceMapId];
    
    if (!sourceMap) {
      console.error('Source map not found:', sourceMapId);
      return null;
    }
    
    const id = generateId();
    const duplicatedName = newName || `${sourceMap.name} (Copy)`;
    
    // Deep copy the source map to avoid reference issues
    maps[id] = {
      name: duplicatedName,
      ideas: JSON.parse(JSON.stringify(sourceMap.ideas || [])),
      links: JSON.parse(JSON.stringify(sourceMap.links || [])),
      created: new Date().toISOString()
    };
    
    saveMaps(maps);
    setActiveMapId(id);
    return id;
  } catch (error) {
    console.error('Error duplicating map:', error);
    return null;
  }
};

// 🔹 Get current map object
export const getCurrentMap = () => {
  try {
    initializeDefaultMap(); // Ensure default map exists
    const id = getActiveMapId();
    const maps = getMaps();
    const currentMap = maps[id];
    
    if (!currentMap) {
      console.warn(`Map ${id} not found, falling back to default`);
      return maps['default-map'] || { ideas: [], links: [] };
    }
    
    // Ensure the map has the required structure
    return {
      name: currentMap.name || 'Default Map',
      ideas: Array.isArray(currentMap.ideas) ? currentMap.ideas : [],
      links: Array.isArray(currentMap.links) ? currentMap.links : []
    };
  } catch (error) {
    console.error('Error getting current map:', error);
    return { ideas: [], links: [] };
  }
};

// 🔹 Delete a map
export const deleteMap = (mapId) => {
  try {
    if (mapId === 'default-map') {
      console.error('Cannot delete the default map');
      return false;
    }
    
    const maps = getMaps();
    if (!maps[mapId]) {
      console.error('Map not found:', mapId);
      return false;
    }
    
    delete maps[mapId];
    saveMaps(maps);
    
    // If deleting the active map, switch to default
    if (getActiveMapId() === mapId) {
      setActiveMapId('default-map');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting map:', error);
    return false;
  }
};

// 🔹 Rename a map
export const renameMap = (mapId, newName) => {
  try {
    const maps = getMaps();
    if (!maps[mapId]) {
      console.error('Map not found:', mapId);
      return false;
    }
    
    maps[mapId].name = newName;
    saveMaps(maps);
    return true;
  } catch (error) {
    console.error('Error renaming map:', error);
    return false;
  }
};

// 🔹 Save idea to current map
export const saveIdea = (newIdea) => {
  try {
    initializeDefaultMap();
    const maps = getMaps();
    const id = getActiveMapId();
    
    if (!maps[id]) {
      maps[id] = { name: 'Default Map', ideas: [], links: [] };
    }
    
    // Add unique ID if not present
    if (!newIdea.id) {
      newIdea.id = generateId();
    }
    
    // Ensure ideas array exists
    if (!Array.isArray(maps[id].ideas)) {
      maps[id].ideas = [];
    }
    
    maps[id].ideas.unshift(newIdea);
    saveMaps(maps);
    
    // Keep legacy support but don't let it override our map data
    localStorage.setItem('ideas', JSON.stringify(maps[id].ideas));
    
    return newIdea;
  } catch (error) {
    console.error('Error saving idea:', error);
    return null;
  }
};

// 🔹 Get all ideas from current map
export const getIdeas = () => {
  try {
    initializeDefaultMap();
    const map = getCurrentMap();
    return Array.isArray(map.ideas) ? map.ideas : [];
  } catch (error) {
    console.error('Error getting ideas:', error);
    return [];
  }
};

// 🔹 Get a single idea by ID
export const getIdeaById = (ideaId) => {
  try {
    const ideas = getIdeas();
    return ideas.find(idea => idea.id === ideaId) || null;
  } catch (error) {
    console.error('Error getting idea by ID:', error);
    return null;
  }
};

// 🔹 Update one idea
export const updateIdea = (updatedIdea) => {
  try {
    initializeDefaultMap();
    const maps = getMaps();
    const id = getActiveMapId();
    
    if (!maps[id]) {
      maps[id] = { name: 'Default Map', ideas: [], links: [] };
    }
    
    if (!Array.isArray(maps[id].ideas)) {
      maps[id].ideas = [];
    }

    maps[id].ideas = maps[id].ideas.map((idea) =>
      idea.id === updatedIdea.id ? updatedIdea : idea
    );
    saveMaps(maps);
    
    // Keep legacy support
    localStorage.setItem('ideas', JSON.stringify(maps[id].ideas));
    
    return true;
  } catch (error) {
    console.error('Error updating idea:', error);
    return false;
  }
};

// 🔹 Update all ideas
export const updateIdeas = (ideas) => {
  try {
    initializeDefaultMap();
    const maps = getMaps();
    const id = getActiveMapId();
    
    if (!maps[id]) {
      maps[id] = { name: 'Default Map', ideas: [], links: [] };
    }
    
    // Ensure ideas is an array
    const safeIdeas = Array.isArray(ideas) ? ideas : [];
    maps[id].ideas = safeIdeas;
    saveMaps(maps);
    
    // Keep legacy support
    localStorage.setItem('ideas', JSON.stringify(safeIdeas));
    
    return true;
  } catch (error) {
    console.error('Error updating ideas:', error);
    return false;
  }
};

// 🔹 Delete one idea
export const deleteIdea = (ideaId) => {
  try {
    initializeDefaultMap();
    const maps = getMaps();
    const id = getActiveMapId();
    
    if (!maps[id]) return false;
    
    if (!Array.isArray(maps[id].ideas)) {
      maps[id].ideas = [];
    }
    if (!Array.isArray(maps[id].links)) {
      maps[id].links = [];
    }

    maps[id].ideas = maps[id].ideas.filter((idea) => idea.id !== ideaId);
    maps[id].links = maps[id].links.filter(
      (link) => link.from !== ideaId && link.to !== ideaId
    );
    saveMaps(maps);
    
    // Keep legacy support
    localStorage.setItem('ideas', JSON.stringify(maps[id].ideas));
    
    return true;
  } catch (error) {
    console.error('Error deleting idea:', error);
    return false;
  }
};

// 🔹 Archive & Restore
export const archiveIdea = (ideaId) => {
  try {
    const ideas = getIdeas().map((idea) =>
      idea.id === ideaId ? { ...idea, archived: true } : idea
    );
    updateIdeas(ideas);
    return true;
  } catch (error) {
    console.error('Error archiving idea:', error);
    return false;
  }
};

export const restoreIdea = (ideaId) => {
  try {
    const ideas = getIdeas().map((idea) =>
      idea.id === ideaId ? { ...idea, archived: false } : idea
    );
    updateIdeas(ideas);
    return true;
  } catch (error) {
    console.error('Error restoring idea:', error);
    return false;
  }
};

// 🔹 Link management
export const getLinks = () => {
  try {
    initializeDefaultMap();
    const map = getCurrentMap();
    return Array.isArray(map.links) ? map.links : [];
  } catch (error) {
    console.error('Error getting links:', error);
    return [];
  }
};

export const saveLinks = (links) => {
  try {
    initializeDefaultMap();
    const maps = getMaps();
    const mapId = getActiveMapId();
    
    if (!maps[mapId]) {
      maps[mapId] = { name: 'Default Map', ideas: [], links: [] };
    }
    
    // Ensure links is an array
    const safeLinks = Array.isArray(links) ? links : [];
    maps[mapId].links = safeLinks;
    saveMaps(maps);
    return true;
  } catch (error) {
    console.error('Error saving links:', error);
    return false;
  }
};

export const saveLink = (id1, id2) => {
  try {
    initializeDefaultMap();
    const maps = getMaps();
    const mapId = getActiveMapId();
    
    if (!maps[mapId]) {
      maps[mapId] = { name: 'Default Map', ideas: [], links: [] };
    }

    if (!Array.isArray(maps[mapId].links)) {
      maps[mapId].links = [];
    }

    const links = maps[mapId].links;
    const exists = links.some(
      (link) =>
        (link.from === id1 && link.to === id2) ||
        (link.from === id2 && link.to === id1)
    );
    
    if (!exists) {
      maps[mapId].links.push({ 
        from: id1, 
        to: id2,
        created: new Date().toISOString()
      });
      saveMaps(maps);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving link:', error);
    return false;
  }
};

export const deleteLink = (id1, id2) => {
  try {
    initializeDefaultMap();
    const maps = getMaps();
    const mapId = getActiveMapId();
    
    if (!maps[mapId]) return false;
    
    if (!Array.isArray(maps[mapId].links)) {
      maps[mapId].links = [];
    }

    const originalLength = maps[mapId].links.length;
    maps[mapId].links = maps[mapId].links.filter(
      (link) =>
        !(link.from === id1 && link.to === id2) &&
        !(link.from === id2 && link.to === id1)
    );
    
    if (maps[mapId].links.length < originalLength) {
      saveMaps(maps);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting link:', error);
    return false;
  }
};

// 🔹 Bulk operations
export const exportMap = (mapId = null) => {
  try {
    const targetMapId = mapId || getActiveMapId();
    const maps = getMaps();
    const map = maps[targetMapId];
    
    if (!map) {
      console.error('Map not found for export:', targetMapId);
      return null;
    }
    
    return {
      id: targetMapId,
      ...map,
      exportDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error exporting map:', error);
    return null;
  }
};

export const importMap = (mapData, newName = null) => {
  try {
    const id = generateId();
    const maps = getMaps();
    
    maps[id] = {
      name: newName || mapData.name || 'Imported Map',
      ideas: Array.isArray(mapData.ideas) ? mapData.ideas : [],
      links: Array.isArray(mapData.links) ? mapData.links : [],
      created: new Date().toISOString(),
      imported: true
    };
    
    saveMaps(maps);
    return id;
  } catch (error) {
    console.error('Error importing map:', error);
    return null;
  }
};

// 🔹 Search functionality
export const searchIdeas = (query, options = {}) => {
  try {
    if (!query || query.trim().length === 0) return [];
    
    const { 
      includeArchived = false, 
      searchInTags = true, 
      searchInDescription = true,
      caseSensitive = false 
    } = options;
    
    const ideas = getIdeas();
    const searchTerm = caseSensitive ? query.trim() : query.trim().toLowerCase();
    
    return ideas.filter(idea => {
      if (!includeArchived && idea.archived) return false;
      
      const title = caseSensitive ? idea.title : idea.title.toLowerCase();
      const description = idea.description ? 
        (caseSensitive ? idea.description : idea.description.toLowerCase()) : '';
      
      // Search in title and description
      let matches = title.includes(searchTerm);
      if (searchInDescription && !matches) {
        matches = description.includes(searchTerm);
      }
      
      // Search in tags
      if (searchInTags && !matches && idea.tags && Array.isArray(idea.tags)) {
        matches = idea.tags.some(tag => {
          const tagText = caseSensitive ? tag : tag.toLowerCase();
          return tagText.includes(searchTerm);
        });
      }
      
      return matches;
    });
  } catch (error) {
    console.error('Error searching ideas:', error);
    return [];
  }
};

// 🔹 Statistics
export const getMapStats = (mapId = null) => {
  try {
    const targetMapId = mapId || getActiveMapId();
    const maps = getMaps();
    const map = maps[targetMapId];
    
    if (!map) return null;
    
    const ideas = Array.isArray(map.ideas) ? map.ideas : [];
    const links = Array.isArray(map.links) ? map.links : [];
    
    const stats = {
      totalIdeas: ideas.length,
      activeIdeas: ideas.filter(idea => !idea.archived).length,
      archivedIdeas: ideas.filter(idea => idea.archived).length,
      canvasIdeas: ideas.filter(idea => idea.x !== undefined && idea.y !== undefined && !idea.archived).length,
      sidebarIdeas: ideas.filter(idea => (idea.x === undefined || idea.x === null) && !idea.archived).length,
      totalLinks: links.length,
      tagCount: 0,
      uniqueTags: new Set()
    };
    
    // Count tags
    ideas.forEach(idea => {
      if (idea.tags && Array.isArray(idea.tags)) {
        idea.tags.forEach(tag => {
          stats.uniqueTags.add(tag.toLowerCase());
          stats.tagCount++;
        });
      }
    });
    
    stats.uniqueTagsCount = stats.uniqueTags.size;
    stats.uniqueTags = Array.from(stats.uniqueTags);
    
    return stats;
  } catch (error) {
    console.error('Error getting map stats:', error);
    return null;
  }
};

// 🔹 Debug/Recovery function
export const debugStorage = () => {
  console.log('=== Storage Debug ===');
  console.log('Maps:', getMaps());
  console.log('Active Map ID:', getActiveMapId());
  console.log('Current Map:', getCurrentMap());
  console.log('Ideas:', getIdeas());
  console.log('Links:', getLinks());
  console.log('Legacy ideas key:', localStorage.getItem('ideas'));
  console.log('Map Stats:', getMapStats());
};

// 🔹 Clean up and maintenance
export const cleanupStorage = () => {
  try {
    const maps = getMaps();
    let cleaned = false;
    
    Object.keys(maps).forEach(mapId => {
      const map = maps[mapId];
      
      // Ensure proper structure
      if (!Array.isArray(map.ideas)) {
        map.ideas = [];
        cleaned = true;
      }
      if (!Array.isArray(map.links)) {
        map.links = [];
        cleaned = true;
      }
      
      // Remove orphaned links (links that reference non-existent ideas)
      const ideaIds = new Set(map.ideas.map(idea => idea.id));
      const validLinks = map.links.filter(link => 
        ideaIds.has(link.from) && ideaIds.has(link.to)
      );
      
      if (validLinks.length !== map.links.length) {
        map.links = validLinks;
        cleaned = true;
      }
    });
    
    if (cleaned) {
      saveMaps(maps);
      console.log('Storage cleanup completed');
    }
    
    return cleaned;
  } catch (error) {
    console.error('Error during storage cleanup:', error);
    return false;
  }
};

// 🔹 Initialize storage on import
initializeDefaultMap();