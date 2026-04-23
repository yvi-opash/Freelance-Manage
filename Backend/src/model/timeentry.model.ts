import mongoose from "mongoose";

export interface ITimeEntry extends mongoose.Document {
    userId : mongoose.Types.ObjectId;
    projectId : mongoose.Types.ObjectId;
    duration : number; // in seconds
    description : string;
    date : string;
    startTime? : string; // ISO string when timer started
}

const TimeEntrySchema = new mongoose.Schema<ITimeEntry>({
    userId : {type : mongoose.Types.ObjectId, required: true, ref: 'User'},
    projectId : {type : mongoose.Types.ObjectId, required: true, ref: 'Project'},
    duration : {type : Number, required: true, default: 0},
    description : {type : String, required: true},
    date : {type : String, required: true},
    startTime : {type : String}
},

{timestamps: true}
)

const TimeEntry = mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
export default TimeEntry;


