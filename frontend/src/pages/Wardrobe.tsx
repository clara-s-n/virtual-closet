import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { garmentService } from '../services/garments';
import { Garment } from '../types';
import NavBar from '../components/NavBar';

const Wardrobe: React.FC = () => {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadGarments();
  }, [selectedCategory]);

  const loadGarments = async () => {
    try {
      const data = await garmentService.getAll(selectedCategory || undefined);
      setGarments(data);
    } catch (error) {
      console.error('Error loading garments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await garmentService.delete(id);
        loadGarments();
      } catch (error) {
        console.error('Error deleting garment:', error);
      }
    }
  };

  const categories = ['TOP', 'BOTTOM', 'DRESS', 'OUTERWEAR', 'SHOES', 'ACCESSORY'];

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">My Wardrobe</h2>
            <button
              onClick={() => setShowUpload(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Item
            </button>
          </div>

          <div className="mb-6">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="shadow border rounded py-2 px-3 text-gray-700"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : garments.length === 0 ? (
            <div className="text-center text-gray-500">
              No items in your wardrobe yet. Add your first item!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {garments.map((garment) => (
                <div key={garment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={garment.imageUrl}
                    alt={garment.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{garment.name}</h3>
                    <p className="text-sm text-gray-600">{garment.category}</p>
                    {garment.brand && (
                      <p className="text-sm text-gray-500">{garment.brand}</p>
                    )}
                    {garment.color && (
                      <p className="text-sm text-gray-500">Color: {garment.color}</p>
                    )}
                    <button
                      onClick={() => handleDelete(garment.id)}
                      className="mt-2 bg-red-500 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            loadGarments();
          }}
        />
      )}
    </div>
  );
};

const UploadModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('TOP');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('category', category);
      if (color) formData.append('color', color);
      if (brand) formData.append('brand', brand);
      if (description) formData.append('description', description);

      await garmentService.create(formData);
      onSuccess();
    } catch (error) {
      console.error('Error uploading garment:', error);
      alert('Failed to upload garment');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 className="text-2xl font-bold mb-4">Add New Item</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
            >
              <option value="TOP">Top</option>
              <option value="BOTTOM">Bottom</option>
              <option value="DRESS">Dress</option>
              <option value="OUTERWEAR">Outerwear</option>
              <option value="SHOES">Shoes</option>
              <option value="ACCESSORY">Accessory</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              required
            />
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
              disabled={uploading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Wardrobe;
