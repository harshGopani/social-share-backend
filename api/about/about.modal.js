import mongoose, {Schema} from 'mongoose';
import timestamps from "mongoose-timestamp";

const aboutSchema = Schema({
    userId:String,
    work:Array,
    university:Array,
    highSchool:Array,
    mobileNumber:Number,
    address:String,
    website:String,
    socialLink:String,
    basicInfo:String,
    relationshipStatus:String,
    family:Array,
    aboutYourself:String,
    pronunciation:String,
    otherName:String,
    quote:String,
    bloodDonations:String,
    lifeEvents:Array

}, { timestamps: {createdAt:'created_at'} })

export const about = mongoose.model('about',aboutSchema);