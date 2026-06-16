import { jsPDF } from 'jspdf';

export const generateInvoicePDF = (invoice, currentStall, showToast) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5' // A5 size receipt
    });

    const primaryColor = [99, 102, 241]; // Indigo
    const textColor = [30, 41, 59]; // Dark slate

    // Header Details
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(currentStall.stallName || 'EXHIBITION STALL', 74, 15, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    
    let headerY = 20;
    if (currentStall.instagramId) {
      doc.text(`Instagram: @${currentStall.instagramId}`, 74, headerY, { align: 'center' });
      headerY += 5;
    }
    if (currentStall.whatsappLink) {
      doc.text(`WA Group: ${currentStall.whatsappLink.replace('https://', '')}`, 74, headerY, { align: 'center' });
      headerY += 5;
    }
    if (currentStall.contactName) {
      doc.text(`Contact: ${currentStall.contactName} (${currentStall.contactMobile || ''})`, 74, headerY, { align: 'center' });
      headerY += 5;
    }

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.line(10, headerY, 138, headerY);
    headerY += 6;

    // Invoice details
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('INVOICE', 10, headerY);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 10, headerY + 5);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 10, headerY + 9);

    doc.setFont('Helvetica', 'bold');
    doc.text('Bill To:', 90, headerY);
    doc.setFont('Helvetica', 'normal');
    doc.text(invoice.customerName, 90, headerY + 5);
    if (invoice.customerMobile) {
      doc.text(`Mobile: ${invoice.customerMobile}`, 90, headerY + 9);
    }

    // Table Setup
    let y = headerY + 16;
    doc.setFillColor(241, 245, 249);
    doc.rect(10, y, 128, 7, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Item Description', 12, y + 5);
    doc.text('Qty', 85, y + 5, { align: 'right' });
    doc.text('Rate', 110, y + 5, { align: 'right' });
    doc.text('Total', 136, y + 5, { align: 'right' });

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    y += 7;
    
    invoice.items.forEach((item) => {
      y += 6;
      doc.text(item.name, 12, y);
      doc.text(item.qty.toString(), 85, y, { align: 'right' });
      doc.text(`₹${item.rate.toFixed(2)}`, 110, y, { align: 'right' });
      doc.text(`₹${(item.rate * item.qty).toFixed(2)}`, 136, y, { align: 'right' });
      
      doc.setDrawColor(241, 245, 249);
      doc.line(10, y + 2, 138, y + 2);
      y += 2;
    });

    // Grand Total
    y += 6;
    doc.setDrawColor(203, 213, 225);
    doc.line(10, y, 138, y);
    y += 5;
    
    doc.setFont('Helvetica', 'bold');
    doc.text('Grand Total:', 90, y);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`₹${invoice.total.toFixed(2)}`, 136, y, { align: 'right' });

    // Footer Support
    y += 18;
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for shopping with us! 🌟', 74, y, { align: 'center' });
    
    y += 4;
    doc.text('App Support: Devendra Jain (+91 98290 12345 / devendrajain.support@gmail.com)', 74, y, { align: 'center' });

    doc.save(`${invoice.invoiceNumber}.pdf`);
    return true;
  } catch (err) {
    console.error('PDF Generation Error:', err);
    if (showToast) showToast('Failed to generate PDF', 'error');
    return false;
  }
};
