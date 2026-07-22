import express from 'express';
import { addplot, listplot, removeplot, updateplot, singleplot } from '../controller/plotcontroller.js';
import upload from '../middleware/multer.js';

const plotrouter = express.Router();

plotrouter.post('/add', upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
]), addplot);

plotrouter.get('/list', listplot);

plotrouter.post('/remove', removeplot);

plotrouter.post('/update', upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
]), updateplot);

plotrouter.get('/single/:id', singleplot);

export default plotrouter;

