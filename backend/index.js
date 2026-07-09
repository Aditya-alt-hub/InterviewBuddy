import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.js";
// import chatRoutes from "./routes/chatRoutes.js";
// import messageRoutes from "./routes/messageRoutes.js";
import sessionRoutes from "./routes/session.js";
// import interviewRoutes from "./routes/interviewRoutes.js";
// import resumeRoutes from "./routes/resumeRoutes.js";
import { notFound, errorHandler } from "./Middlewares/error.js";


dotenv.config({ path: ".env" });

connectDB();

const app = express();
const server = http.createServer(app);


//middlewares
// app.use(express.json());
// app.use(express.urlencoded({extended:true}));
// app.use(cookieParser());

const corsOptions =
{
    // origin:['http://localhost:5273',
    // 'http://localhost:5274'
    // ],
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (['http://localhost:5173', 'http://localhost:5174','https://interview-buddy-tau.vercel.app'].includes(origin)) {
            return callback(null, true);
        }
        else if (process.env.NODE_ENV === "production") {
            return callback(new Error("Not allowed by CORS"));
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,

}
app.use(cors(corsOptions));

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "https://interview-buddy-tau.vercel.app"
        ],
        // origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });
});




//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.set("io", io);

app.get("/", (req, res) => {
    res.send("API is running...");
});

//apis
// app.use("/api/users", userRoutes);
// app.use("/api/chats", chatRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/sessions", sessionRoutes);
// app.use("/api/interviews", interviewRoutes);
// app.use("/api/resumes", resumeRoutes);


io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    const userId=socket.handshake.query.userId;
    if(userId){
         socket.join(userId);
        console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    }
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });

});


app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// //apis
// "http://localhost:5000/register"
// "http://localhost:5000/login"
// "http://localhost:5000/profile/update"
app.use("/api/users", userRoutes);
// app.use("/api/chats", chatRoutes);
// app.use("/api/messages", messageRoutes);
app.use("/api/sessions", sessionRoutes);
// app.use("/api/interviews", interviewRoutes);
// app.use("/api/resumes", resumeRoutes);

// error handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    connectDB();
    console.log(`Server running at ${PORT}`);
});
