import Invoice from "../model/invoice.model";

const calculateTotal = (items: any[], tax: number, discount: number) => {
    const total = items.reduce((sum , item) => sum + item.amount, 0);
    return total + tax - discount;
}

export const createInvoice = async (userId: string, data:any) => {

    const totalamount = calculateTotal(data.items, data.tax, data.discount);

    const invoice = await Invoice.create({...data, userId, totalAmount: totalamount});
    return invoice;
};

export const getInvoices = async (userId: string) => {
    return Invoice.find({ userId}).populate("clientId").populate("projectId");
};

export const updateInvoice = async (userId: string, id: string, data:any) => {
    const totalamount = calculateTotal(data.items, data.tax, data.discount);
    return Invoice.findOneAndUpdate({ _id: id, userId }, {...data, totalAmount: totalamount}, { new: true });
}