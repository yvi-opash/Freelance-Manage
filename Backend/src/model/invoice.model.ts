import mongoose from "mongoose";

export interface ILineItem {
    description: string;
    amount: number;
}

export interface IInvoice extends Document{
    userId : mongoose.Types.ObjectId;
    clientId: mongoose.Types.ObjectId;
    lineItems: ILineItem[];
    totalamount: number;
    tax: number;
    discount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    dueDate: Date;
}

const InvoiceSchema = new mongoose.Schema<IInvoice>({
    userId : {type : mongoose.Types.ObjectId, required: true, ref: 'User'},
    clientId : {type : mongoose.Types.ObjectId, required: true, ref: 'Client'},
    lineItems : [{
         description : {type : String, required: true},
         amount : {type : Number, required: true},
    }],
    totalamount : {type : Number, required: true},
    tax : {type : Number, required: true},
    discount : {type : Number, required: true},
    status : {type : String, required: true, enum: ['draft', 'sent', 'paid', 'overdue'], default: 'draft'},
    dueDate : {type : Date, required: true}
},
{timestamps: true}
);

const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
