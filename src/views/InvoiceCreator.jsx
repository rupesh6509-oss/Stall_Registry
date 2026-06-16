import React, { useState, useContext, useRef, useEffect } from 'react';
import { StallContext } from '../contexts/StallContext';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { Plus, Trash2, Send, FileText, CheckCircle, Search } from 'lucide-react';

const InvoiceCreator = ({ showToast }) => {
  const { currentStall, products, addInvoice } = useContext(StallContext);
  const [customerMobile, setCustomerMobile] = useState('');
  const [items, setItems] = useState([{ name: '', rate: 0, qty: 1 }]);
  const [showSuggestions, setShowSuggestions] = useState({});
  const [searchTerm, setSearchTerm] = useState({});
  const dropdownRef = useRef({});

  // Clean suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      let clickedInside = false;
      Object.keys(dropdownRef.current).forEach((key) => {
        if (dropdownRef.current[key] && dropdownRef.current[key].contains(event.target)) {
          clickedInside = true;
        }
      });
      if (!clickedInside) {
        setShowSuggestions({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddItem = () => {
    setItems([...items, { name: '', rate: 0, qty: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      showToast('Invoice must have at least one item', 'error');
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'qty') {
      newItems[index][field] = parseInt(value, 10) || 0;
    } else if (field === 'rate') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const selectSuggestion = (index, product) => {
    const newItems = [...items];
    newItems[index].name = product.name;
    newItems[index].rate = product.rate;
    newItems[index].qty = product.qty || 1;
    setItems(newItems);
    
    // Hide suggestions
    setShowSuggestions({ ...showSuggestions, [index]: false });
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.rate * item.qty), 0);
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();

    // Validations
    if (!customerMobile.trim()) {
      showToast("Please enter customer's mobile number to send invoice", 'error');
      return;
    }

    if (customerMobile.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid mobile number', 'error');
      return;
    }

    const invalidItem = items.find(item => !item.name.trim() || item.rate <= 0 || item.qty <= 0);
    if (invalidItem) {
      showToast('Please verify all items have valid name, rate, and quantity', 'error');
      return;
    }

    const total = calculateSubtotal();
    
    // Save invoice
    const newInvoice = await addInvoice({
      customerMobile,
      items,
      total
    });

    if (newInvoice) {
      // 1. Generate & download PDF
      const pdfOk = generateInvoicePDF(newInvoice, currentStall, showToast);

      if (pdfOk) {
        showToast('Invoice generated and downloaded!', 'success');


        // 2. Format WhatsApp Redirection
        const stallName = currentStall.stallName || 'our stall';
        let waMessage = `Hello, here is your invoice summary from *${stallName}*! 🧾✨\n\n`;
        waMessage += `*Invoice No:* ${newInvoice.invoiceNumber}\n`;
        waMessage += `*Date:* ${new Date(newInvoice.date).toLocaleDateString()}\n\n`;
        
        waMessage += `*Items:* \n`;
        newInvoice.items.forEach((item, index) => {
          waMessage += `${index + 1}. ${item.name} - ${item.qty} x ₹${item.rate} = *₹${item.qty * item.rate}*\n`;
        });
        
        waMessage += `\n*Grand Total: ₹${newInvoice.total}*\n\n`;
        waMessage += `We have downloaded your invoice PDF to your device. Please attach and share it here. Thank you for shopping with us! 🙏`;

        // Clean & format number
        let cleanedNum = customerMobile.replace(/\D/g, '');
        if (cleanedNum.length === 10) {
          cleanedNum = `91${cleanedNum}`;
        }

        const whatsappUrl = `https://wa.me/${cleanedNum}?text=${encodeURIComponent(waMessage)}`;
        
        // Redirect to WhatsApp
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
        }, 1000);

        // Reset form
        setCustomerMobile('');
        setItems([{ name: '', rate: 0, qty: 1 }]);
      }
    }
  };

  const getSuggestions = (value) => {
    if (!value || typeof value !== 'string') return [];
    const query = value.toLowerCase().trim();
    return products.filter(p => p.name.toLowerCase().includes(query));
  };

  return (
    <div className="invoice-creator">
      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <h1 className="section-title">Prepare Invoice</h1>
        <p className="section-subtitle">Select products, set pricing, download PDF, and send</p>
      </div>

      <div className="card">
        <form onSubmit={handleGenerateInvoice}>
          {/* Customer Details */}
          <div className="invoice-customer-box">
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>CUSTOMER NAME</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
              Stall Customers
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="custMob" style={{ color: '#94a3b8' }}>Customer Mobile (For WhatsApp)</label>
              <input
                type="tel"
                id="custMob"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Line Items */}
          <div style={{ textAlign: 'left', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8' }}>
            INVOICE ITEMS
          </div>

          <div className="invoice-items-container">
            {items.map((item, index) => {
              const suggestions = getSuggestions(item.name);
              
              return (
                <div key={index} className="invoice-item-row">
                  {/* Product Search & Autocomplete */}
                  <div className="form-group product-select-wrapper" ref={el => dropdownRef.current[index] = el}>
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search or enter product..."
                      value={item.name}
                      onChange={(e) => {
                        handleItemChange(index, 'name', e.target.value);
                        setShowSuggestions({ ...showSuggestions, [index]: true });
                      }}
                      onFocus={() => {
                        setShowSuggestions({ ...showSuggestions, [index]: true });
                      }}
                      required
                    />

                    {/* Suggestions list */}
                    {showSuggestions[index] && suggestions.length > 0 && (
                      <div className="suggestions-dropdown">
                        {suggestions.map((p) => (
                          <div 
                            key={p.id} 
                            className="suggestion-item"
                            onClick={() => selectSuggestion(index, p)}
                          >
                            <span>{p.name}</span>
                            <span className="suggestion-item-price">₹{p.rate}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="form-group qty-group">
                    <label className="form-label">Qty</label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      required
                    />
                  </div>

                  {/* Rate */}
                  <div className="form-group rate-group">
                    <label className="form-label">Rate (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      step="0.01"
                      value={item.rate || ''}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                      required
                    />
                  </div>

                  {/* Delete Row Button */}
                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => handleRemoveItem(index)}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Item Button */}
          <button type="button" className="add-item-trigger" onClick={handleAddItem}>
            <Plus size={16} />
            Add Another Item
          </button>

          {/* Summary Box */}
          <div className="invoice-summary-card">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>₹{calculateSubtotal().toFixed(2)}</span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>
            <FileText size={18} />
            Generate Invoice & Send PDF
          </button>
        </form>
      </div>
    </div>
  );
};

export default InvoiceCreator;
