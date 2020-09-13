import {notificationList} from './notification.modal'
import {Users} from '../users/user.modal'
import jwt from 'jsonwebtoken';
import configKey from '../../config'
//------------------------------------------------------------------show notification

export const getnotification = async (req,res) =>{
    try{
    const decoded = await jwt.verify(req.headers.token, configKey.secrets.JWT_SECRET);
    const data = await Users.findOne({emailId:decoded.sub})
    const userId = data._id

    const userData = await notificationList.findOne({userId:userId})
    const notificationData=userData.notification
    var totalNotification = notificationData.length;
    for(var i = totalNotification-1 ;i>totalNotification-11;i--){
        if(notificationData[i]){
            res.send(notificationData[i]);
        }        
    }
    }catch(err){
        res.status(401).send({
            success:false,
            message:err.message
        })
    }
}