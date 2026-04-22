import Project from "../model/project.model";

export const createProjects = async (userId: string, data : any) => {
 return Project.create({...data, userId});
};


export const getProjects = async (userId: string) => {
    return Project.find({ userId }).populate("clientId");
};


export const updateProjects = async (userId: string, id: string, data: any) => {
    return Project.findOneAndUpdate({ _id: id, userId }, data, { new: true });
};

export const deleteProjects = async (userId : string, id : string) => {
    return Project.findOneAndDelete({ _id: id, userId });
};