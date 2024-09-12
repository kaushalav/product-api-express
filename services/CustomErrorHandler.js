class CustomErrorHandler extends Error {
    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
    }

    static alreadyExists(message) {
        return new CustomErrorHandler(409, message);
    }

    static wrongCredential(message = 'Incorrect Username or Password') {
        return new CustomErrorHandler(401, message);
    }

    static unauthorized(message = 'unauthorized') {
        return new CustomErrorHandler(401, message);
    }

    static userNotFound(message = '404 not found') {
        return new CustomErrorHandler(404, message);
    }

    static serverError(message = 'Internal server error') {
        return new CustomErrorHandler(500, message);
    }
}

export default CustomErrorHandler;