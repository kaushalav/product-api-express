import Joi from 'joi';
import bcrypt from 'bcrypt';
import User from '../../models/user';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtService from '../../services/JwtService';
import { REFRESH_SECRET } from '../../config';
import { RefreshToken } from '../../models';

export const loginController = {

    async login(req, res, next) {
        // validation
        const loginSchema = Joi.object({
            email : Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
        });

        const { error } = loginSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        try {
            const { email, password } = req.body;
            // find if user exists in db
            const user = await User.findOne({ email: email });
            if (!user) {
                return next(CustomErrorHandler.wrongCredential());
            }
            // compare the password store in db
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return next(CustomErrorHandler.wrongCredential());
            }
            // generate token
            const access_token = JwtService.sign({ _id: user._id, role: user.role });
            const refresh_token = JwtService.sign({ _id: user._id, role: user.role }, '1y', REFRESH_SECRET);

            await RefreshToken.create({ token: refresh_token });
            res.json({ access_token, refresh_token });
            
        }
        catch (err) {
            return next(err);
        }
    },

    // just validate and delete the refresh token
    async logout(req, res, next) {
        // validation 
        const refreshTokenSchema = Joi.object({
            refresh_token : Joi.string().required()
        })
        const { error } = refreshTokenSchema.validate(req.body);
        if (error) {
            return next(error);
        }

        // delete from the db
        try {
            await RefreshToken.deleteOne({token: req.body.refresh_token});
        }
        catch (err) {
            return next(new Error('Somethind went wrong in db'));
        }

        res.json({ status: 1, message: "Logout success" });
    }

    
    
}