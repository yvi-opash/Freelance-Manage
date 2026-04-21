import mongoose, {Document, Schema } from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    resetToken? : string;
}

const UserSchema = new Schema<IUser>(
    {
        email: {type : String, required: true, unique: true},
        password: {type : String, required: true},
        name: {type : String, required: true},
        resetToken: {type : String}
    },
    {
        timestamps: true
    }
)

const User = mongoose.model<IUser>('User', UserSchema);

export default User;