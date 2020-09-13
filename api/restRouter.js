import express from 'express'
import {userRouter} from './users'
import {friendRouter} from './Friends'
import {photosRouter} from './photos'
import { notificationRouter } from './notification/notification.restRoute';
import {aboutRouter} from './about'

export const restRouter = express.Router();

restRouter.use('/about',aboutRouter)
restRouter.use('/photos',photosRouter)
restRouter.use('/user',userRouter)
restRouter.use('/friend',friendRouter)
restRouter.use('/notification',notificationRouter)
// restRouter.use('/matirial',materialRouter);
