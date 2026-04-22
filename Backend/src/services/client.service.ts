import Client from '../model/client.model';

export const createClients= async(data : any, userId: String) => {
    const client = await Client.create({...data, userId });
    return client;
}

export const getClients = async (userId: string) => {
  return Client.find({ userId });
};

export const getClientById = async (userId: string, id: string) => {
  const client = await Client.findOne({ _id: id, userId });
  if (!client) throw new Error("Client not found");
  return client;
};

export const updateClients = async (userId: string, id: string, data: any) => {
  return Client.findOneAndUpdate({ _id: id, userId }, data, { new: true });
};

export const deleteClients = async (userId: string, id: string) => {
  return Client.findOneAndDelete({ _id: id, userId });
};