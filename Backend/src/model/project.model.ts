import mongoose, { Schema } from "mongoose";

export interface IProject extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    clientId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    hourRate: number;
    status: 'active' | 'completed' | 'archived';
}

const ProjectSchema = new Schema<IProject>({
    userId : {type : mongoose.Types.ObjectId, required: true, ref: 'User'},
    clientId : {type : mongoose.Types.ObjectId, required: true, ref: 'Client'},
    name : {type : String, required: true},
    description : {type : String, required: true},
    hourRate : {type : Number, required: true},
    status : {type : String, required: true, enum: ['active', 'completed', 'archived'], default: 'active'}
},
 {
    timestamps: true
 });

const Project = mongoose.model<IProject>('Project', ProjectSchema);

export default Project