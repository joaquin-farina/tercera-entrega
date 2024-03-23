import { Schema, model } from "mongoose";

const ticketsCollection = 'tickets'

const ticketsSchema = new Schema({
    code: {
        type: String,
        unique: true,
        required: true
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    },
}
// , { timestamps: true }
);

const ticketsModel = model(ticketsCollection, ticketsSchema)

export default ticketsModel