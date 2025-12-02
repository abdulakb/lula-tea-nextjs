import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface InvoiceData {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    name: string;
    nameAr: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFee?: number;
  total: number;
  paymentMethod: string;
  language: "en" | "ar";
}

export async function generateInvoice(data: InvoiceData): Promise<Blob> {
  const doc = new jsPDF();
  const isArabic = data.language === "ar";

  // Helper function to check if text contains Arabic characters
  const hasArabic = (text: string) => /[\u0600-\u06FF]/.test(text);
  
  // Helper function to sanitize text for PDF (remove Arabic characters that can't be rendered)
  const sanitizeForPdf = (text: string) => {
    if (hasArabic(text)) {
      // Replace Arabic text with a note, keep only ASCII characters
      return text.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '*');
    }
    return text;
  };

  // Use English only for PDF to avoid encoding issues
  // Arabic text in PDFs requires complex font handling that jsPDF doesn't support well
  
  doc.setFont("helvetica");

  // Header - Company Info
  doc.setFontSize(24);
  doc.setTextColor(74, 94, 71); // tea-green color
  doc.text("Lula Tea", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Homemade with Love", 105, 28, { align: "center" });

  // Invoice Title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("INVOICE", 105, 45, { align: "center" });

  // Invoice Details
  doc.setFont("helvetica");
  doc.setFontSize(10);
  const leftCol = 20;
  const rightCol = 120;

  doc.text(`Order ID: ${data.orderId}`, leftCol, 60);
  doc.text(`Date: ${data.orderDate}`, leftCol, 68);
  doc.text(`Payment: ${data.paymentMethod}`, leftCol, 76);

  // Customer Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Details:", rightCol, 60);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  // Sanitize customer name and address to handle Arabic text
  const displayName = sanitizeForPdf(data.customerName);
  const displayAddress = sanitizeForPdf(data.customerAddress);
  
  doc.text(displayName, rightCol, 68);
  doc.text(data.customerPhone, rightCol, 76);
  
  // Add note if Arabic characters were detected
  if (hasArabic(data.customerName) || hasArabic(data.customerAddress)) {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("(Arabic text replaced with * - see order details)", rightCol, 82);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    yPos = 90;
  }
  
  // Split address if too long
  const addressLines = doc.splitTextToSize(displayAddress, 70);
  addressLines.forEach((line: string) => {
    doc.text(line, rightCol, yPos);
    yPos += 6;
  });

  // Items Table
  const tableStartY = Math.max(yPos + 10, 100);
  
  const tableHeaders = [["Item", "Qty", "Price", "Total"]];

  const tableData = data.items.map((item) => {
    // Show English name only for clarity
    const itemName = item.name;
    const price = `${item.price} SAR`;
    const total = `${item.price * item.quantity} SAR`;
    
    return [itemName, item.quantity.toString(), price, total];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: tableHeaders,
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [122, 155, 118], // tea-green
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: [245, 241, 232], // warm-cream
    },
  });

  // Get Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Totals
  doc.setFont("helvetica");
  doc.setFontSize(10);
  const totalsX = 140;
  
  doc.text(`Subtotal: ${data.subtotal} SAR`, totalsX, finalY);

  if (data.deliveryFee && data.deliveryFee > 0) {
    doc.text(`Delivery: ${data.deliveryFee} SAR`, totalsX, finalY + 8);
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${data.total} SAR`, totalsX, finalY + 18);

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  
  const footerY = 270;
  doc.text("Thank you for your order!", 105, footerY, { align: "center" });
  doc.text("For inquiries: +966 53 966 6654", 105, footerY + 6, { align: "center" });

  return doc.output("blob");
}
