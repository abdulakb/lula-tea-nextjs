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

  // Note: Arabic text will render using jsPDF's default font which has limited Arabic support
  // For production, consider using html2pdf or PDFMake for better Arabic rendering
  
  // Set default font
  doc.setFont("helvetica");

  // Header - Company Info (Bilingual)
  doc.setFontSize(24);
  doc.setTextColor(74, 94, 71); // tea-green color
  doc.text("Lula Tea", 105, 20, { align: "center" });
  
  // Arabic company name (will render with basic glyphs)
  doc.setFontSize(18);
  doc.text("لولا تي", 105, 30, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Homemade with Love", 105, 38, { align: "center" });

  // Invoice Title (Bilingual)
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("INVOICE", 105, 53, { align: "center" });
  
  doc.setFontSize(14);
  doc.text("فاتورة", 105, 61, { align: "center" });

  // Invoice Details (English only for dates, times, amounts)
  doc.setFont("helvetica");
  doc.setFontSize(10);
  const leftCol = 20;
  const rightCol = 120;

  doc.text(`Order ID: ${data.orderId}`, leftCol, 73);
  doc.text(`Date: ${data.orderDate}`, leftCol, 81);
  doc.text(`Payment: ${data.paymentMethod}`, leftCol, 89);

  // Customer Details (Bilingual labels)
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Details", rightCol, 73);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("بيانات العميل", rightCol + 48, 73);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.customerName, rightCol, 81);
  doc.text(data.customerPhone, rightCol, 89);
  
  // Split address if too long
  const addressLines = doc.splitTextToSize(data.customerAddress, 70);
  let yPos = 97;
  addressLines.forEach((line: string) => {
    doc.text(line, rightCol, yPos);
    yPos += 6;
  });

  // Items Table (Bilingual)
  const tableStartY = Math.max(yPos + 10, 110);
  
  const tableHeaders = isArabic 
    ? [["الإجمالي", "السعر", "الكمية", "المنتج"]]
    : [["Item", "Qty", "Price", "Total"]];

  const tableData = data.items.map((item) => {
    // Show bilingual names based on language preference
    const itemName = isArabic ? item.nameAr : item.name;
    const itemNameSecondary = isArabic ? item.name : item.nameAr;
    const displayName = `${itemName}\n${itemNameSecondary}`;
    
    const price = `${item.price} SAR`;
    const total = `${item.price * item.quantity} SAR`;
    
    return isArabic 
      ? [total, price, item.quantity.toString(), displayName]
      : [displayName, item.quantity.toString(), price, total];
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
      halign: isArabic ? "right" : "left",
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [245, 241, 232], // warm-cream
    },
    columnStyles: isArabic ? {
      3: { halign: "right" }, // Product name column for Arabic
    } : {
      0: { cellWidth: 60 }, // Item name column for English
    },
  });

  // Get Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Totals (English for amounts, bilingual for labels)
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

  // Footer (Bilingual)
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  
  const footerY = 270;
  doc.text("Thank you for your order!", 105, footerY, { align: "center" });
  doc.setFontSize(9);
  doc.text("شكراً لطلبك!", 105, footerY + 6, { align: "center" });
  
  doc.setFont("helvetica");
  doc.text("For inquiries: +966 53 966 6654", 105, footerY + 12, { align: "center" });

  return doc.output("blob");
}
