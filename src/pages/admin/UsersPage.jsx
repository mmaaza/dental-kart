import React, { useState } from 'react';

// Permission management modal component
const PermissionModal = ({ isOpen, onClose, user }) => {
  const [permissions, setPermissions] = useState({
    dashboard: user?.permissions?.dashboard || false,
    users: user?.permissions?.users || false,
    products: user?.permissions?.products || false,
    orders: user?.permissions?.orders || false,
    content: user?.permissions?.content || false,
    settings: user?.permissions?.settings || false,
  });

  if (!isOpen) return null;

  const permissionsList = [
    { id: 'dashboard', label: 'Dashboard Access', description: 'View and interact with the admin dashboard' },
    { id: 'users', label: 'User Management', description: 'Create, edit, and delete user accounts' },
    { id: 'products', label: 'Product Management', description: 'Manage product catalog and inventory' },
    { id: 'orders', label: 'Order Management', description: 'View and process customer orders' },
    { id: 'content', label: 'Content Management', description: 'Manage blog posts and media content' },
    { id: 'settings', label: 'System Settings', description: 'Configure system-wide settings' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-admin-slate-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="relative bg-white dark:bg-admin-slate-800 rounded-lg max-w-2xl w-full p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Manage Permissions - {user.name}</h3>
            <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">Configure access permissions for this user</p>
          </div>

          <div className="space-y-4">
            {permissionsList.map((permission) => (
              <div key={permission.id} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={permission.id}
                    type="checkbox"
                    checked={permissions[permission.id]}
                    onChange={(e) => setPermissions(prev => ({
                      ...prev,
                      [permission.id]: e.target.checked
                    }))}
                    className="h-4 w-4 rounded border-admin-slate-300 dark:border-admin-slate-600 text-admin-ucla-600 focus:ring-admin-ucla-500"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor={permission.id} className="font-medium text-admin-slate-700 dark:text-admin-slate-200">
                    {permission.label}
                  </label>
                  <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400">{permission.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-admin-slate-300 dark:border-admin-slate-600 rounded-lg text-sm font-medium text-admin-slate-700 dark:text-admin-slate-200 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Save permissions logic here
                onClose();
              }}
              className="px-4 py-2 bg-admin-ucla-500 hover:bg-admin-ucla-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced UserRow component with permission indicators
const UserRow = ({ user, onManagePermissions, isSelected, onSelect }) => {
  const permissionCount = Object.values(user.permissions || {}).filter(Boolean).length;
  
  return (
    <tr className="hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(user.id, e.target.checked)}
          className="h-4 w-4 rounded border-admin-slate-300 dark:border-admin-slate-600 text-admin-ucla-600 focus:ring-admin-ucla-500"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-admin-ucla-100 dark:bg-admin-ucla-500/10 flex items-center justify-center">
              <span className="text-admin-ucla-600 dark:text-admin-ucla-400 font-medium text-sm">
                {user.name.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">{user.name}</div>
            <div className="text-sm text-admin-slate-500 dark:text-admin-slate-400">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.role === 'super_admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' :
          user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
          user.role === 'editor' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
          'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
        }`}>
          {user.role.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-admin-slate-100 dark:bg-admin-slate-700/50 text-admin-slate-800 dark:text-admin-slate-300'
        }`}>
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            permissionCount > 4 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
            permissionCount > 2 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
          }`}>
            {permissionCount} Permissions
          </span>
          <button 
            onClick={() => onManagePermissions(user)}
            className="text-admin-ucla-600 hover:text-admin-ucla-700 dark:text-admin-ucla-400 dark:hover:text-admin-ucla-300 text-sm font-medium"
          >
            Manage
          </button>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-3 justify-end">
          <button className="text-admin-ucla-600 hover:text-admin-ucla-700 dark:text-admin-ucla-400 dark:hover:text-admin-ucla-300">Edit</button>
          <button 
            onClick={() => onManagePermissions(user)}
            className="text-admin-ucla-600 hover:text-admin-ucla-700 dark:text-admin-ucla-400 dark:hover:text-admin-ucla-300"
          >
            Permissions
          </button>
          {user.role !== 'super_admin' && (
            <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">Delete</button>
          )}
        </div>
      </td>
    </tr>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      lastActive: '2h ago',
      permissions: {
        dashboard: true,
        users: true,
        products: true,
        orders: true,
        content: false,
        settings: false,
      },
    },
    // Add more mock users as needed
  ]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleManagePermissions = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleBulkAction = (action) => {
    // Implement bulk actions logic here
    console.log(`Bulk action ${action} for users:`, selectedUsers);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">
            User Management
          </h1>
          <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
            Manage and monitor user accounts
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 bg-admin-ucla-500 hover:bg-admin-ucla-600 text-white rounded-lg text-sm font-medium transition-colors duration-200">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New User
        </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-white dark:bg-admin-slate-800 border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-admin-slate-700 dark:text-admin-slate-300">
              {selectedUsers.length} users selected
            </span>
            <div className="space-x-3">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-4 py-2 text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-4 py-2 text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-admin-slate-800 p-4 sm:p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-56">
            <label htmlFor="role-select" className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
              Filter by Role
            </label>
            <div className="relative">
              <select
                id="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full appearance-none rounded-lg border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-4 pr-10 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="moderator">Moderator</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="search-users" className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
              Search Users
            </label>
            <div className="relative">
              <input
                id="search-users"
                type="text"
                placeholder="Search by name, email, or role..."
                className="w-full rounded-lg border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-10 pr-4 text-sm text-admin-slate-900 dark:text-admin-slate-100 placeholder-admin-slate-500 dark:placeholder-admin-slate-400 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
            <thead className="bg-admin-slate-50 dark:bg-admin-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="h-4 w-4 rounded border-admin-slate-300 dark:border-admin-slate-600 text-admin-ucla-600 focus:ring-admin-ucla-500"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Permissions
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-admin-slate-800 divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
              {users.map((user) => (
                <UserRow 
                  key={user.id} 
                  user={user}
                  isSelected={selectedUsers.includes(user.id)}
                  onSelect={(id, checked) => {
                    if (checked) {
                      setSelectedUsers(prev => [...prev, id]);
                    } else {
                      setSelectedUsers(prev => prev.filter(userId => userId !== id));
                    }
                  }}
                  onManagePermissions={handleManagePermissions}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Management Modal */}
      <PermissionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersPage;