// Helpers
const generateId = () => Math.random().toString(36).substring(2, 9);

// 🔹 Get all global ideas
export const getGlobalIdeas = () => {
  try {
    const data = localStorage.getItem("brainstorm-global-ideas");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting global ideas:', error);
    return [];
  }
};

// 🔹 Save all global ideas
export const saveGlobalIdeas = (ideas) => {
  try {
    localStorage.setItem("brainstorm-global-ideas", JSON.stringify(ideas));
    // Trigger storage event
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('globalIdeasUpdated'));
  } catch (error) {
    console.error('Error saving global ideas:', error);
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
    // Trigger storage event
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('storageUpdate'));
  } catch (error) {
    console.error('Error saving maps:', error);
  }
};

// 🔹 Migration: Convert legacy map-bound ideas to global library
const migrateToGlobalLibrary = () => {
  try {
    // Check if migration has already been completed using a flag
    const migrationCompleted = localStorage.getItem('brainstorm-migration-completed');
    if (migrationCompleted === 'true') {
      return;
    }
    
    const globalIdeas = getGlobalIdeas();
    const maps = getMaps();
    const legacyIdeas = JSON.parse(localStorage.getItem('ideas') || '[]');
    
    // Check if there's actually any legacy data to migrate
    const hasLegacyData = legacyIdeas.length > 0 || 
                          Object.values(maps).some(m => Array.isArray(m.ideas));
    
    // If no legacy data exists, mark as migrated and return
    if (!hasLegacyData) {
      localStorage.setItem('brainstorm-migration-completed', 'true');
      return;
    }

    console.log('Migrating to global idea library...');
    
    const allIdeasMap = new Map();
    
    // 1. Collect ideas from legacy 'ideas' key if exists
    legacyIdeas.forEach(idea => {
      if (!allIdeasMap.has(idea.id)) {
        // Strip position data for global store
        const { x, y, ...ideaData } = idea;
        allIdeasMap.set(idea.id, ideaData);
      }
    });

    // 2. Collect ideas from all maps
    Object.keys(maps).forEach(mapId => {
      const map = maps[mapId];
      if (Array.isArray(map.ideas)) {
        map.ideas.forEach(idea => {
          if (!allIdeasMap.has(idea.id)) {
            const { x, y, ...ideaData } = idea;
            allIdeasMap.set(idea.id, ideaData);
          }
        });
        
        // Convert map.ideas to map.nodes
        map.nodes = map.ideas
          .filter(i => i.x !== undefined && i.y !== undefined)
          .map(i => ({ id: i.id, x: i.x, y: i.y }));
        
        delete map.ideas; // Remove legacy array
      } else if (!map.nodes) {
        map.nodes = [];
      }
    });

    // 3. Save Global Ideas (only if we have any)
    if (allIdeasMap.size > 0) {
      saveGlobalIdeas(Array.from(allIdeasMap.values()));
    }
    
    // 4. Save Updated Maps
    if (Object.keys(maps).length > 0) {
      saveMaps(maps);
    }
    
    // Mark migration as completed
    localStorage.setItem('brainstorm-migration-completed', 'true');
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

// Initialize default map if none exists
const initializeDefaultMap = () => {
  try {
    migrateToGlobalLibrary(); // Run migration first
    
    const maps = getMaps();
    const activeMapId = getActiveMapId();
    
    // If no maps exist at all, create default map
    if (Object.keys(maps).length === 0) {
      maps['default-map'] = { 
        name: 'Default Map', 
        nodes: [],
        links: []
      };
      saveMaps(maps);
      setActiveMapId('default-map');
      return;
    }
    
    // If default map doesn't exist but other maps do
    if (!maps['default-map']) {
      maps['default-map'] = { 
        name: 'Default Map', 
        nodes: [],
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
      nodes: [], 
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
    
    maps[id] = {
      name: duplicatedName,
      nodes: JSON.parse(JSON.stringify(sourceMap.nodes || [])),
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
    initializeDefaultMap();
    const id = getActiveMapId();
    const maps = getMaps();
    const currentMap = maps[id];
    
    if (!currentMap) {
      return maps['default-map'] || { nodes: [], links: [] };
    }
    
    return {
      name: currentMap.name || 'Default Map',
      nodes: Array.isArray(currentMap.nodes) ? currentMap.nodes : [],
      links: Array.isArray(currentMap.links) ? currentMap.links : []
    };
  } catch (error) {
    console.error('Error getting current map:', error);
    return { nodes: [], links: [] };
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
    if (!maps[mapId]) return false;
    
    delete maps[mapId];
    saveMaps(maps);
    
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
    if (!maps[mapId]) return false;
    
    maps[mapId].name = newName;
    saveMaps(maps);
    return true;
  } catch (error) {
    console.error('Error renaming map:', error);
    return false;
  }
};

// 🔹 Save idea (Global)
export const saveIdea = (newIdea) => {
  try {
    initializeDefaultMap();
    const globalIdeas = getGlobalIdeas();
    
    if (!newIdea.id) {
      newIdea.id = generateId();
    }
    
    // Remove position data before saving to global
    const { x, y, ...ideaData } = newIdea;
    
    // Check if idea with this ID already exists
    const existingIndex = globalIdeas.findIndex(i => i.id === newIdea.id);
    if (existingIndex !== -1) {
      // If exists, update it instead of adding duplicate
      globalIdeas[existingIndex] = { ...globalIdeas[existingIndex], ...ideaData };
    } else {
      globalIdeas.unshift(ideaData);
    }
    
    saveGlobalIdeas(globalIdeas);
    
    // If it has position, add to current map
    if (x !== undefined && y !== undefined) {
      const maps = getMaps();
      const id = getActiveMapId();
      if (maps[id]) {
        if (!maps[id].nodes) maps[id].nodes = [];
        
        // Check if node exists
        const nodeIndex = maps[id].nodes.findIndex(n => n.id === newIdea.id);
        if (nodeIndex !== -1) {
          maps[id].nodes[nodeIndex] = { id: newIdea.id, x, y };
        } else {
          maps[id].nodes.push({ id: newIdea.id, x, y });
        }
        
        saveMaps(maps);
      }
    }
    
    return newIdea;
  } catch (error) {
    console.error('Error saving idea:', error);
    return null;
  }
};

// 🔹 Get all ideas (Merged Global + Map Positions)
export const getIdeas = () => {
  try {
    initializeDefaultMap();
    const globalIdeas = getGlobalIdeas();
    const map = getCurrentMap();
    const nodes = map.nodes || [];
    
    // Merge global ideas with map positions
    return globalIdeas.map(idea => {
      const node = nodes.find(n => n.id === idea.id);
      if (node) {
        return { ...idea, x: node.x, y: node.y };
      }
      return idea;
    });
  } catch (error) {
    console.error('Error getting ideas:', error);
    return [];
  }
};

// 🔹 Get a single idea by ID
export const getIdeaById = (ideaId) => {
  try {
    const ideas = getGlobalIdeas();
    return ideas.find(idea => idea.id === ideaId) || null;
  } catch (error) {
    console.error('Error getting idea by ID:', error);
    return null;
  }
};

// 🔹 Update one idea (Global Data + Map Position)
export const updateIdea = (updatedIdea) => {
  try {
    // 1. Update Global Data
    const globalIdeas = getGlobalIdeas();
    const index = globalIdeas.findIndex(i => i.id === updatedIdea.id);
    
    if (index !== -1) {
      const { x, y, ...ideaData } = updatedIdea;
      globalIdeas[index] = { ...globalIdeas[index], ...ideaData };
      saveGlobalIdeas(globalIdeas);
    }

    // 2. Update Map Position if changed
    if (updatedIdea.x !== undefined && updatedIdea.y !== undefined) {
      const maps = getMaps();
      const id = getActiveMapId();
      if (maps[id]) {
        if (!maps[id].nodes) maps[id].nodes = [];
        const nodeIndex = maps[id].nodes.findIndex(n => n.id === updatedIdea.id);
        
        if (nodeIndex !== -1) {
          maps[id].nodes[nodeIndex] = { id: updatedIdea.id, x: updatedIdea.x, y: updatedIdea.y };
        } else {
          maps[id].nodes.push({ id: updatedIdea.id, x: updatedIdea.x, y: updatedIdea.y });
        }
        saveMaps(maps);
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating idea:', error);
    return false;
  }
};

// 🔹 Update all ideas (Batch)
export const updateIdeas = (ideas) => {
  try {
    // This function is mostly used for updating positions in BoardCanvas
    // So we focus on updating map nodes, but also sync global data if needed
    
    const maps = getMaps();
    const mapId = getActiveMapId();
    
    if (!maps[mapId]) return false;
    
    // Update Map Nodes
    const newNodes = [];
    ideas.forEach(idea => {
      if (idea.x !== undefined && idea.y !== undefined && !idea.archived) {
        newNodes.push({ id: idea.id, x: idea.x, y: idea.y });
      }
    });
    
    maps[mapId].nodes = newNodes;
    saveMaps(maps);
    
    // We don't typically batch update global idea content (title/desc) from canvas
    // But if we did, we would need to diff and save to globalIdeas
    
    return true;
  } catch (error) {
    console.error('Error updating ideas:', error);
    return false;
  }
};

// 🔹 Delete one idea (Global)
export const deleteIdea = (ideaId) => {
  try {
    // Remove from Global
    const globalIdeas = getGlobalIdeas();
    const newGlobalIdeas = globalIdeas.filter(i => i.id !== ideaId);
    saveGlobalIdeas(newGlobalIdeas);
    
    // Remove from ALL maps
    const maps = getMaps();
    Object.keys(maps).forEach(mapId => {
      if (maps[mapId].nodes) {
        maps[mapId].nodes = maps[mapId].nodes.filter(n => n.id !== ideaId);
      }
      if (maps[mapId].links) {
        maps[mapId].links = maps[mapId].links.filter(l => l.from !== ideaId && l.to !== ideaId);
      }
    });
    saveMaps(maps);
    
    return true;
  } catch (error) {
    console.error('Error deleting idea:', error);
    return false;
  }
};

// 🔹 Archive & Restore
export const archiveIdea = (ideaId) => {
  try {
    const globalIdeas = getGlobalIdeas();
    const index = globalIdeas.findIndex(i => i.id === ideaId);
    if (index !== -1) {
      globalIdeas[index].archived = true;
      saveGlobalIdeas(globalIdeas);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error archiving idea:', error);
    return false;
  }
};

export const restoreIdea = (ideaId) => {
  try {
    const globalIdeas = getGlobalIdeas();
    const index = globalIdeas.findIndex(i => i.id === ideaId);
    if (index !== -1) {
      globalIdeas[index].archived = false;
      saveGlobalIdeas(globalIdeas);
      return true;
    }
    return false;
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
    
    if (!maps[mapId]) return false;
    
    maps[mapId].links = Array.isArray(links) ? links : [];
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
    
    if (!maps[mapId]) return false;
    if (!maps[mapId].links) maps[mapId].links = [];

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
    
    if (!maps[mapId] || !maps[mapId].links) return false;

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
    
    if (!map) return null;
    
    // Hydrate nodes with idea data for export
    const globalIdeas = getGlobalIdeas();
    const hydratedIdeas = (map.nodes || []).map(node => {
      const idea = globalIdeas.find(i => i.id === node.id);
      return idea ? { ...idea, x: node.x, y: node.y } : null;
    }).filter(Boolean);

    return {
      id: targetMapId,
      name: map.name,
      ideas: hydratedIdeas,
      links: map.links || [],
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
    
    // Save imported ideas to global library
    if (Array.isArray(mapData.ideas)) {
      mapData.ideas.forEach(idea => {
        saveIdea(idea); // This handles global save + checking for duplicates (if we added check)
        // Actually saveIdea generates new ID if missing.
        // We should probably check if ID exists to avoid duplicates if importing same map?
        // For now, let's just save them.
      });
    }

    // Create nodes from ideas
    const nodes = Array.isArray(mapData.ideas) 
      ? mapData.ideas
          .filter(i => i.x !== undefined && i.y !== undefined)
          .map(i => ({ id: i.id, x: i.x, y: i.y }))
      : [];

    maps[id] = {
      name: newName || mapData.name || 'Imported Map',
      nodes: nodes,
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
    
    const ideas = getGlobalIdeas();
    const searchTerm = caseSensitive ? query.trim() : query.trim().toLowerCase();
    
    return ideas.filter(idea => {
      if (!includeArchived && idea.archived) return false;
      
      const title = caseSensitive ? idea.title : idea.title.toLowerCase();
      const description = idea.description ? 
        (caseSensitive ? idea.description : idea.description.toLowerCase()) : '';
      
      let matches = title.includes(searchTerm);
      if (searchInDescription && !matches) {
        matches = description.includes(searchTerm);
      }
      
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
    
    const globalIdeas = getGlobalIdeas();
    const nodes = map.nodes || [];
    const links = map.links || [];
    
    // Count ideas on this map
    const mapIdeaIds = new Set(nodes.map(n => n.id));
    const mapIdeas = globalIdeas.filter(i => mapIdeaIds.has(i.id));
    
    const stats = {
      totalIdeas: globalIdeas.length, // Global total
      mapIdeas: mapIdeas.length,      // Ideas on this map
      activeIdeas: mapIdeas.filter(idea => !idea.archived).length,
      archivedIdeas: mapIdeas.filter(idea => idea.archived).length,
      totalLinks: links.length,
      tagCount: 0,
      uniqueTags: new Set()
    };
    
    mapIdeas.forEach(idea => {
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
  console.log('Global Ideas:', getGlobalIdeas());
  console.log('Maps:', getMaps());
  console.log('Active Map ID:', getActiveMapId());
  console.log('Current Map:', getCurrentMap());
  console.log('Merged Ideas (Current Map):', getIdeas());
};

// 🔹 Clean up and maintenance
export const cleanupStorage = () => {
  try {
    const maps = getMaps();
    const globalIdeas = getGlobalIdeas();
    const globalIdeaIds = new Set(globalIdeas.map(i => i.id));
    let cleaned = false;
    
    Object.keys(maps).forEach(mapId => {
      const map = maps[mapId];
      
      // Clean up nodes referencing non-existent ideas
      if (map.nodes) {
        const originalCount = map.nodes.length;
        map.nodes = map.nodes.filter(n => globalIdeaIds.has(n.id));
        if (map.nodes.length !== originalCount) cleaned = true;
      }
      
      // Clean up links referencing non-existent ideas
      if (map.links) {
        const originalCount = map.links.length;
        map.links = map.links.filter(l => globalIdeaIds.has(l.from) && globalIdeaIds.has(l.to));
        if (map.links.length !== originalCount) cleaned = true;
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

// 🔹 Initialize storage
initializeDefaultMap();