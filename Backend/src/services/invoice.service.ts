import PDFDocument from 'pdfkit';
import Invoice from "../model/invoice.model";

const calculateTotal = (items: any[], tax: number, discount: number) => {
    if (!items) return 0;
    const subtotal = items.reduce((sum , item) => sum + (item.amount || 0), 0);
    const taxAmount = (subtotal * (tax || 0)) / 100;
    const discountAmount = (subtotal * (discount || 0)) / 100;
    return subtotal + taxAmount - discountAmount;
}

export const createInvoice = async (userId: string, data:any) => {
    const totalAmount = calculateTotal(data.lineItems, data.tax, data.discount);
    const invoice = await Invoice.create({...data, userId, totalAmount});
    return invoice;
};

export const getInvoices = async (userId: string) => {
    return Invoice.find({ userId}).populate("clientId").populate("projectId");
};

export const updateInvoice = async (userId: string, id: string, data:any) => {
    const totalAmount = calculateTotal(data.lineItems, data.tax, data.discount);
    return Invoice.findOneAndUpdate({ _id: id, userId }, {...data, totalAmount}, { new: true });
}
export const deleteInvoice = async (userId: string, id: string) => {
    return Invoice.findOneAndDelete({ _id: id, userId });
}

export const generateInvoicePDF = async (userId: string, id: string, res: any) => {
    const invoice = await Invoice.findOne({ _id: id, userId }).populate("clientId");
    if (!invoice) throw new Error("Invoice not found");

    const doc = new PDFDocument({ margin: 50 });
    
    // Branded header
    doc.fillColor("#4f46e5").fontSize(20).text("Freelance Manager", 50, 50);
    doc.fillColor("#64748b").fontSize(10).text("Freelance Invoice Manager", 50, 75);
    
    doc.fillColor("#1e293b").fontSize(25).text("INVOICE", 400, 50, { align: "right" });
    doc.fontSize(10).text(`# ${invoice.invoiceNumber}`, 400, 80, { align: "right" });
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 400, 95, { align: "right" });

    // Client Info
    doc.moveDown(2);
    doc.fillColor("#1e293b").fontSize(12).text("BILL TO:", 50, 150);
    doc.fontSize(10).text((invoice.clientId as any).name);
    doc.text((invoice.clientId as any).company || "");
    doc.text((invoice.clientId as any).billingAddress);

    // Table Header
    doc.moveDown(4);
    const tableTop = 250;
    doc.rect(50, tableTop, 500, 20).fill("#f8fafc");
    doc.fillColor("#475569").fontSize(10).text("DESCRIPTION", 60, tableTop + 5);
    doc.text("AMOUNT", 450, tableTop + 5, { align: "right", width: 90 });

    // Line Items
    let y = tableTop + 25;
    invoice.lineItems.forEach(item => {
        doc.fillColor("#1e293b").text(item.description, 60, y);
        doc.text(`${invoice.currency} ${item.amount.toLocaleString()}`, 450, y, { align: "right", width: 90 });
        y += 20;
    });

    // Totals
    doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke("#e2e8f0");
    y += 25;
    doc.text("Tax:", 350, y, { align: "right", width: 100 });
    doc.text(`${invoice.tax}%`, 450, y, { align: "right", width: 90 });
    y += 15;
    doc.text("Discount:", 350, y, { align: "right", width: 100 });
    doc.text(`${invoice.discount}%`, 450, y, { align: "right", width: 90 });
    y += 20;
    doc.fillColor("#4f46e5").fontSize(14).text("TOTAL:", 350, y, { align: "right", width: 100 });
    doc.text(`${invoice.currency} ${invoice.totalAmount.toLocaleString()}`, 450, y, { align: "right", width: 90 });

    doc.end();
    doc.pipe(res);
}
