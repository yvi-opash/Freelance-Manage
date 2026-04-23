import TimeEntry from "../model/timeentry.model";

export const createTimeEntry = async (userId: string, data: any) => {
    // If manual entry, duration might be in minutes, convert to seconds if needed
    // But frontend seems to send seconds? Wait, manual entry says minutes.
    // In TimeEntries.tsx: 249: FormField label="Duration (minutes)"
    // So if it's a manual entry, we should convert minutes to seconds.
    const duration = data.duration ? data.duration * 60 : 0;
    return TimeEntry.create({...data, userId, duration});
}

export const getTimeEntries = async (userId: string) => {
    return TimeEntry.find({ userId }).populate("projectId").sort({ createdAt: -1 });
};

export const startTimeEntry = async (userId: string, data: any) => {
    const entry = await TimeEntry.create({
        ...data,
        userId,
        startTime: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        duration: 0
    });
    return entry;
};

export const stopTimeEntry = async (userId: string, id: string) => {
    const entry = await TimeEntry.findOne({ _id: id, userId });
    if (!entry || !entry.startTime) return entry;

    const startTime = new Date(entry.startTime).getTime();
    const endTime = new Date().getTime();
    const sessionDuration = Math.floor((endTime - startTime) / 1000);

    entry.duration += sessionDuration;
    entry.startTime = undefined;
    await entry.save();
    return entry;
};

export const deleteTimeEntry = async (userId: string, id: string) => {
    return TimeEntry.findOneAndDelete({ _id: id, userId });
};