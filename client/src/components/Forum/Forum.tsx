import React from 'react';

const Forum: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Community Forum</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Discussions</h2>
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            New Topic
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Mock forum topics */}
          <div className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">How to improve communication with your partner</h3>
                <p className="text-gray-600 text-sm mt-1">
                  I've been struggling with communication lately. Any tips?
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <div>15 replies</div>
                <div>2 days ago</div>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Communication</span>
              <span className="text-gray-500 ml-2">Started by JaneDoe</span>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">Date night ideas for long-term couples</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Looking for some fresh ideas to keep things interesting!
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <div>32 replies</div>
                <div>1 week ago</div>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Activities</span>
              <span className="text-gray-500 ml-2">Started by RelationshipGuru</span>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">Overcoming conflict resolution challenges</h3>
                <p className="text-gray-600 text-sm mt-1">
                  How do you handle disagreements in a healthy way?
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <div>8 replies</div>
                <div>3 days ago</div>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Conflict</span>
              <span className="text-gray-500 ml-2">Started by NewCouple</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <button className="text-purple-600 hover:text-purple-800 font-medium">
            Load More Topics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Forum; 