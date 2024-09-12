import { User } from "../models";
import CustomErrorHandler from "../services/CustomErrorHandler";

const admin = async (req, res, next) => {
    const _id = req.user._id;
    try {
        const user = await User.findOne({ _id: _id });
        if (user && user.role === 'admin') {
            next();
        }
        else {
            return next(CustomErrorHandler.unauthorized());
        }
    }
    catch (err) {
        return next(CustomErrorHandler.serverError());
    }
}

export default admin;