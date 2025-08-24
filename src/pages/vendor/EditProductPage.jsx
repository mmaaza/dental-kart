import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import vendorApi from '../../services/vendorApi';

const EditVendorProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: '',
    description: '',
    regularPrice: '',
    specialOfferPrice: '',
    stock: 0,
    brand: '',
    categories: [],
    status: 'active'
  });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [brandError, setBrandError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [brandsRes, categoriesRes, productRes] = await Promise.all([
          vendorApi.get('/brands'),
          vendorApi.get('/categories'),
          vendorApi.get(`/products/vendor/${id}`),
        ]);
        setBrands(brandsRes.data?.data || []);
        setCategories(categoriesRes.data?.data || []);
        const p = productRes.data?.data;
        if (p) {
          setForm({
            name: p.name || '',
            description: p.description || '',
            regularPrice: p.regularPrice || '',
            specialOfferPrice: p.specialOfferPrice || '',
            stock: p.stock || 0,
            brand: p.brand?._id || p.brand || '',
            categories: (p.categories || []).map((c) => c._id || c),
            status: p.status || 'active',
          });
        }
      } catch (err) {
        console.error('Failed to load edit data', err);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleCreateBrand = async () => {
    if (!newBrand.trim()) {
      setBrandError('Please enter a brand name');
      return;
    }
    try {
      setCreatingBrand(true);
      const exists = brands.some((b) => b.name.toLowerCase() === newBrand.trim().toLowerCase());
      if (exists) {
        setBrandError('Brand with this name already exists');
        return;
      }
      setBrandError('');
      const res = await vendorApi.post('/brands/vendor', { name: newBrand.trim() });
      if (res.data?.success) {
        toast.success('Brand created');
        setBrands((prev) => [...prev, res.data.data]);
        setForm((f) => ({ ...f, brand: res.data.data._id }));
        setNewBrand('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create brand';
      setBrandError(msg);
    } finally {
      setCreatingBrand(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) {
      setCategoryError('Please enter a category name');
      return;
    }
    try {
      setCreatingCategory(true);
      const exists = categories.some((c) => c.name.toLowerCase() === newCategory.trim().toLowerCase());
      if (exists) {
        setCategoryError('Category with this name already exists');
        return;
      }
      setCategoryError('');
      const res = await vendorApi.post('/categories/vendor', { name: newCategory.trim(), status: 'active' });
      if (res.data?.success) {
        toast.success('Category created');
        setCategories((prev) => [...prev, res.data.data]);
        setForm((f) => ({ ...f, categories: [...(f.categories || []), res.data.data._id] }));
        setNewCategory('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create category';
      setCategoryError(msg);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: form.name,
        description: form.description,
        regularPrice: Number(form.regularPrice),
        specialOfferPrice: form.specialOfferPrice ? Number(form.specialOfferPrice) : undefined,
        stock: Number(form.stock),
        brand: form.brand,
        categories: form.categories,
        status: form.status,
      };
      const res = await vendorApi.put(`/products/${id}`, payload);
      if (res.data?.success) {
        toast.success('Product updated');
        navigate('/vendor/products');
      } else {
        toast.error(res.data?.message || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="mt-1 text-sm text-gray-500">Update your product details</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Regular Price</label>
              <input
                type="number"
                min="0"
                value={form.regularPrice}
                onChange={(e) => setForm({ ...form, regularPrice: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Special Price (optional)</label>
              <input
                type="number"
                min="0"
                value={form.specialOfferPrice}
                onChange={(e) => setForm({ ...form, specialOfferPrice: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <div className="flex space-x-2 mt-1">
                <select
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="New brand"
                  value={newBrand}
                  onChange={(e) => { setNewBrand(e.target.value); if (brandError) setBrandError(''); }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button type="button" onClick={handleCreateBrand} disabled={creatingBrand} className="px-3 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50">{creatingBrand ? 'Adding...' : 'Add'}</button>
              </div>
              {brandError && (
                <div className="mt-2 rounded-md bg-red-50 p-3 border border-red-200">
                  <p className="text-sm text-red-700">{brandError}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categories</label>
              <div className="space-y-2 mt-1">
                <select
                  multiple
                  value={form.categories}
                  onChange={(e) => setForm({ ...form, categories: Array.from(e.target.selectedOptions, (o) => o.value) })}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="New category"
                    value={newCategory}
                    onChange={(e) => { setNewCategory(e.target.value); if (categoryError) setCategoryError(''); }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button type="button" onClick={handleCreateCategory} disabled={creatingCategory} className="px-3 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50">{creatingCategory ? 'Adding...' : 'Add'}</button>
                </div>
                {categoryError && (
                  <div className="mt-2 rounded-md bg-red-50 p-3 border border-red-200">
                    <p className="text-sm text-red-700">{categoryError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={5}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link to="/vendor/products" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">Cancel</Link>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50">
              {saving ? 'Saving...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVendorProductPage;
