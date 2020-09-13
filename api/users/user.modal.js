import mongoose, {Schema} from 'mongoose';
import timestamps from "mongoose-timestamp";

const userSchema = Schema({
    name:String,
    emailId:String,
    password:String,
    mobileNo:Number,
    userName:String,
    designation:String,
    country:String,
    city:String,
    hobbies:Array,
    profileImgURL:String,
    coverImgURl:String,
    content:String,


}, { timestamps: {createdAt:'created_at'} })

export const Users = mongoose.model('userInfo',userSchema);