import {Users} from './user.modal'
import mongoose from 'mongoose'
import configKey from '../../config'
import jwt from 'jsonwebtoken';
// get user profile by id
export const getProfile = async(req,res) =>{
    try{
        const userId = req.query.id;
        const profileData = await Users.findOne(userId)
        console.log(profileData);
        if(profileData.length<=0){
            res.status(401).send({
                success:false,
                message:'somthing goes to wrong in find data'
            })
        }
        else{
            res.status(201).send({
                success:true,
                data:profileData,
                message:'data find successfully'
            })
        }
    }
    catch(err){
        res.status(401).send({
            success:false,
            message:err.message
        })
    }
}
//search User
export const serachUser = async(req,res) =>{
    try{
        const {serchData,userId} = req.body;
        const searchDataBackend = []
        const allUser = await Users.aggregate([{
            $match:{}
        },
        {
            $project:{
                _id:1,
                userName:1,
                profileImgURL:1,
                city:1
            }
        }]);
        await Promise.all(allUser.map((item)=>{
            const ID = item._id.toString();
            if(item.userName.match(serchData) && !ID.match(userId)){
                searchDataBackend.push(item);
            }
        }))
        //console.log(allUser);
        res.status(201).send({
            success:true,
            data:searchDataBackend
        })
    }
    catch(err){
        res.status(401).send({
            success:false,
            message:err.message
        })
    }
}
//edit profile page
export const updateUser = async(req,res) =>{
    try{
        const {userId,designation,country,city,hobbies} = req.body;
        const success = await Users.findByIdAndUpdate({_id:userId},{
            designation,country,city,hobbies
        })
        if(!success){
            res.status(401).send({
                success:false,
                message:'data update process failed due to user not found error'
            })
        }
        res.status(201).send({
            success:true,
            message:'data update successsully'
        })
    }
    catch(err){
        res.status(401).send({
            success:false,
            message:err.message
        })
    }
}

//upload profile Image
export const setProfileImg = async(req,res) =>{
    try{
        if(req.file){
            console.log(req.file);
            const decoded = await jwt.verify(req.headers.token, configKey.secrets.JWT_SECRET);
            await Users.findOneAndUpdate({emailId:decoded.sub},{
                profileImgURL:"http://localhost:8000/profile/"+req.file.filename
            })
            return res.status(201).send({
                success:true,
                message:'image upload successfully'
            })
        }
        else{
            res.status(401).send({
                success:false,
                message:"Image file either not supported or not found"
            })
        }
    }
    catch(err){
        res.status(401).send({
            success:false,
            message:err.message
        })
    }
}

//upload Cover Image
export const setCoverImg= async(req,res) =>{
    try{
        if(req.file){
            console.log(req.file);
            const decoded = await jwt.verify(req.headers.token, configKey.secrets.JWT_SECRET);
            await Users.findOneAndUpdate({emailId:decoded.sub},{
                coverImgURl:"http://localhost:8000/profile/"+req.file.filename
            })
            return res.status(201).send({
                success:true,
                message:'image upload successfully'
            })
        }
        else{
            res.status(401).send({
                success:false,
                message:"Image file either not supported or not found"
            })
        }
    }
    catch(err){
        res.status(401).send({
            success:false,
            message:err.message
        })
    }
}

