import mongoose, { Document, Model } from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    name: String,
    userName: String,
  },
  {
    timestamps: true,
    collection: 'User',
  },
);

export interface IUser extends Document {
  name: string;
  userName: string;
}

const UserModel: Model<IUser> = mongoose.model('User', UserSchema);

export default UserModel;
