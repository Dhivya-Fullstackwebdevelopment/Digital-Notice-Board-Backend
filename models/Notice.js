import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const noticeSchema = new mongoose.Schema({
    noticeId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    categoryId: { type: String, required: true },
    categoryName: String,
    deptId: { type: String, required: true },
    deptName: String,
    otherCategory: { type: String, default: "" },
    otherDept: { type: String, default: "" },
    content: { type: String, required: true },
    image: { type: String },
    pdf: { type: String },
}, { timestamps: true });

const Notice = mongoose.model("Notice", noticeSchema);

export { Notice, Counter };