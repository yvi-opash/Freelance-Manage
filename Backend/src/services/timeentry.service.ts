import TimeEntry from "../model/timeentry.model";

export const createTimeEntry = async (userId: string, data: any) => {
    return TimeEntry.create({...data, userId});
}


export const getTimeEntries = async (userId: string) => {
    return TimeEntry.find({ userId }).populate("projectId");
};

export const deleteTimeEntry = async (userId: string, id: string) => {
    return TimeEntry.findOneAndDelete({ _id: id, userId });
};