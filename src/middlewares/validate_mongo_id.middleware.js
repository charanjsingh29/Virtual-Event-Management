import mongoose from "mongoose";

const validateMongoId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
    }
    next();
}

export default validateMongoId;