import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-purple-100 text-purple-700 rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold">
            {currentUser?.displayName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{currentUser?.displayName || 'User'}</h2>
            <p className="text-gray-600">{currentUser?.email}</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <div className="p-2 bg-gray-50 rounded border">{currentUser?.displayName || 'Not set'}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <div className="p-2 bg-gray-50 rounded border">{currentUser?.email || 'Not set'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-6">
          <h3 className="font-medium mb-4">Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="emailNotifications" 
                className="mr-2" 
              />
              <label htmlFor="emailNotifications">Receive email notifications</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="pushNotifications" 
                className="mr-2" 
              />
              <label htmlFor="pushNotifications">Allow push notifications</label>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 