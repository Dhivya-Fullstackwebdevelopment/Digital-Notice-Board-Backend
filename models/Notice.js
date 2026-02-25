import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    categoryId: { type: String, required: true },
    deptId: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    pdf: { type: String }
}, { timestamps: true });

export default mongoose.model("Notice", noticeSchema);