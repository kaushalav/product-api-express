import multer from 'multer';
import path from 'path';
import Joi from 'joi';
import fs from 'fs';

import { Product } from '../models'; 
import CustomErrorHandler from '../services/CustomErrorHandler';
import productSchema from '../validators/productValidator';


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        // 3746674586-836534453.png
        cb(null, uniqueName);
    },
});

const handleMultiPartData = multer({ storage, limits: { fileSize: 100000 * 5 } }).single('image'); 

export const productController = {
    async store(req, res, next) {
        // handle multipart from data
        handleMultiPartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err.message));
            }
            console.log(req.file);
            const filePath = req.file.path;
            console.log(filePath)

            // validation

            const { error } = productSchema.validate(req.body);
            if (error) {
                // unload file from server
                fs.unlink(`${appRoot}/${filePath}`, (err) => {
                    if (err) {
                        return next(CustomErrorHandler.serverError(err.message));                        
                    }
                });
                return next(error);  
            }

            const { name, price, size } = req.body;
            let document;
            try {
                document = await Product.create({
                    name,
                    price,
                    size,
                    image: filePath
                });
            }
            catch (err) {
                return next(err);
            }

            res.status(201).json(document); 
        });
    },

    async update(req, res, next) {
        handleMultiPartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err.message));
            }
            console.log(req.file);
            let filePath;
            if (req.file) {
                filePath = req.file.path;
                console.log(filePath)
            }

            // validation

            const { error } = productSchema.validate(req.body);
            if (error) {
                // unload file from server
                if (req.file) {
                    fs.unlink(`${appRoot}/${filePath}`, (err) => {
                        if (err) {
                            return next(CustomErrorHandler.serverError(err.message));
                        }
                    });
                }
                return next(error);
            }

            const { name, price, size } = req.body;
            let document;
            try {
                document = await Product.findOneAndUpdate(
                    { _id: req.params.id },
                    {
                        name,
                        price,
                        size,
                            ...(req.filePath && { image: filePath })
                    },
                    {new : true} 
                );
            }
            catch (err) {
                return next(err);
            }

            res.status(201).json(document);
        });
    },

    async delete(req, res, next) {
        let document;
        try {
            document = await Product.findOneAndRemove({ _id: req.params.id });
            if (!document) {
                return next(new Error('Nothing to delete'));
            }
            // delete the image also
            const imagePath = document.image;
            fs.unlink(`${appRoot}/${imagePath}`, (err) => {
                if (err) {
                    return next(CustomErrorHandler.serverError(err.message));
                }
            });
        }
        catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        res.json(document);
    },

    async getOneProduct(req, res, next) {
        let document;
        try {
            document = await Product.findOne({ _id: req.params.id }).select('-__v');
            if (!document) {
                return next(CustomErrorHandler.serverError());
            }
            res.json(document);
        }
        catch (err) {
            return next(new Error(err.message));
        }
    },

    async index(req, res, next) {
        // pagination -> mongoose-pagination
        let document;
        try{
            document = await Product.find().select('-__v');
        } 
        catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        res.json(document);
    }
}