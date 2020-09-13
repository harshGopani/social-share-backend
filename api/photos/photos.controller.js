import { photosList } from "./photos.modal";
import { Users } from "../users/user.modal";
import { FriendList } from "../Friends/friend.modal";
import { notificationList } from "../notification/notification.modal";
import jwt from "jsonwebtoken";
import configKey from "../../config";
import mongoose from "mongoose";
// import { photosRouter } from './photos.restRoute';
// import { isValidObjectId } from 'mongoose';

async function fname(data) {
  const usernotification = await notificationList.findOne({ userId: data });
  if (!usernotification) {
    await notificationList.create({
      userId: data,
      notificaton: [],
    });
  }
}
//----------------------------------------------------showphotos
export const showphotos = async (req, res) => {
  try {
    const decoded = await jwt.verify(
      req.headers.token,
      configKey.secrets.JWT_SECRET
    );
    const data = await Users.findOne({ emailId: decoded.sub });
    const userId = data._id;

    const postData = await photosList.find({ userId: userId });
    if (!postData) {
      console.log("post data not found");
    } else {
      res.send(postData.reverse());
    }
  } catch (err) {
    res.status(401).send({
      success: false,
      message: err.message,
    });
  }
};
export const showphotosprofile = async (req, res) => {
  try {
    const userId = req.query.id;

    const postData = await photosList.find({ userId: userId });
    if (!postData) {
      console.log("post data not found");
    } else {
      res.send(postData.reverse());
    }
  } catch (err) {
    res.status(401).send({
      success: false,
      message: err.message,
    });
  }
};

//-------------------------------------------------- add new post

export const newPosts = async (req, res) => {
  try {
    // console.log(req.files)
    const { location, description, askingPrice, category } = req.body;
    var imgFilesArray = [];
    const img = req.files;
    img.forEach((element) => {
      // console.log(element.filename)
      var Ur = "http://localhost:8000/api/photos/" + element.filename;
      imgFilesArray.push(Ur);
    });
    console.log(imgFilesArray);

    const decoded = await jwt.verify(
      req.headers.token,
      configKey.secrets.JWT_SECRET
    );
    const data = await Users.findOne({ emailId: decoded.sub });
    const userId = data._id;
    // const userId =req.body.userId
    var highBid = 0;
    var now = new Date();

    await photosList.create({
      userId,
      location,
      description,
      askingPrice,
      category,
      highBid,
      imageUrl: imgFilesArray,
    });

    const friendData = await FriendList.findOne({ userId: userId });
    if (friendData) {
      const fList = friendData.friendList;
      // console.log(fList);
      // console.log(fList.length);

      for (var i = 0; i < fList.length; i++) {
        console.log();
        const usernotification = await notificationList.findOne({
          userId: fList[i].friendId,
        });
        if (!usernotification) {
          await notificationList.create({
            userId: fList[i].friendId,
            notificaton: [],
          });
        }
        await notificationList.findOneAndUpdate(
          { userId: fList[i].friendId },
          {
            $push: {
              notification: {
                type: "new post",
                userPostId: userId,
                userprofile: data.profileImgURL,
                content: data.name + "has created new post",
                phostImg: imgFilesArray,
                date: now,
              },
            },
          }
        );
      }
    }
    return res.status(201).send({
      success: true,
      message: "post created successfully.",
    });
  } catch (err) {
    res.status(422).send({ success: false, message: err.message });
  }
};

//---------------------------------------------------- add comment

export const Addcomment = async (req, res) => {
  try {
    const postId = req.body.postId;
    const newcomment = req.body.newcomment;

    const Pdata = await photosList.findOne({ _id: postId });
    const decoded = await jwt.verify(
      req.headers.token,
      configKey.secrets.JWT_SECRET
    );
    const data = await Users.findOne({ emailId: decoded.sub });
    const userId = data._id;

    console.log(Pdata.userId);
    var now = new Date();

    await photosList.findByIdAndUpdate(
      { _id: postId },
      {
        $push: {
          comment: {
            _id: mongoose.Types.ObjectId(),
            userId: userId,
            newcomment: newcomment,
            date: now,
          },
        },
      }
    );

    fname(Pdata.userId);
    const notNeed = await notificationList.findOne({ userId: Pdata.userId });
    if (userId != Pdata.userId) {
      console.log("next step");
      await notificationList.findOneAndUpdate(
        { userId: Pdata.userId },
        {
          $push: {
            notification: {
              type: "comment",
              userCommentId: userId,
              userprofile: data.profileImgURL,
              content:
                data.name + ' make comment: "' + newcomment + '" on your phost',
              phostImg: Pdata.imageUrl,
              date: now,
            },
          },
        }
      );
      console.log("last");
    } else {
      console.log("self comment");
    }

    // const total = await photosList.findOne({_id:postId})
    // console.log(total.comment.length)
    // await photosList.findByIdAndUpdate({_id:postId},{
    //     $set : {"totalComment":total.comment.length} })

    return res.status(201).send({
      success: true,
      message: "comment successfully added",
    });
  } catch (err) {
    res.status(401).send({
      success: false,
      message: err.message,
    });
  }
};

//------------------------------------------------------- add bid in post

export const newBid = async (req, res) => {
  try {
    const postId = req.body.postId;
    const newBid = req.body.newBid;

    const Pdata = await photosList.findOne({ _id: postId });
    const decoded = await jwt.verify(
      req.headers.token,
      configKey.secrets.JWT_SECRET
    );
    const data = await Users.findOne({ emailId: decoded.sub });
    const userId = data._id;
    var now = new Date();

    const hbid = await photosList.findOne({ _id: postId });
    var current = hbid.highBid;

    async function notis() {
      fname(Pdata.userId);
      const notNeed = await notificationList.findOne({ userId: Pdata.userId });
      await notificationList.findOneAndUpdate(
        { userId: Pdata.userId },
        {
          $push: {
            notification: {
              type: "bid",
              userBidId: userId,
              userprofile: data.profileImgURL,
              content: data.name + 'has bidded "$' + newBid + '" on your post',
              phostImg: Pdata.imageUrl,
              date: now,
            },
          },
        }
      );
    }

    if (userId != Pdata.userId) {
      if (current < newBid) {
        await photosList.findByIdAndUpdate(
          { _id: postId },
          {
            $push: { currentBid: { userId: userId, Bid: newBid, date: now } },
          }
        );
        await photosList.findByIdAndUpdate(
          { _id: postId },
          { highBid: newBid }
        );
        notis();
      } else {
        await photosList.findByIdAndUpdate(
          { _id: postId },
          {
            $push: { currentBid: { userId: userId, Bid: newBid, date: now } },
          }
        );
        notis();
      }
      return res.status(201).send({
        success: true,
        message: "bid added successfully",
      });
    } else {
      res.send("you can't big");
    }
  } catch (err) {
    res.status(401).send({
      success: false,
      message: err.message,
    });
  }
};

//------------------------------------------------------------- like

export const AddLike = async (req, res) => {
  try {
    const postId = req.body.postId;
    const Pdata = await photosList.findOne({ _id: postId });

    const decoded = await jwt.verify(
      req.headers.token,
      configKey.secrets.JWT_SECRET
    );
    const data = await Users.findOne({ emailId: decoded.sub });
    const userId = data._id;

    var now = new Date();
    const postData = await photosList.findOne({ _id: postId });

    var temp = 0;
    postData.like.forEach((element) => {
      if ((element.userId = userId)) {
        temp = 1;
      }
    });
    if (temp == 1) {
      console.log("already LIKEED");
      await photosList.findByIdAndUpdate(
        { _id: postId },
        {
          $pull: { like: { userId: userId } },
        }
      );
      if (userId != Pdata.userId) {
        await notificationList.findOneAndUpdate(
          { userId: Pdata.userId },
          {
            $pull: { notification: { userLikedId: userId } },
          }
        );
      }
    }
    if (temp == 0) {
      console.log("like done");
      await photosList.findByIdAndUpdate(
        { _id: postId },
        {
          $push: { like: { userId: userId, date: now } },
        }
      );
      if (userId != Pdata.userId) {
        fname(Pdata.userId);
        const notNeed = await notificationList.findOne({
          userId: Pdata.userId,
        });
        await notificationList.findOneAndUpdate(
          { userId: Pdata.userId },
          {
            $push: {
              notification: {
                type: "like",
                userLikedId: userId,
                userprofile: data.profileImgURL,
                content: data.name + " has liked your photo",
                phostImg: Pdata.imageUrl,
                date: now,
              },
            },
          }
        );
      } else {
        console.log("self like");
      }
    }
    return res.status(201).send({
      success: true,
      message: " successfully added",
    });

    // const total = await photosList.findOne({_id:postId})
    // console.log(total.like.length)
  } catch (err) {
    res.status(401).send({
      success: false,
      message: err.message,
    });
  }
};

//----------------------------------------------------------share
export const sharing = async (req, res) => {
  try {
    const postId = req.body.postId;
    const sharedUserId = req.body.receiverId;

    const Pdata = await photosList.findOne({ _id: postId });
    const Rdata = await Users.findOne({ _id: sharedUserId });
    const decoded = await jwt.verify(
      req.headers.token,
      configKey.secrets.JWT_SECRET
    );
    const data = await Users.findOne({ emailId: decoded.sub });
    const userId = data._id;
    var now = new Date();

    const friendData = await FriendList.findOne({ userId: userId });
    if (!friendData) {
      console.log("friend list not found");
    } else {
      console.log(friendData.friendList);
    }

    await photosList.findByIdAndUpdate(
      { _id: postId },
      {
        $push: {
          share: { userId: userId, sharedUser: sharedUserId, date: now },
        },
      }
    );
    if (userId != Pdata.userId) {
      fname(Pdata.userId);
      const notNeed = await notificationList.findOne({ userId: Pdata.userId });
      await notificationList.findOneAndUpdate(
        { userId: Pdata.userId },
        {
          $push: {
            notification: {
              type: "share",
              usershareId: userId,
              receiver: Rdata._id,
              content:
                data.name + ' make share your post with: "' + Rdata.name + '"',
              phostImg: Pdata.imageUrl,
              date: now,
            },
          },
        }
      );
    } else {
      console.log("self share");
    }
    fname(Pdata.sharedUserId);
    const notNeeded = await notificationList.findOne({ userId: sharedUserId });
    await notificationList.findOneAndUpdate(
      { userId: Rdata._id },
      {
        $push: {
          notification: {
            type: "share",
            usershareId: userId,
            postId: Pdata._id,
            content: data.name + " recommend to see this post",
            phostImg: Pdata.imageUrl,
            date: now,
          },
        },
      }
    );
    // const total = await photosList.findOne({_id:postId})
    // console.log(total.share.length)
    return res.status(201).send({
      success: true,
      message: "share successfully",
    });
  } catch (err) {
    res.status(401).send({
      success: false,
      message: err.message,
    });
  }
};

//------------------------------------------------------------------user uploaded photos
export const userUploadedPhotos = async (req, res) => {
  try {
    const decoded = await jwt.verify(
      req.headers.token,
      configKey.secrets.JWT_SECRET
    );
    const data = await Users.findOne({ emailId: decoded.sub });
    const userId = data._id;

    const postData = await photosList.find({ userId: userId });
    if (!postData) {
      console.log("post data not found");
    } else {
      postData.forEach((element) => {
        console.log(element.category);
        console.log(element.imageUrl);
      });
    }
    return res.status(201).send({
      success: true,
      message: "successfully.",
    });
  } catch (err) {
    res.status(401).send({
      success: false,
      message: err.message,
    });
  }
};

//------------------------------------------------------------delete post
export const deletePost = async (req, res) => {
  try {
    const decoded = await jwt.verify(
      req.headers.token,
      configKey.secrets.JWT_SECRET
    );
    const user = await Users.findOne({ emailId: decoded.sub });
    const userId = user._id;
    const { postId } = req.body;
    const post = await photosList.findById({ _id: postId });
    if (post) {
      if (post.userId == userId) {
        await photosList.deleteOne({ _id: postId });
      } else {
        console.log("you can't delete post");
      }
    } else {
      console.log("post not found");
    }

    res.status(201).send({
      success: true,
      message: "post remove successsully",
    });
  } catch (err) {
    res.status(401).send({
      success: false,
      message: err.message,
    });
  }
};

//-------------------------------------------------------home page post

export const homePagePost = async (req, res) => {
  try {
    const decoded = await jwt.verify(
      req.headers.token,
      configKey.secrets.JWT_SECRET
    );
    const user = await Users.findOne({ emailId: decoded.sub });
    const userId = user._id;
    console.log(userId);
    var homePost = [];
    const Friend = await FriendList.findOne({ userId: userId });
    var fList = Friend.friendList;
    if (Friend == null) {
      res.status(201).send({
        success: true,
        message: "You are not any friend",
      });
    }

    console.log(fList);
    for (var i = 0; i < fList.length; i++) {
      console.log(fList[i].friendId);

      var post = await photosList.find({ userId: fList[i].friendId });
      for (var j = 0; j < post.length; j++) {
        homePost.push(post[j]);
      }
    }
    var userPost = await photosList.find({ userId: userId });
    for (var j = 0; j < userPost.length; j++) {
      homePost.push(userPost[j]);
    }

    var sortedpost = homePost.sort(function (var1, var2) {
      var a = new Date(var1.createdAt),
        b = new Date(var2.createdAt);
      if (a > b) return -1;
      if (a < b) return 1;

      return 0;
    });
    console.log(sortedpost);

    return res.status(201).send({
      success: true,
      message: "successfully.",
      list: sortedpost,
    });
  } catch (err) {
    res.status(401).send({
      success: false,
      message: err.message,
    });
  }
};
