import mongoose from "mongoose";

export interface ITimeEntry extends mongoose.Document {
    userId : mongoose.Types.ObjectId;
    projectId : mongoose.Types.ObjectId
    duration : number;
    description : string;
    startdate : Date;
    enddate : Date;
}

const TimeEntrySchema = new mongoose.Schema<ITimeEntry>({
    userId : {type : mongoose.Types.ObjectId, required: true, ref: 'User'},
    projectId : {type : mongoose.Types.ObjectId, required: true, ref: 'Project'},
    duration : {type : Number, required: true},
    description : {type : String, required: true},
    startdate : {type : Date, required: true},
    enddate : {type : Date, required: true}
},

{timestamps: true}
)

const TimeEntry = mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
export default TimeEntry;


