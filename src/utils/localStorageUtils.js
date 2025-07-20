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
  } catch (error) {
    console.error('Error setting active map ID:', error);
  }
};

// 🔹 Create a new map
export const createNewMap = (name = "Untitled Map") => {
  try {
    const id = generateId();
    const maps = getMaps();
    maps[id] = { name, ideas: [], links: [] };
    saveMaps(maps);
    setActiveMapId(id);
    return id;
  } catch (error) {
    console.error('Error creating new map:', error);
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
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error saving idea:', error);
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
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error updating idea:', error);
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
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error updating ideas:', error);
  }
};

// 🔹 Delete one idea
export const deleteIdea = (ideaId) => {
  try {
    initializeDefaultMap();
    const maps = getMaps();
    const id = getActiveMapId();
    
    if (!maps[id]) return;
    
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
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error deleting idea:', error);
  }
};

// 🔹 Archive & Restore
export const archiveIdea = (ideaId) => {
  try {
    const ideas = getIdeas().map((idea) =>
      idea.id === ideaId ? { ...idea, archived: true } : idea
    );
    updateIdeas(ideas);
  } catch (error) {
    console.error('Error archiving idea:', error);
  }
};

export const restoreIdea = (ideaId) => {
  try {
    const ideas = getIdeas().map((idea) =>
      idea.id === ideaId ? { ...idea, archived: false } : idea
    );
    updateIdeas(ideas);
  } catch (error) {
    console.error('Error restoring idea:', error);
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
  } catch (error) {
    console.error('Error saving links:', error);
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
      maps[mapId].links.push({ from: id1, to: id2 });
      saveMaps(maps);
    }
  } catch (error) {
    console.error('Error saving link:', error);
  }
};

export const deleteLink = (id1, id2) => {
  try {
    initializeDefaultMap();
    const maps = getMaps();
    const mapId = getActiveMapId();
    
    if (!maps[mapId]) return;
    
    if (!Array.isArray(maps[mapId].links)) {
      maps[mapId].links = [];
    }

    maps[mapId].links = maps[mapId].links.filter(
      (link) =>
        !(link.from === id1 && link.to === id2) &&
        !(link.from === id2 && link.to === id1)
    );
    saveMaps(maps);
  } catch (error) {
    console.error('Error deleting link:', error);
  }
};

// 🔹 Debug/Recovery function (optional - you can remove this after fixing)
export const debugStorage = () => {
  console.log('=== Storage Debug ===');
  console.log('Maps:', getMaps());
  console.log('Active Map ID:', getActiveMapId());
  console.log('Current Map:', getCurrentMap());
  console.log('Ideas:', getIdeas());
  console.log('Links:', getLinks());
  console.log('Legacy ideas key:', localStorage.getItem('ideas'));
};