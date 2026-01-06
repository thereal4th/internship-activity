import mongoose, {Schema, Model} from 'mongoose';
import {User} from '@/types'

//create new interface for DB 
export interface UserDocument extends Document{
    name: string;
    email: string;
    password: string;
    createdAt?: Date; // optional for "No overload matches" protection
}

const userSchema = new Schema<UserDocument>({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
});

export const UserModel: Model<UserDocument> =
    mongoose.models.User || mongoose.model<UserDocument>("User", userSchema)