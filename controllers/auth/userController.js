import CustomErrorHandler from "../../services/CustomErrorHandler";
import {User} from '../../models';

export const userController = {
    async me(req, res, next) {
        try {
            const user = await User.findOne({ _id: req.user._id }).select('-password -updatedAt -__v');
            if (!user) {
                return next(CustomErrorHandler.userNotFound());
            }
            res.json(user);
        }
        catch (err) {
            return next(err);
        }
    }
}