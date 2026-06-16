import React, { useState, useContext } from 'react';
import { StallContext } from '../contexts/StallContext';
import { Plus, Edit2, Trash2, X, Check, PackageOpen } from 'lucide-react';

const ProductList = ({ showToast }) => {
  const { products, addProduct, updateProduct, deleteProduct } = useContext(StallContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [qty, setQty] = useState(1);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setRate('');
    setQty(1);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setRate(product.rate);
    setQty(product.qty || 1);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || rate === '') {
      showToast('Please enter name and rate', 'error');
      return;
    }

    const rateNum = parseFloat(rate);
    const qtyNum = parseInt(qty, 10) || 1;

    if (isNaN(rateNum) || rateNum < 0) {
      showToast('Please enter a valid rate', 'error');
      return;
    }

    if (editingId) {
      updateProduct(editingId, { name, rate: rateNum, qty: qtyNum });
      showToast('Product updated!', 'success');
    } else {
      addProduct({ name, rate: rateNum, qty: qtyNum });
      showToast('Product added!', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      showToast('Product deleted!', 'success');
    }
  };

  return (
    <div className="product-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 className="section-title">Product Catalog</h1>
          <p className="section-subtitle">Manage items you sell at the stall</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} style={{ width: 'auto', padding: '10px 14px' }}>
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {products.length === 0 ? (
        <div className="card empty-state">
          <PackageOpen size={48} />
          <p>No products in your catalog yet.</p>
          <button className="btn btn-secondary" onClick={openAddModal} style={{ width: 'auto', marginTop: '10px' }}>
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-item">
              <div className="product-details">
                <div className="product-name">{product.name}</div>
                <div className="product-price">
                  Rate: ₹{product.rate} <span style={{ color: '#64748b', fontSize: '0.8rem' }}>(Default Qty: {product.qty || 1})</span>
                </div>
              </div>
              <div className="product-actions">
                <button 
                  className="action-icon-btn edit" 
                  onClick={() => openEditModal(product)}
                  title="Edit Product"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="action-icon-btn delete" 
                  onClick={() => handleDelete(product.id)}
                  title="Delete Product"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="prodName">Product Name</label>
                <input
                  type="text"
                  id="prodName"
                  className="form-input"
                  placeholder="e.g. Designer Kurti - Pink"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="prodRate">Rate (₹)</label>
                  <input
                    type="number"
                    id="prodRate"
                    className="form-input"
                    placeholder="799"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="prodQty">Default Qty</label>
                  <input
                    type="number"
                    id="prodQty"
                    className="form-input"
                    placeholder="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  <X size={16} />
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
