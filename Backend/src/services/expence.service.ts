import PDFDocument from 'pdfkit';
import Expense from "../model/expence.model";

export const createExpenses = async (userId : string , data: any) => {
    return Expense.create({...data, userId});
};

export const getExpenses = async (userId: string) => {
    return Expense.find({ userId }).populate("projectId");
};

export const deleteExpenses = async (userId: string, id: string) => {
    return Expense.findOneAndDelete({ _id: id, userId });
}
export const updateExpenses = async (userId: string, id: string, data: any) => {
    return Expense.findOneAndUpdate({ _id: id, userId }, data, { new: true });
}

export const generateExpenseReportPDF = async (userId: string, res: any) => {
    const expenses = await Expense.find({ userId }).populate("projectId");
    
    const doc = new PDFDocument({ margin: 50 });
    
    // Branded Header
    doc.fillColor("#4f46e5").fontSize(20).text("Freelance Manager", 50, 50);
    doc.fillColor("#64748b").fontSize(10).text("Expense Report", 50, 75);
    doc.fillColor("#1e293b").fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, 400, 75, { align: "right" });

    doc.moveDown(3);
    const tableTop = 150;
    doc.rect(50, tableTop, 500, 20).fill("#f8fafc");
    doc.fillColor("#475569").fontSize(10);
    doc.text("DATE", 60, tableTop + 5);
    doc.text("DESCRIPTION", 130, tableTop + 5);
    doc.text("CATEGORY", 300, tableTop + 5);
    doc.text("AMOUNT", 450, tableTop + 5, { align: "right", width: 90 });

    let y = tableTop + 25;
    let total = 0;

    expenses.forEach(exp => {
        doc.fillColor("#1e293b").fontSize(9);
        doc.text(new Date(exp.date).toLocaleDateString(), 60, y);
        doc.text(exp.description, 130, y, { width: 160 });
        doc.text(exp.category, 300, y);
        doc.text(`$ ${exp.amount.toLocaleString()}`, 450, y, { align: "right", width: 90 });
        
        total += exp.amount;
        y += 20;

        if (y > 700) {
            doc.addPage();
            y = 50;
        }
    });

    doc.moveDown(2);
    doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke("#e2e8f0");
    y += 25;
    doc.fillColor("#4f46e5").fontSize(14).text("TOTAL EXPENSES:", 300, y, { align: "right", width: 150 });
    doc.text(`$ ${total.toLocaleString()}`, 450, y, { align: "right", width: 90 });

    doc.end();
    doc.pipe(res);
}
