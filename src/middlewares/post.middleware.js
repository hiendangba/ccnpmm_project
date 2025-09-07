const { validatePostNew } = require("../validations/auth.validation");
const CloudinaryError = require("../errors/cloudinary.error");
const cloudinary = require("../config/cloudinary");
const AppError = require("../errors/AppError");
const upload = require("./upload.middleware");

const validatePost = (req, res, next) => {
    try {
        req.body.userId = req.user.id;
        validatePostNew (req.body);
        next();
    }
    catch (err){
        if (!(err instanceof AppError)) {
            err = AppError.fromError(err);
        }
        res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    }

};


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
        if (!(err instanceof AppError)) {
            err = AppError.fromError(err);
        }
        res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    }
}
module.exports = { validatePost, handleImages };