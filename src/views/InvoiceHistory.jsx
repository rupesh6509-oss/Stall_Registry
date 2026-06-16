import React, { useContext } from 'react';
import { StallContext } from '../contexts/StallContext';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { FileText, Download, Send, ShoppingBag } from 'lucide-react';

const InvoiceHistory = ({ showToast }) => {
  const { currentStall, invoices } = useContext(StallContext);

  const handleDownload = (invoice) => {
    generateInvoicePDF(invoice, currentStall, showToast);
    showToast('Invoice PDF downloaded!', 'success');
  };

  const handleResend = (invoice) => {
    const stallName = currentStall.stallName || 'our stall';
    let waMessage = `Hello, here is your invoice summary from *${stallName}*! 🧾✨\n\n`;
    waMessage += `*Invoice No:* ${invoice.invoiceNumber}\n`;
    waMessage += `*Date:* ${new Date(invoice.date).toLocaleDateString()}\n\n`;
    
    waMessage += `*Items:* \n`;
    invoice.items.forEach((item, index) => {
      waMessage += `${index + 1}. ${item.name} - ${item.qty} x ₹${item.rate} = *₹${item.qty * item.rate}*\n`;
    });
    
    waMessage += `\n*Grand Total: ₹${invoice.total}*\n\n`;
    waMessage += `We have downloaded your invoice PDF to your device. Please attach and share it here. Thank you for shopping with us! 🙏`;

    // Format mobile
    let cleanedNum = invoice.customerMobile.replace(/\D/g, '');
    if (cleanedNum.length === 10) {
      cleanedNum = `91${cleanedNum}`;
    }

    const whatsappUrl = `https://wa.me/${cleanedNum}?text=${encodeURIComponent(waMessage)}`;
    window.open(whatsappUrl, '_blank');
    showToast('Redirecting to WhatsApp...', 'success');
  };

  return (
    <div className="invoice-history">
      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <h1 className="section-title">Invoice History</h1>
        <p className="section-subtitle">View and manage all past customer receipts</p>
      </div>

      {invoices.length === 0 ? (
        <div className="card empty-state">
          <FileText size={48} />
          <p>No invoices created yet.</p>
        </div>
      ) : (
        <div className="history-list">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="history-card">
              <div className="history-card-header">
                <span className="history-invoice-num">{invoice.invoiceNumber}</span>
                <span className="history-invoice-date">
                  {new Date(invoice.date).toLocaleDateString()} at {new Date(invoice.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="history-card-body">
                <div>
                  <strong>Customer:</strong> {invoice.customerName}
                </div>
                <div>
                  <strong>Mobile:</strong> {invoice.customerMobile}
                </div>
                <div className="history-item-summary">
                  <strong>Items: </strong> 
                  {invoice.items.map(item => `${item.name} (x${item.qty})`).join(', ')}
                </div>
                <div className="history-invoice-total">
                  Total: ₹{invoice.total.toFixed(2)}
                </div>
              </div>

              <div className="history-card-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleDownload(invoice)}
                  style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Download size={14} />
                  Download PDF
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleResend(invoice)}
                  style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Send size={14} />
                  Resend WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceHistory;
