import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/JwtService";

const auth = async (req,res,next) => {
    let authHeader = req.headers.authorization;
    console.log(authHeader); 
    if (!authHeader) {
        return next(CustomErrorHandler.unauthorized());
    }
    const token = authHeader.split(' ')[1];
    console.log(token);

    try {
        const { _id, role } = JwtService.verify(token);
        const user = {
            _id,
            role
        }
        req.user = user;
        next();    
    }
    catch (err) {
        return next(CustomErrorHandler.unauthorized());
    }
}
export default auth;