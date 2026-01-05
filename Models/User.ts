import mongoose, {Schema, Model} from 'mongoose';
import {User} from '@/types'

//create new interface for DB that extends parent User interface in @/types
export interface UserDocument extends Omit<User, 'id'> { //omit id, mongodb has own id field
    createdAt: Date;
    password: string;
    //extends the safe user type
}

const userSchema = new Schema<UserDocument>({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
});

export const UserModel: Model<UserDocument> =
    mongoose.models.User || mongoose.model<UserDocument>("User", userSchema)