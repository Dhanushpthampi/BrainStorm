import React, { useState, useEffect } from 'react';
import { getMaps, createNewMap, setActiveMapId, getActiveMapId, saveMaps } from '../utils/localStorageUtils';

export default function MapManager({ onMapChange }) {
  const [maps, setMaps] = useState({});
  const [activeMapId, setActiveMapIdState] = useState('default-map');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameMapId, setRenameMapId] = useState(null);
  const [renameMapName, setRenameMapName] = useState('');

  // Load maps on component mount
  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = () => {
    try {
      const allMaps = getMaps();
      const currentActiveId = getActiveMapId();
      
      setMaps(allMaps);
      setActiveMapIdState(currentActiveId);
      
      // Ensure default map exists
      if (!allMaps['default-map']) {
        const defaultMap = { name: 'Default Map', ideas: [], links: [] };
        const updatedMaps = { ...allMaps, 'default-map': defaultMap };
        setMaps(updatedMaps);
        saveMaps(updatedMaps);
      }
    } catch (error) {
      console.error('Error loading maps:', error);
    }
  };

  const handleCreateMap = () => {
    if (!newMapName.trim()) return;
    
    try {
      const newId = createNewMap(newMapName.trim());
      if (newId) {
        loadMaps(); // Refresh the maps list
        setActiveMapIdState(newId);
        if (onMapChange) onMapChange(newId);
        setNewMapName('');
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating map:', error);
    }
  };

  const handleSwitchMap = (mapId) => {
    try {
      setActiveMapId(mapId);
      setActiveMapIdState(mapId);
      if (onMapChange) onMapChange(mapId);
    } catch (error) {
      console.error('Error switching map:', error);
    }
  };

  const handleRenameMap = () => {
    if (!renameMapName.trim() || !renameMapId) return;
    
    try {
      const allMaps = getMaps();
      if (allMaps[renameMapId]) {
        allMaps[renameMapId].name = renameMapName.trim();
        saveMaps(allMaps);
        setMaps(allMaps);
      }
      
      setRenameMapName('');
      setRenameMapId(null);
      setShowRenameModal(false);
    } catch (error) {
      console.error('Error renaming map:', error);
    }
  };

  const handleDeleteMap = (mapId) => {
    if (mapId === 'default-map') {
      alert('Cannot delete the default map');
      return;
    }

    if (!confirm('Are you sure you want to delete this map? This action cannot be undone.')) {
      return;
    }

    try {
      const allMaps = getMaps();
      delete allMaps[mapId];
      saveMaps(allMaps);
      
      // If deleting the active map, switch to default
      if (mapId === activeMapId) {
        setActiveMapId('default-map');
        setActiveMapIdState('default-map');
        if (onMapChange) onMapChange('default-map');
      }
      
      setMaps(allMaps);
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  const startRename = (mapId, currentName) => {
    setRenameMapId(mapId);
    setRenameMapName(currentName);
    setShowRenameModal(true);
  };

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      {/* Current Map Display */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">📊 Current Map:</span>
          <span className="text-sm font-bold text-blue-600">
            {maps[activeMapId]?.name || 'Default Map'}
          </span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full transition-colors"
          title="Create new map"
        >
          + New Map
        </button>
      </div>

      {/* Maps List */}
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {Object.entries(maps).map(([mapId, map]) => (
          <div
            key={mapId}
            className={`flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
              mapId === activeMapId
                ? 'bg-blue-100 border border-blue-300'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <button
              onClick={() => handleSwitchMap(mapId)}
              className="flex-1 text-left"
            >
              <div className="font-medium truncate">{map.name}</div>
              <div className="text-xs text-gray-500">
                {map.ideas?.length || 0} ideas • {map.links?.length || 0} links
              </div>
            </button>
            
            {mapId !== 'default-map' && (
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={() => startRename(mapId, map.name)}
                  className="text-gray-400 hover:text-blue-500 p-1"
                  title="Rename map"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteMap(mapId)}
                  className="text-gray-400 hover:text-red-500 p-1"
                  title="Delete map"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Map Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Create New Map</h3>
            <input
              type="text"
              value={newMapName}
              onChange={(e) => setNewMapName(e.target.value)}
              placeholder="Enter map name..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateMap();
                if (e.key === 'Escape') setShowCreateModal(false);
              }}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewMapName('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMap}
                disabled={!newMapName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Map Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Rename Map</h3>
            <input
              type="text"
              value={renameMapName}
              onChange={(e) => setRenameMapName(e.target.value)}
              placeholder="Enter new map name..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameMap();
                if (e.key === 'Escape') setShowRenameModal(false);
              }}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameMapName('');
                  setRenameMapId(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameMap}
                disabled={!renameMapName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}