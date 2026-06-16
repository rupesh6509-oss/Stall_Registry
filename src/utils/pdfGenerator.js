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

    // Checks for empty or null fields
    const hasLogo = currentStall.logo && currentStall.logo.trim() !== '' && currentStall.logo !== 'null';
    const hasInsta = currentStall.instagramId && currentStall.instagramId.trim() !== '' && currentStall.instagramId !== 'null';
    const hasWA = currentStall.whatsappLink && currentStall.whatsappLink.trim() !== '' && currentStall.whatsappLink !== 'null';
    const hasContact = currentStall.contactName && currentStall.contactName.trim() !== '' && currentStall.contactName !== 'null';

    let headerY = 15;
    let textX = 74;
    let textAlign = 'center';

    // 1. Draw Brand Logo (if uploaded)
    if (hasLogo) {
      try {
        // Draw logo (15mm x 15mm) on the left side (x: 10, y: 10)
        doc.addImage(currentStall.logo, 'JPEG', 10, 10, 15, 15);
        textX = 28;
        textAlign = 'left';
        headerY = 15;
      } catch (e) {
        console.error("Error drawing logo in PDF:", e);
      }
    }

    // 2. Draw Stall Name Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(currentStall.stallName || 'EXHIBITION STALL', textX, headerY, { align: textAlign });

    // 3. Draw Subtitles (if configured)
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    
    let nextY = headerY + 4.5;
    
    if (hasInsta) {
      doc.text(`Instagram: @${currentStall.instagramId.replace('@', '')}`, textX, nextY, { align: textAlign });
      nextY += 4.5;
    }
    if (hasWA) {
      const displayWA = currentStall.whatsappLink.replace('https://', '').replace('chat.whatsapp.com/', 'WA Group: ');
      doc.text(displayWA, textX, nextY, { align: textAlign });
      nextY += 4.5;
    }
    if (hasContact) {
      doc.text(`Contact: ${currentStall.contactName} (${currentStall.contactMobile || ''})`, textX, nextY, { align: textAlign });
      nextY += 4.5;
    }

    // Ensure the divider clears the 15mm logo (requires at least y=27mm to look spaced)
    let dividerY = hasLogo ? Math.max(nextY, 27) : nextY;
    doc.setDrawColor(226, 232, 240);
    doc.line(10, dividerY, 138, dividerY);
    
    let detailsY = dividerY + 6;

    // 4. Draw Invoice Metadata
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('INVOICE', 10, detailsY);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 10, detailsY + 4.5);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 10, detailsY + 8);

    doc.setFont('Helvetica', 'bold');
    doc.text('Bill To:', 90, detailsY);
    doc.setFont('Helvetica', 'normal');
    doc.text(invoice.customerName, 90, detailsY + 4.5);
    if (invoice.customerMobile) {
      doc.text(`Mobile: ${invoice.customerMobile}`, 90, detailsY + 8);
    }

    // 5. Draw Table Headers
    let y = detailsY + 14;
    doc.setFillColor(241, 245, 249);
    doc.rect(10, y, 128, 6.5, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Item Description', 12, y + 4.5);
    doc.text('Qty', 85, y + 4.5, { align: 'right' });
    doc.text('Rate', 110, y + 4.5, { align: 'right' });
    doc.text('Total', 136, y + 4.5, { align: 'right' });

    // 6. Draw Table Items
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    y += 6.5;
    
    invoice.items.forEach((item) => {
      y += 5.5;
      doc.text(item.name, 12, y);
      doc.text(item.qty.toString(), 85, y, { align: 'right' });
      doc.text(`₹${item.rate.toFixed(2)}`, 110, y, { align: 'right' });
      doc.text(`₹${(item.rate * item.qty).toFixed(2)}`, 136, y, { align: 'right' });
      
      doc.setDrawColor(241, 245, 249);
      doc.line(10, y + 1.5, 138, y + 1.5);
      y += 1.5;
    });

    // 7. Draw Grand Total
    y += 5;
    doc.setDrawColor(203, 213, 225);
    doc.line(10, y, 138, y);
    y += 4.5;
    
    doc.setFont('Helvetica', 'bold');
    doc.text('Grand Total:', 90, y);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`₹${invoice.total.toFixed(2)}`, 136, y, { align: 'right' });

    // 8. Draw Footer Support
    y += 15;
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for shopping with us! 🌟', 74, y, { align: 'center' });
    
    y += 3.5;
    doc.text('App Support: Devendra Jain (+91 84840 09350 / jdevendra6509@gmail.com)', 74, y, { align: 'center' });

    doc.save(`${invoice.invoiceNumber}.pdf`);
    return true;
  } catch (err) {
    console.error('PDF Generation Error:', err);
    if (showToast) showToast('Failed to generate PDF', 'error');
    return false;
  }
};
