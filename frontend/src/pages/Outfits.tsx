import React, { useEffect, useState } from 'react';
import { outfitService } from '../services/outfits';
import { garmentService } from '../services/garments';
import { Outfit, Garment } from '../types';
import NavBar from '../components/NavBar';

const Outfits: React.FC = () => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadOutfits();
  }, []);

  const loadOutfits = async () => {
    try {
      const data = await outfitService.getAll();
      setOutfits(data);
    } catch (error) {
      console.error('Error loading outfits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this outfit?')) {
      try {
        await outfitService.delete(id);
        loadOutfits();
      } catch (error) {
        console.error('Error deleting outfit:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">My Outfits</h2>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Create Outfit
            </button>
          </div>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : outfits.length === 0 ? (
            <div className="text-center text-gray-500">
              No outfits created yet. Create your first outfit!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outfits.map((outfit) => (
                <div key={outfit.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">{outfit.name}</h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {outfit.garments.map(({ garment }) => (
                      <img
                        key={garment.id}
                        src={garment.imageUrl}
                        alt={garment.name}
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {outfit.garments.length} item(s)
                  </p>
                  <button
                    onClick={() => handleDelete(outfit.id)}
                    className="bg-red-500 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateOutfitModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            loadOutfits();
          }}
        />
      )}
    </div>
  );
};

const CreateOutfitModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [garments, setGarments] = useState<Garment[]>([]);
  const [selectedGarments, setSelectedGarments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadGarments();
  }, []);

  const loadGarments = async () => {
    try {
      const data = await garmentService.getAll();
      setGarments(data);
    } catch (error) {
      console.error('Error loading garments:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGarment = (id: string) => {
    setSelectedGarments((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGarments.length === 0) {
      alert('Please select at least one garment');
      return;
    }

    setCreating(true);
    try {
      await outfitService.create(name, selectedGarments);
      onSuccess();
    } catch (error) {
      console.error('Error creating outfit:', error);
      alert('Failed to create outfit');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8">
        <h3 className="text-2xl font-bold mb-4">Create New Outfit</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Outfit Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Garments ({selectedGarments.length} selected)
            </label>
            {loading ? (
              <div className="text-center">Loading garments...</div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2 border rounded">
                {garments.map((garment) => (
                  <div
                    key={garment.id}
                    onClick={() => toggleGarment(garment.id)}
                    className={`cursor-pointer border-2 rounded-lg p-2 ${
                      selectedGarments.includes(garment.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={garment.imageUrl}
                      alt={garment.name}
                      className="w-full h-24 object-cover rounded"
                    />
                    <p className="text-xs mt-1 text-center">{garment.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Outfit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Outfits;
