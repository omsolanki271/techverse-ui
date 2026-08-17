import React from 'react';
import MyMedia from '../dashboard/MyMedia';

// Admin uses the same media view but AuthContext handles the permissions
// We just wrap it to keep the admin layout routing consistent.
const AdminMedia = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-techverse-green">Global Media Library</h1>
        <p className="text-techverse-green/70">View and manage all uploaded images.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-techverse-green/10 p-6">
        <MyMedia />
      </div>
    </div>
  );
};

export default AdminMedia;
