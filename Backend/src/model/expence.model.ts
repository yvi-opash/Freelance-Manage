import mongoose from "mongoose";

export interface IExpence extends Document {
    userId : mongoose.Types.ObjectId;
    clientId : mongoose.Types.ObjectId;
    projectId : mongoose.Types.ObjectId;
    amount : number;
    category : string;
    receipt : string;
    date : Date;
}

const ExpenseSchema = new mongoose.Schema<IExpence>({
    userId : {type : mongoose.Types.ObjectId, required: true, ref: 'User'},
    clientId : {type : mongoose.Types.ObjectId, required: true, ref: 'Client'},
    projectId : {type : mongoose.Types.ObjectId, required: true, ref: 'Project'},
    amount : {type : Number, required: true},
    category : {type : String, required: true},
    receipt : {type : String},
    date : {type : Date, default: Date.now}
}, {
    timestamps: true
});

const Expense = mongoose.model<IExpence>('Expense', ExpenseSchema);

export default Expense;