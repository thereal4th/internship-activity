import mongoose, { Schema, Model} from 'mongoose';

//create booking document interface for the DB
export interface BookingDocument extends Document{
    user: mongoose.Types.ObjectId;
    slot:string;
    createdAt?: Date; //optional during creation
}

//define schema
//we can create sub-schemas for user and slot to assign interfaces for further type safety
const bookingSchema = new Schema<BookingDocument>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', //links to user collection instead of making user copies
        required: true
    },

    slot: {
        type: String, required: true
    },

    createdAt: {type: Date, default: Date.now}, //default value is current date
})

// export model
export const BookingModel: Model<BookingDocument> =
    //check if model named "Booking" exists, if not create one
    mongoose.models.Booking || mongoose.model<BookingDocument>("Booking", bookingSchema);