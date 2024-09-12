import Joi from 'joi';
import { RefreshToken, User } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtService from '../../services/JwtService';
import { REFRESH_SECRET } from '../../config';

export const refreshController = {
    async refresh(req, res, next) {
        const refreshSchema = Joi.object({
            refresh_token: Joi.string().required()
        });
        const { error } = refreshSchema.validate(req.body);
        if (error) {
            return next(error);
        }

        // check in db
        let refreshToken;
        try {
            // check in db
            refreshToken = await RefreshToken.findOne({token : req.body.refresh_token});
            if (!refreshToken) {
                return next(CustomErrorHandler.unauthorized('Invalid refresh token'));
            }

            // find the user_d
            let user_id;
            try {
                const { _id } = JwtService.verify(refreshToken.token, REFRESH_SECRET);
                user_id = _id;
            }
            catch (err) {
                return next(CustomErrorHandler.unauthorized('Invalid refresh token'));
            }

            // check if user is in db
            try {
                const user = await User.findOne({ _id: user_id });
                if (!user) {
                    return next(CustomErrorHandler.unauthorized('User not found'));
                }
                // generate tokens
                const access_token = JwtService.sign({ _id: user._id, role: user.role });
                const refresh_token = JwtService.sign({ _id: user._id, role: user.role }, '1y', REFRESH_SECRET);

                // save refresh token in db
                await RefreshToken.create({ token: refreshToken });

                res.json({ access_token, refresh_token });
            }
            catch (err) {
                return next(CustomErrorHandler.unauthorized('Invalid refresh token'));
            }
        }
        catch (err) {
            return next(new Error('Something went wring' + err.message));
        }
    }
}