import Joi from 'joi';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import { RefreshToken, User } from '../../models';
import bcrypt from 'bcrypt';
import JwtService from '../../services/JwtService';
import { REFRESH_SECRET } from '../../config';

export const registerController = {
    async register(req, res, next) {
        // checklist
        // 1. validate the request (usinf joi validation library)
        // 2. authorize the request
        // 3. check if user is already in the database
        // 4. prepare model
        // 5. store in database
        // 6. generate jwt token
        // 7. send response

        // 1. validation
        // const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        const registerSchema = Joi.object({
            name: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            // password: Joi.string().pattern(regex).required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            repeat_password: Joi.ref('password')
        });

        const { error } = registerSchema.validate(req.body);
        console.log("Request body : ", req.body);
        if (error) {
            return next(error);
        }

        // check if user is already in db
        try {
            const exist = await User.exists({ email: req.body.email });
            if (exist) {
                return next(CustomErrorHandler.alreadyExists('This email is already taken.'));
            }
        }
        catch (err) {
            return next(err);
        }

        const { name, email, password } = req.body;
        // hash password
        const hashedPass = await bcrypt.hash(password,10);

        // prepare the model
        
        const user = new User({
            name,
            email,
            password: hashedPass,
        });

        // store in db
        let access_token;
        let refresh_token;
        try {
            const result = user.save();
            console.log(result);
            // token
            access_token = JwtService.sign({ _id: result._id, role: result.role });
            refresh_token = JwtService.sign({ _id: user._id, role: user.role }, '1y', REFRESH_SECRET);

            // store this refresh token in db (whitelist)
            try {
                await RefreshToken.create({ token: refresh_token });
            }
            catch (err) {
                return next(err);
            }
        }
        catch (err) {
            return next(err);
        }

        
        res.json({
            access_token,
            refresh_token
        })
    }
}