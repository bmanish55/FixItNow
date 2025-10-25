import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import toast from 'react-hot-toast';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    service: null
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminServices();
      setServices(response.data);
    } catch (error) {
      toast.error('Failed to fetch services');
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    if (filter === 'all') return true;
    if (filter === 'active') return service.isActive;
    return !service.isActive;
  });

  const openDeleteModal = (service) => {
    setDeleteModal({
      isOpen: true,
      service
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      service: null
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      const service = deleteModal.service;
      
      await apiService.deleteAdminService(service.id);
      
      toast.success('Service deleted successfully');
      setServices(services.filter(s => s.id !== service.id));
      closeDeleteModal();
    } catch (error) {
      toast.error('Failed to delete service');
      console.error('Error deleting service:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      'Plumbing': 'bg-blue-100 text-blue-800',
      'Electrician': 'bg-yellow-100 text-yellow-800',
      'Carpentry': 'bg-amber-100 text-amber-800',
      'Cleaning': 'bg-green-100 text-green-800',
      'Painting': 'bg-pink-100 text-pink-800',
      'AC Repair': 'bg-cyan-100 text-cyan-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔧 Service Management</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all services on the platform</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'active', 'inactive'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
              }`}
            >
              {status === 'all' ? 'All Services' : status === 'active' ? 'Active' : 'Inactive'}
              <span className="ml-2 text-sm">
                ({status === 'all' 
                  ? services.length 
                  : status === 'active' 
                  ? services.filter(s => s.isActive).length 
                  : services.filter(s => !s.isActive).length})
              </span>
            </button>
          ))}
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredServices.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No services found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Service</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Provider</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredServices.map(service => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{service.title}</p>
                          <p className="text-sm text-gray-500">{service.subcategory}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{service.provider?.name}</p>
                          <p className="text-sm text-gray-500">{service.provider?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getCategoryBadgeColor(service.category)}`}>
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ₹{Number(service.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {service.isActive ? (
                          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                            ✓ Active
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                            ✗ Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(service.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openDeleteModal(service)}
                          className="px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Services</p>
            <p className="text-2xl font-bold text-gray-900">{services.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Active Services</p>
            <p className="text-2xl font-bold text-green-600">{services.filter(s => s.isActive).length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Revenue (Listed)</p>
            <p className="text-2xl font-bold text-blue-600">
              ₹{services.reduce((sum, s) => sum + (Number(s.price) || 0), 0).toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        type="service"
        itemName={deleteModal.service?.title}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
        isLoading={deleting}
      />
    </div>
  );
};

export default AdminServices;
