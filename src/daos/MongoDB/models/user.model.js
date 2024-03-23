import { Schema, model } from "mongoose";
// import paginate from 'mongoose-paginate-v2'

const usersCollection = "users";

const usersSchema = new Schema({
  firstname: String,
  lastname: String,
  fullname: {
    type: String,
    required: false
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
  },
  age: Number,
  cartId: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// usersSchema.plugin(paginate)

const usersModel = model(usersCollection, usersSchema);

export default usersModel;
