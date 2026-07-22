import express from 'express';
import { addcar, listcar, removecar, updatecar, singlecar } from '../controller/carcontroller.js';
import upload from '../middleware/multer.js';

const carrouter = express.Router();

const imageFields = [
  { name: "frontImage", maxCount: 1 },
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
];

carrouter.post('/add', upload.fields(imageFields), addcar);
carrouter.get('/list', listcar);
carrouter.post('/remove', removecar);
carrouter.post('/update', upload.fields(imageFields), updatecar);
carrouter.get('/single/:id', singlecar);

export default carrouter;
