import React, { useEffect, useState } from 'react';
import { tryOnService } from '../services/tryOns';
import { bodyImageService } from '../services/bodyImages';
import { outfitService } from '../services/outfits';
import { TryOn, BodyImage, Outfit } from '../types';
import NavBar from '../components/NavBar';

const TryOnPage: React.FC = () => {
  const [tryOns, setTryOns] = useState<TryOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadTryOns();
  }, []);

  const loadTryOns = async () => {
    try {
      const data = await tryOnService.getAll();
      setTryOns(data);
    } catch (error) {
      console.error('Error loading try-ons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">AI Try-On</h2>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              New Try-On
            </button>
          </div>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : tryOns.length === 0 ? (
            <div className="text-center text-gray-500">
              No try-ons yet. Upload a body image and try on an outfit!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tryOns.map((tryOn) => (
                <div key={tryOn.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="grid grid-cols-2">
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-2">Body Image</p>
                      {tryOn.bodyImage && (
                        <img
                          src={tryOn.bodyImage.imageUrl}
                          alt="Body"
                          className="w-full h-48 object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {tryOn.status === 'COMPLETED' ? 'Result' : 'Processing...'}
                      </p>
                      {tryOn.resultUrl ? (
                        <img
                          src={tryOn.resultUrl}
                          alt="Try-on result"
                          className="w-full h-48 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                          <p className="text-gray-500 text-sm">Pending</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(tryOn.status)}`}>
                        {tryOn.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(tryOn.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {tryOn.outfit && (
                      <p className="mt-2 text-sm text-gray-600">Outfit: {tryOn.outfit.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateTryOnModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            loadTryOns();
          }}
        />
      )}
    </div>
  );
};

const CreateTryOnModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const [bodyImages, setBodyImages] = useState<BodyImage[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [selectedBodyImage, setSelectedBodyImage] = useState<string>('');
  const [selectedOutfit, setSelectedOutfit] = useState<string>('');
  const [uploadingBody, setUploadingBody] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bodyImagesData, outfitsData] = await Promise.all([
        bodyImageService.getAll(),
        outfitService.getAll(),
      ]);
      setBodyImages(bodyImagesData);
      setOutfits(outfitsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBodyImageUpload = async (file: File) => {
    setUploadingBody(true);
    try {
      const newBodyImage = await bodyImageService.upload(file);
      setBodyImages([newBodyImage, ...bodyImages]);
      setSelectedBodyImage(newBodyImage.id);
    } catch (error) {
      console.error('Error uploading body image:', error);
      alert('Failed to upload body image');
    } finally {
      setUploadingBody(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBodyImage) {
      alert('Please select or upload a body image');
      return;
    }

    setCreating(true);
    try {
      await tryOnService.create(selectedBodyImage, selectedOutfit || undefined);
      onSuccess();
    } catch (error) {
      console.error('Error creating try-on:', error);
      alert('Failed to create try-on');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8">
        <h3 className="text-2xl font-bold mb-4">Create Try-On</h3>
        
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Body Image</label>
              <div className="mb-2">
                <label className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer inline-block">
                  {uploadingBody ? 'Uploading...' : 'Upload New Body Image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBodyImageUpload(file);
                    }}
                    disabled={uploadingBody}
                  />
                </label>
              </div>
              <div className="grid grid-cols-4 gap-4 max-h-64 overflow-y-auto p-2 border rounded">
                {bodyImages.map((bodyImage) => (
                  <div
                    key={bodyImage.id}
                    onClick={() => setSelectedBodyImage(bodyImage.id)}
                    className={`cursor-pointer border-2 rounded-lg p-2 ${
                      selectedBodyImage === bodyImage.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={bodyImage.imageUrl}
                      alt="Body"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select Outfit (Optional)
              </label>
              <div className="grid grid-cols-3 gap-4 max-h-64 overflow-y-auto p-2 border rounded">
                <div
                  onClick={() => setSelectedOutfit('')}
                  className={`cursor-pointer border-2 rounded-lg p-4 flex items-center justify-center ${
                    selectedOutfit === '' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <p className="text-sm text-gray-600">None</p>
                </div>
                {outfits.map((outfit) => (
                  <div
                    key={outfit.id}
                    onClick={() => setSelectedOutfit(outfit.id)}
                    className={`cursor-pointer border-2 rounded-lg p-2 ${
                      selectedOutfit === outfit.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-medium mb-2">{outfit.name}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {outfit.garments.slice(0, 4).map(({ garment }) => (
                        <img
                          key={garment.id}
                          src={garment.imageUrl}
                          alt={garment.name}
                          className="w-full h-16 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
                disabled={creating || !selectedBodyImage}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Try-On'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TryOnPage;
