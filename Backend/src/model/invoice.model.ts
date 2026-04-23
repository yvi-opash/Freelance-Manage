import mongoose from "mongoose";

export interface ILineItem {
    description: string;
    amount: number;
}

export interface IInvoice extends mongoose.Document{
    userId : mongoose.Types.ObjectId;
    clientId: mongoose.Types.ObjectId;
    projectId?: mongoose.Types.ObjectId;
    invoiceNumber: string;
    lineItems: ILineItem[];
    totalAmount: number;
    tax: number;
    discount: number;
    currency: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    dueDate: Date;
}

const InvoiceSchema = new mongoose.Schema<IInvoice>({
    userId : {type : mongoose.Types.ObjectId, required: true, ref: 'User'},
    clientId : {type : mongoose.Types.ObjectId, required: true, ref: 'Client'},
    projectId : {type : mongoose.Types.ObjectId, ref: 'Project'},
    invoiceNumber : {type : String, required: true},
    lineItems : [{
         description : {type : String, required: true},
         amount : {type : Number, required: true},
    }],
    totalAmount : {type : Number, required: true},
    tax : {type : Number, required: true},
    discount : {type : Number, required: true},
    currency : {type : String, required: true, default: 'USD'},
    status : {type : String, required: true, enum: ['draft', 'sent', 'paid', 'overdue'], default: 'draft'},
    dueDate : {type : Date, required: true}
},
{timestamps: true}
);

const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
