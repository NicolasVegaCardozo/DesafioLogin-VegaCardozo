import {Schema, model} from 'mongoose';

const userSchema = new Schema ({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    }
})

const userModel = model('user', userSchema);
export default userModel;