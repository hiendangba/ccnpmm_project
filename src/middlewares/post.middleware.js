const { validatePostNew } = require("../validations/auth.validation");
const CloudinaryError = require("../errors/cloudinary.error");
const cloudinary = require("../config/cloudinary");
const AppError = require("../errors/AppError");
const PostError = require("../errors/post.error.enum");
const AuthError = require("../errors/auth.error");

const validatePost = (req, res, next) => {
    try {
        req.body.userId = req.user.id;
        validatePostNew (req.body);
        next();
    }
    catch (err){
        console.error("ERROR:", err);
        if (!(err instanceof AppError)) {
            err = AppError.fromError(err);
        }
        res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    }

};

const loadListPostMiddleware = (req, res, next) => {
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    let userId = req.query.userId;


    console.log(page, limit, userId);

    if (isNaN(page) || page < 1){
        page = 1;
    }
    if (isNaN(limit) || limit < 1){
        limit = 5;
    }
    if (!userId){
        userId = "";
    }

    req.pagination = {page, limit, userId};

    next();
}



const likePostMiddleware = async (req, res, next) => {
    try {

        if (!req.user || !req.user.id){
            throw new AppError (AuthError.NO_TOKEN);
        }

        req.body.userId = req.user.id;

        if (!req.body.userId || !req.body.postId){
            throw new AppError(PostError.INVALID_LIKE);
        }

        return next();
    }
    catch (err){
        console.error("ERROR:", err);
        if (!(err instanceof AppError)) { 
            err = AppError.fromError(err);
        }
        res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    }
}



const handleImages =  async (req, res, next) => {
    try{
        if (!req.files || req.files.length === 0){
            req.body.images = [];
            return next(); // cho nó đi xuóng dưới tại vì ở dưới có check rồi
        }

        const uploadPromises = req.files.map(file => {
            return new Promise ((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { resource_type: "image"},
                    (error, result) => {
                        if (error) return reject(new AppError(CloudinaryError.CLOUD_UPLOAD_ERROR));
                        resolve(result.secure_url);
                    }
                ).end(file.buffer);
            });
        });

        const urls = await Promise.all(uploadPromises);
        req.body.images = urls;
        next();

    }catch (err){
        console.error("ERROR:", err);
        if (!(err instanceof AppError)) {
            err = AppError.fromError(err);
        }
        res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    }
}
module.exports = { validatePost, handleImages, loadListPostMiddleware, likePostMiddleware };