import express from 'express'
import {
    sentFriendRequest,
    friendRequestAccept,
    getFriendList,
    showFriendRequetList,
    rejectFriendRequest,
    suggestedFriend,
    allUser,
    removeSendRequest,
    AllSentRequest,
    showRequestedFriEndData,
    notYourFriend,
    searchEngine
 

} from './friend.controller'
export const friendRouter = express.Router();

friendRouter.get("/",allUser)
friendRouter.post("/send",sentFriendRequest)
friendRouter.post('/accept',friendRequestAccept)
friendRouter.get('/show',getFriendList)
friendRouter.get('/requests',showFriendRequetList)
friendRouter.get('/requestsData',showRequestedFriEndData)
friendRouter.post("/reject",rejectFriendRequest)
friendRouter.get('/suggest',suggestedFriend)
friendRouter.post('/removeRequest',removeSendRequest)
friendRouter.get("/sentRequests",AllSentRequest)
friendRouter.get("/userList",notYourFriend)
friendRouter.get("/search",searchEngine)