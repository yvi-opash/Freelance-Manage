import mongoose, { Schema } from "mongoose";

export interface IClient extends mongoose.Document{
    userId: mongoose.Types.ObjectId;
    name : string;
    email: string;
    company: string;
    billingAddress: string;
    currency: string;
    notes?: string;
}

const ClientSchema = new Schema<IClient>({
    userId: {type : mongoose.Types.ObjectId, required: true, ref: 'User'},
    name: {type : String, required: true},
    email: {type : String, required: true, unique: true},
    company: {type : String, required: true},
    billingAddress: {type : String, required: true},
    currency: {type : String, required: true, default: 'INR'},
    notes: {type: String}
}, {
    timestamps: true
});

const Client = mongoose.model<IClient>('Client', ClientSchema);

export default Client;


