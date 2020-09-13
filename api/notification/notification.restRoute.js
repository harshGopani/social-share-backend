import express from 'express'
import {
    getnotification,
} from './notification.controller'
export const notificationRouter = express.Router();

notificationRouter.get("/",getnotification);