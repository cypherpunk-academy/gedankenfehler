import mongoose from 'mongoose';
import { MONGODB_URI } from './config';

export const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err);
    }
};
