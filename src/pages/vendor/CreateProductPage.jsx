import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import vendorApi from '../../services/vendorApi';
import SearchableDropdown from '../../components/ui/SearchableDropdown';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    regularPrice: '',
    specialOfferPrice: '',
    stock: 0,
    brand: '',
    categories: [],
    status: 'active',
    packagingDescription: '',
    packageDocument: '',
    metaTitle: '',
    metaDescription: '',
    metaTags: '',
    searchTags: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchaseQuantity: 1,
    sku: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    estimatedDeliveryTime: '',
    expiryDate: '',
    videoLink: '',
    additionalNotes: ''
  });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [brandError, setBrandError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [creatingBrandModal, setCreatingBrandModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const tabs = [
    { id: 'basic', name: 'Basic' },
    { id: 'images', name: 'Images' },
    { id: 'pricing', name: 'Pricing & Inventory' },
    { id: 'meta', name: 'Meta & SEO' },
    { id: 'shipping', name: 'Shipping' },
    { id: 'additional', name: 'Additional' }
  ];
  const [productImages, setProductImages] = useState([]); // [{ url }]

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const [brandsRes, categoriesRes] = await Promise.all([
          vendorApi.get('/brands'),
          vendorApi.get('/categories'),
        ]);
        setBrands(brandsRes.data?.data || []);
        const cats = categoriesRes.data?.data || [];
        setCategories(cats);
        // Build a tree if API didn't already return children arrays
        const hasChildren = Array.isArray(cats) && cats.some(c => Array.isArray(c.children));
        if (hasChildren) {
          setCategoryTree(cats);
        } else {
          const byParent = new Map();
          cats.forEach(c => {
            const pid = c.parentId ? (c.parentId._id || c.parentId) : null;
            if (!byParent.has(pid)) byParent.set(pid, []);
            byParent.get(pid).push({ ...c, children: [] });
          });
          const build = (pid) => (byParent.get(pid) || []).map(node => ({
            ...node,
            children: build(node._id)
          }));
          setCategoryTree(build(null));
        }
      } catch (err) {
        console.error('Failed to load options', err);
        toast.error('Failed to load brands/categories');
      } finally {
        setLoading(false);
      }
    };
    loadOptions();
  }, []);

  const handleCreateBrand = async () => {
    if (!newBrand.trim()) {
      toast.error('Enter a brand name');
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

  const handleCreateCategory = async (nameParam, parentParam) => {
    const nameVal = (nameParam ?? newCategory ?? '').trim();
    const parentVal = parentParam ?? newCategoryParent;
    if (!nameVal) {
      toast.error('Enter a category name');
      setCategoryError('Please enter a category name');
      return false;
    }
    try {
      setCreatingCategory(true);
      const exists = categories.some((c) => c.name.toLowerCase() === nameVal.toLowerCase());
      if (exists) {
        setCategoryError('Category with this name already exists');
        return false;
      }
      setCategoryError('');
      const payload = { name: nameVal, status: 'active' };
      if (parentVal) payload.parentId = parentVal;
      const res = await vendorApi.post('/categories/vendor', payload);
      if (res.data?.success) {
        toast.success('Category created');
        setCategories((prev) => [...prev, res.data.data]);
        // Rebuild tree with the new category
        const cats = [...categories, res.data.data];
        const byParent = new Map();
        cats.forEach(c => {
          const pid = c.parentId ? (c.parentId._id || c.parentId) : null;
          if (!byParent.has(pid)) byParent.set(pid, []);
          byParent.get(pid).push({ ...c, children: [] });
        });
        const build = (pid) => (byParent.get(pid) || []).map(node => ({
          ...node,
          children: build(node._id)
        }));
        setCategoryTree(build(null));
        setForm((f) => ({ ...f, categories: [...(f.categories || []), res.data.data._id] }));
        setNewCategory('');
        setNewCategoryParent('');
        return true;
      }
      return false;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create category';
      setCategoryError(msg);
      return false;
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
        packagingDescription: form.packagingDescription,
        packageDocument: form.packageDocument || undefined,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        metaTags: form.metaTags,
        searchTags: form.searchTags,
        discountType: form.discountType,
        discountValue: form.discountValue ? Number(form.discountValue) : undefined,
        minPurchaseQuantity: form.minPurchaseQuantity ? Number(form.minPurchaseQuantity) : 1,
        sku: form.sku,
        weight: form.weight,
        dimensions: form.dimensions,
        estimatedDeliveryTime: form.estimatedDeliveryTime,
        expiryDate: form.expiryDate || undefined,
        videoLink: form.videoLink,
        additionalNotes: form.additionalNotes,
        images: productImages.map(img => img.url)
      };
      const res = await vendorApi.post('/products/vendor', payload);
      if (res.data?.success) {
        toast.success('Product created');
        navigate('/vendor/products');
      } else {
        toast.error(res.data?.message || 'Failed to create');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create');
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

  // Helpers for uploads
  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append('files', file);
    const vendorToken = localStorage.getItem('vendorToken');
    const userToken = localStorage.getItem('token');
    const bearer = vendorToken || userToken || '';
    const res = await fetch(`${import.meta.env.VITE_API_URL}/media/vendor/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bearer}` },
      body: fd
    });
    const data = await res.json();
    if (!res.ok || !data?.data?.length) throw new Error(data?.error || 'Upload failed');
    return data.data[0].url;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
          <p className="mt-1 text-sm text-gray-500">Create a new product listing</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {activeTab === 'basic' && (
            <>
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
             {/* Vendor Price only, no Regular price label */}
             <div>
               <label className="block text-sm font-medium text-gray-700">Vendor Price</label>
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
               <label className="block text-sm font-medium text-gray-700">Vendor Special Price (optional)</label>
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
              <div className="flex items-center gap-2 mt-1">
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
                <button type="button" onClick={() => { setBrandError(''); setIsBrandModalOpen(true); }} className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">New Brand</button>
              </div>
              {brandError && (
                <div className="mt-2 rounded-md bg-red-50 p-3 border border-red-200">
                  <p className="text-sm text-red-700">{brandError}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categories</label>
              <div className="space-y-3 mt-1">
                <CategoryMultiSelect
                  options={flattenCategories(categoryTree)}
                  selectedIds={form.categories}
                  onChange={(ids) => setForm((f) => ({ ...f, categories: ids }))}
                  placeholder="Select categories"
                />
                <div>
                  <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                    New Category
                  </button>
                </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Packaging Description</label>
            <textarea
              value={form.packagingDescription}
              onChange={(e) => setForm({ ...form, packagingDescription: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Package Document (Optional)</label>
            {form.packageDocument && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border mb-2">
                <span className="text-sm text-gray-700 truncate max-w-xs">{form.packageDocument}</span>
                <button type="button" className="text-red-600" onClick={() => setForm(prev => ({ ...prev, packageDocument: '' }))}>Remove</button>
              </div>
            )}
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try { const url = await uploadFile(file); setForm(prev => ({ ...prev, packageDocument: url })); }
              catch (err) { toast.error(err.message || 'Failed to upload document'); }
            }} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          </>
          )}

          {activeTab === 'images' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">Upload product images (multiple)</div>
              {productImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {productImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border">
                        <img src={img.url} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                      </div>
                      <button type="button" className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100" onClick={() => setProductImages(prev => prev.filter((_, i) => i !== idx))}>×</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed rounded text-center text-sm text-gray-500">No images uploaded</div>
              )}
              <input multiple type="file" accept="image/*" onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                try {
                  const uploads = [];
                  for (const f of files) {
                    const url = await uploadFile(f);
                    uploads.push({ url });
                  }
                  setProductImages(prev => [...prev, ...uploads]);
                } catch (err) {
                  toast.error(err.message || 'Failed to upload images');
                }
              }} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vendor Price</label>
                <input type="number" min="0" value={form.regularPrice} onChange={(e) => setForm({ ...form, regularPrice: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vendor Special Price (optional)</label>
                <input type="number" min="0" value={form.specialOfferPrice} onChange={(e) => setForm({ ...form, specialOfferPrice: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Purchase Quantity</label>
                <input type="number" min="1" value={form.minPurchaseQuantity} onChange={(e) => setForm({ ...form, minPurchaseQuantity: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
          )}

          {activeTab === 'meta' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                <input type="text" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                <input type="text" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Meta Tags</label>
                <input type="text" value={form.metaTags} onChange={(e) => setForm({ ...form, metaTags: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Search Tags</label>
                <input type="text" value={form.searchTags} onChange={(e) => setForm({ ...form, searchTags: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input type="number" min="0" step="0.01" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600">Length (cm)</label>
                  <input type="number" min="0" step="0.1" value={form.dimensions.length} onChange={(e) => setForm({ ...form, dimensions: { ...form.dimensions, length: e.target.value } })} className="mt-1 w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Width (cm)</label>
                  <input type="number" min="0" step="0.1" value={form.dimensions.width} onChange={(e) => setForm({ ...form, dimensions: { ...form.dimensions, width: e.target.value } })} className="mt-1 w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Height (cm)</label>
                  <input type="number" min="0" step="0.1" value={form.dimensions.height} onChange={(e) => setForm({ ...form, dimensions: { ...form.dimensions, height: e.target.value } })} className="mt-1 w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Estimated Delivery Time</label>
                <input type="text" value={form.estimatedDeliveryTime} onChange={(e) => setForm({ ...form, estimatedDeliveryTime: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" placeholder="e.g., 2-3 business days" />
              </div>
            </div>
          )}

          {activeTab === 'additional' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Video Link</label>
                <input type="url" value={form.videoLink} onChange={(e) => setForm({ ...form, videoLink: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Additional Info / Notes</label>
                <textarea value={form.additionalNotes} onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })} rows={4} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Link to="/vendor/products" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">Cancel</Link>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50">
              {saving ? 'Saving...' : 'Create Product'}
            </button>
          </div>
        </form>
        <NewCategoryModal
          open={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onCreate={async ({ name, parentId }) => {
            const ok = await handleCreateCategory(name, parentId);
            if (ok) setIsCategoryModalOpen(false);
          }}
          parentOptions={flattenCategories(categoryTree)}
          error={categoryError}
          setError={setCategoryError}
          creating={creatingCategory}
        />
        <NewBrandModal
          open={isBrandModalOpen}
          onClose={() => setIsBrandModalOpen(false)}
          creating={creatingBrandModal}
          error={brandError}
          setError={setBrandError}
          brandOptions={brands}
          onCreate={async (brandForm) => {
            try {
              setCreatingBrandModal(true);
              if (!brandForm.name?.trim()) { setBrandError('Please enter a brand name'); return; }
              // Client-side duplicate check
              const exists = brands.some((b) => b.name.toLowerCase() === brandForm.name.trim().toLowerCase());
              if (exists) { setBrandError('Brand with this name already exists'); return; }
              const res = await vendorApi.post('/brands/vendor', {
                name: brandForm.name.trim(),
                description: brandForm.description || '',
                picture: brandForm.picture || '',
                tags: brandForm.tags || [],
                metaTitle: brandForm.metaTitle || '',
                metaDescription: brandForm.metaDescription || '',
                keywords: brandForm.keywords || '',
                featured: !!brandForm.featured,
                status: brandForm.status || 'active'
              });
              if (res.data?.success) {
                toast.success('Brand created');
                const created = res.data.data;
                setBrands((prev) => [...prev, created]);
                setForm((f) => ({ ...f, brand: created._id }));
                setIsBrandModalOpen(false);
                setBrandError('');
              } else {
                setBrandError(res.data?.message || 'Failed to create brand');
              }
            } catch (err) {
              setBrandError(err.response?.data?.message || err.response?.data?.error || 'Failed to create brand');
            } finally {
              setCreatingBrandModal(false);
            }
          }}
        />
      </div>
    </div>
  );
};

export default CreateProductPage;

// Helpers and components
function flattenCategories(tree, prefix = '') {
  const result = [];
  tree.forEach((node) => {
    const label = `${prefix}${node.name}`;
    result.push({ _id: node._id, label });
    if (node.children && node.children.length > 0) {
      result.push(...flattenCategories(node.children, `${prefix}${'— '}`));
    }
  });
  return result;
}

// Searchable custom multi-select for categories (with chips, keyboard nav)
function CategoryMultiSelect({ options, selectedIds, onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const containerRef = React.useRef(null);

  const filtered = React.useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  React.useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const toggleId = (id) => {
    const set = new Set(selectedIds);
    if (set.has(id)) set.delete(id); else set.add(id);
    onChange(Array.from(set));
  };

  const removeId = (id) => {
    onChange(selectedIds.filter((x) => x !== id));
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="min-h-[42px] w-full border border-gray-300 rounded-md flex items-center flex-wrap gap-1 px-2 py-1 cursor-text focus-within:ring-2 focus-within:ring-primary-500"
        onClick={() => setOpen(true)}
      >
        {selectedIds.length === 0 && (
          <span className="text-sm text-gray-400">{placeholder}</span>
        )}
        {selectedIds.map((id) => {
          const opt = options.find((o) => o._id === id);
          if (!opt) return null;
          return (
            <span key={id} className="inline-flex items-center bg-primary-50 text-primary-700 border border-primary-200 rounded px-2 py-0.5 text-xs">
              {opt.label}
              <button type="button" className="ml-1 text-primary-700 hover:text-primary-900" onClick={(e) => { e.stopPropagation(); removeId(id); }}>×</button>
            </span>
          );
        })}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[120px] outline-none text-sm px-1 py-1"
          placeholder={selectedIds.length ? '' : placeholder}
        />
      </div>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No results</div>
          ) : (
            filtered.map((opt) => {
              const active = selectedIds.includes(opt._id);
              return (
                <button
                  key={opt._id}
                  type="button"
                  onClick={() => toggleId(opt._id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${active ? 'bg-primary-50 text-primary-700' : 'text-gray-900'}`}
                >
                  {opt.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// Modal for creating a brand (parity with admin BrandModal fields)
function NewBrandModal({ open, onClose, onCreate, error, setError, creating, brandOptions = [] }) {
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    picture: '',
    tags: [],
    tagInput: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    featured: false,
    status: 'active'
  });

  React.useEffect(() => {
    if (open) {
      setForm({ name: '', description: '', picture: '', tags: [], tagInput: '', metaTitle: '', metaDescription: '', keywords: '', featured: false, status: 'active' });
      setError && setError('');
    }
  }, [open, setError]);

  const brandSuggestions = React.useMemo(() => {
    const q = (form.name || '').trim().toLowerCase();
    if (!q) return [];
    return (brandOptions || [])
      .filter((b) => b?.name && b.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [form.name, brandOptions]);

  if (!open) return null;

  const uploadDirect = async (file) => {
    const fd = new FormData();
    fd.append('files', file);
    const vendorToken = localStorage.getItem('vendorToken');
    const userToken = localStorage.getItem('token');
    const bearer = vendorToken || userToken || '';
    const res = await fetch(`${import.meta.env.VITE_API_URL}/media/vendor/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bearer}` },
      body: fd
    });
    const data = await res.json();
    if (!res.ok || !data?.data?.length) throw new Error(data?.error || 'Upload failed');
    return data.data[0].url;
  };

  const addTag = () => {
    const val = form.tagInput.trim();
    if (!val) return;
    if (form.tags.includes(val)) return;
    setForm((f) => ({ ...f, tags: [...f.tags, val], tagInput: '' }));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-xl font-bold">Add New Brand</h3>
          <button type="button" className="text-gray-500 hover:text-gray-700" onClick={onClose}>×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); if (error) setError(''); }}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {form.name?.trim() && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-auto">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b">Similar existing brands</div>
                  {brandSuggestions.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">No close matches</div>
                  ) : (
                    brandSuggestions.map((b) => (
                      <button
                        key={b._id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={() => setForm((f) => ({ ...f, name: b.name }))}
                      >
                        {b.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Brand Image</label>
              <div className="space-y-2">
                {form.picture && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <img src={form.picture} alt="Brand preview" className="w-full h-full object-cover" />
                    <button type="button" className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white" onClick={() => setForm((f) => ({ ...f, picture: '' }))}>×</button>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try { const url = await uploadDirect(file); setForm((f) => ({ ...f, picture: url })); }
                  catch (err) { setError && setError(err.message || 'Failed to upload image'); }
                }} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {tag}
                    <button type="button" className="ml-1 text-gray-600 hover:text-gray-800" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}>×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={form.tagInput} onChange={(e) => setForm((f) => ({ ...f, tagInput: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Enter a tag and press Enter" className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <button type="button" onClick={addTag} className="px-3 py-2 bg-primary-600 text-white rounded-md">Add</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Title</label>
              <input type="text" value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Keywords</label>
              <input type="text" value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} placeholder="SEO keywords" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <textarea value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} rows={2} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            {/* Featured toggle removed for vendor modal */}
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">Cancel</button>
          <button type="button" disabled={creating} onClick={() => onCreate(form)} className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50">{creating ? 'Creating...' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}
// Modal for creating a category with live suggestions
function NewCategoryModal({ open, onClose, onCreate, parentOptions, error, setError, creating }) {
  const [form, setForm] = React.useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    status: 'active',
    image: '',
    tags: '',
    keywords: '',
    metaTitle: '',
    metaDescription: ''
  });
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setForm({
        name: '', slug: '', description: '', parentId: '', status: 'active',
        image: '', tags: '', keywords: '', metaTitle: '', metaDescription: ''
      });
      setQuery('');
      setError && setError('');
    }
  }, [open, setError]);

  const suggestions = React.useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return parentOptions.filter((opt) => opt.label.toLowerCase().includes(q)).slice(0, 6);
  }, [query, parentOptions]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold">Create Category</h3>
          <button type="button" className="text-gray-500 hover:text-gray-700" onClick={onClose}>×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
                  setForm((f) => ({ ...f, name, slug }));
                  setQuery(name);
                  if (error) setError('');
                }}
                placeholder="e.g., Surgical Instruments"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {query && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-auto">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b">Similar existing categories</div>
                  {suggestions.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">No close matches</div>
                  ) : (
                    suggestions.map((s) => (
                      <div key={s._id} className="px-3 py-2 text-sm text-gray-700">
                        {s.label}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent category (optional)</label>
              <SearchableDropdown
                label={null}
                options={[{ value: '', label: 'No parent (top level)' }, ...parentOptions.map((o) => ({ value: o._id, label: o.label }))]}
                value={form.parentId}
                onChange={(value) => setForm((f) => ({ ...f, parentId: value }))}
                placeholder="Select parent category..."
                emptyMessage="No categories available"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Category Image</label>
              <div className="space-y-2">
                {form.image && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <img src={form.image} alt="Category preview" className="w-full h-full object-cover" />
                    <button type="button" className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white" onClick={() => setForm((f) => ({ ...f, image: '' }))}>×</button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const formData = new FormData();
                      formData.append('files', file);
                      // Prefer vendor token if present; fallback to user token
                      const vendorToken = localStorage.getItem('vendorToken');
                      const userToken = localStorage.getItem('token');
                      const bearer = vendorToken || userToken || '';
                      const res = await fetch(`${import.meta.env.VITE_API_URL}/media/vendor/upload`, {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${bearer}`
                        },
                        body: formData
                      });
                      const data = await res.json();
                      if (res.ok && data?.data?.length) {
                        const url = data.data[0].url;
                        setForm((f) => ({ ...f, image: url }));
                      } else {
                        setError && setError(data?.error || 'Failed to upload image');
                      }
                    } catch (err) {
                      setError && setError('Failed to upload image');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="Enter tags separated by commas"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">Separate tags with commas (e.g., medical, dental, equipment)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Keywords</label>
              <input
                type="text"
                value={form.keywords}
                onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                placeholder="SEO keywords"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Title</label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                placeholder="SEO meta title"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                placeholder="SEO meta description"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
            </div>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">Cancel</button>
          <button
            type="button"
            disabled={creating}
            onClick={() => onCreate({
              name: form.name,
              parentId: form.parentId,
              // Below fields are ignored by current vendor route but kept for parity and future use
              slug: form.slug,
              description: form.description,
              status: form.status,
              image: form.image,
              tags: form.tags,
              keywords: form.keywords,
              metaTitle: form.metaTitle,
              metaDescription: form.metaDescription
            })}
            className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
