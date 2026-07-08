import multer from "multer";
import fs from "fs";
import path from "path";

// Create uploads folder if it doesn't exist
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const ext=path.extname(file.originalname);
        const baseName=path.basename(file.originalname,ext);
        const sessionId=req.params.id||"unknown";
        cb(null, `${sessionId }-${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")||file.mimetype.startsWith("application/octet-stream")) {
        cb(null, true);
    } else {
        cb(new Error("Only audio files are allowed!"), false);
    }
}; 

const upload = multer({ storage: storage, fileFilter:fileFilter,limits: { fileSize:1024*1024*10 } }); 

const uploadSingleAudio = upload.single("audio");
export { uploadSingleAudio };

// import multer from "multer";
// import fs from "fs";
// import path from "path";

// const uploadDir = path.join(process.cwd(), "uploads");

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },

//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname) || ".webm";
//     const sessionId = req.params.id || "unknown";

//     cb(null, `${sessionId}-${Date.now()}${ext}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype.startsWith("audio/") ||
//     file.mimetype === "application/octet-stream"
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only audio files are allowed!"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 },
// });

// const uploadSingleAudio = upload.single("audio");

// export { uploadSingleAudio };