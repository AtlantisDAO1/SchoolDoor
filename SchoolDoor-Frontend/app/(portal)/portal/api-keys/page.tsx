"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Activity,
} from "lucide-react";
import {
  getAPIKeys,
  createAPIKey,
  updateAPIKey,
  activateAPIKey,
  deactivateAPIKey,
  deleteAPIKey,
  getAPIKeyStats,
  getAPIKeyUsage,
  getAPIKeyOverallStats,
  type APIKey,
  type APIKeyCreate,
  type APIKeyUpdate,
  type APIKeyStats,
  type APIKeyUsage,
  type APIKeyOverallStats,
} from "@/lib/admin-api-client";

const APIKeysPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [stats, setStats] = useState<APIKeyStats | null>(null);
  const [usage, setUsage] = useState<APIKeyUsage[]>([]);
  const [overallStats, setOverallStats] =
    useState<APIKeyOverallStats | null>(null);

  const [createForm, setCreateForm] = useState<APIKeyCreate>({
    name: "",
    description: "",
    expires_days: 365,
  });
  const [editForm, setEditForm] = useState<APIKeyUpdate>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [keysData, statsData] = await Promise.all([
        getAPIKeys(),
        getAPIKeyOverallStats(),
      ]);
      setApiKeys(keysData);
      setOverallStats(statsData);
    } catch (error) {
      console.error("Error loading API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createAPIKey(createForm);
      setNewApiKey(response.api_key);
      alert(
        `API Key created successfully!\n\nKey: ${response.api_key}\n\n${response.message}`,
      );
      setShowCreateModal(false);
      setCreateForm({ name: "", description: "", expires_days: 365 });
      setNewApiKey(null);
      loadData();
    } catch (error) {
      console.error("Error creating API key:", error);
      alert("Error creating API key");
    }
  };

  const handleUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey) return;

    try {
      await updateAPIKey(selectedKey.id, editForm);
      setShowEditModal(false);
      setEditForm({});
      loadData();
    } catch (error) {
      console.error("Error updating API key:", error);
      alert("Error updating API key");
    }
  };

  const handleToggleActive = async (key: APIKey) => {
    try {
      if (key.is_active) {
        await deactivateAPIKey(key.id);
      } else {
        await activateAPIKey(key.id);
      }
      loadData();
    } catch (error) {
      console.error("Error toggling API key:", error);
      alert("Error updating API key");
    }
  };

  const handleDeleteKey = async (key: APIKey) => {
    if (
      !confirm(`Are you sure you want to delete API key "${key.name}"?`)
    ) {
      return;
    }

    try {
      await deleteAPIKey(key.id);
      loadData();
    } catch (error) {
      console.error("Error deleting API key:", error);
      alert("Error deleting API key");
    }
  };

  const handleViewStats = async (key: APIKey) => {
    try {
      const [statsData, usageData] = await Promise.all([
        getAPIKeyStats(key.id),
        getAPIKeyUsage(key.id, 20),
      ]);
      setSelectedKey(key);
      setStats(statsData);
      setUsage(usageData);
      setShowStatsModal(true);
    } catch (error) {
      console.error("Error loading stats:", error);
      alert("Error loading statistics");
    }
  };

  const handleViewUsage = async (key: APIKey) => {
    try {
      const usageData = await getAPIKeyUsage(key.id, 100);
      setSelectedKey(key);
      setUsage(usageData);
      setShowUsageModal(true);
    } catch (error) {
      console.error("Error loading usage:", error);
      alert("Error loading usage data");
    }
  };

  const handleEditClick = (key: APIKey) => {
    setSelectedKey(key);
    setEditForm({
      name: key.name,
      description: key.description || "",
      is_active: key.is_active,
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return "Never";
    const date = new Date(expiresAt);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires today";
    if (diffDays === 1) return "Expires tomorrow";
    return `Expires in ${diffDays} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys Management</h1>
          <p className="text-gray-600">Manage API keys for external integrations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create API Key
        </button>
      </div>

      {/* Overall Stats */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Keys</div>
            <div className="text-2xl font-bold text-gray-900">
              {overallStats.total_keys}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Active Keys</div>
            <div className="text-2xl font-bold text-green-600">
              {overallStats.active_keys}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Requests</div>
            <div className="text-2xl font-bold text-blue-600">
              {overallStats.total_requests}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-2xl font-bold text-green-600">
              {overallStats.total_requests > 0
                ? Math.round(
                    (overallStats.successful_requests /
                      overallStats.total_requests) *
                      100,
                  )
                : 0}
              %
            </div>
          </div>
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {key.name}
                    </div>
                    <div className="text-sm text-gray-500">ID: {key.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {key.description || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        key.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {key.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {key.usage_count} requests
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatExpiry(key.expires_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {key.last_used_at ? formatDate(key.last_used_at) : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewStats(key)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Statistics"
                    >
                      <Activity className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleViewUsage(key)}
                      className="text-green-600 hover:text-green-900"
                      title="View Usage History"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditClick(key)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(key)}
                      className={
                        key.is_active
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                      }
                      title={key.is_active ? "Deactivate" : "Activate"}
                    >
                      {key.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create New API Key
            </h3>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expires in (days)
                </label>
                <input
                  type="number"
                  value={createForm.expires_days}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      expires_days: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="3650"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit API Key
            </h3>
            <form onSubmit={handleUpdateKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editForm.is_active || false}
                  onChange={(e) =>
                    setEditForm({ ...editForm, is_active: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && selectedKey && stats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Statistics for {selectedKey.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Requests</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.total_requests}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Successful</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.successful_requests}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Failed</div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.failed_requests}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Unique Endpoints</div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.unique_endpoints}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Usage by Endpoint
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Endpoint
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Method
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Count
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Success Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.usage_by_endpoint &&
                      Array.isArray(stats.usage_by_endpoint) ? (
                        stats.usage_by_endpoint.map((endpoint, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {endpoint.endpoint}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {endpoint.method}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {endpoint.count}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {endpoint.success_rate}%
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-2 text-sm text-gray-500 text-center"
                          >
                            No endpoint usage data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowStatsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Modal */}
      {showUsageModal && selectedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Usage History for {selectedKey.name}
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Timestamp
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Endpoint
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Method
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usage.map((usageItem) => (
                    <tr key={usageItem.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatDate(usageItem.created_at)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {usageItem.endpoint}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {usageItem.method}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            usageItem.response_status &&
                            usageItem.response_status < 400
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {usageItem.response_status || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {usageItem.ip_address || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowUsageModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIKeysPage;
