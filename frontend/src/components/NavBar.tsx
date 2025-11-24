import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const NavBar: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-xl font-bold">Virtual Closet</span>
            </Link>
            <Link to="/wardrobe" className="flex items-center text-gray-700 hover:text-gray-900">
              Wardrobe
            </Link>
            <Link to="/outfits" className="flex items-center text-gray-700 hover:text-gray-900">
              Outfits
            </Link>
            <Link to="/try-on" className="flex items-center text-gray-700 hover:text-gray-900">
              Try-On
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.name || user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
