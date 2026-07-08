import User from "../models/user.js";
import jwt from "jsonwebtoken";
// import generateToken from "../utils/generateToken.js";
// import generateToken from "../Controllers/generateToken.js";
import asyncHandler from "express-async-handler";
import {OAuth2Client} from "google-auth-library";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        

// // Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE || "1d"
    });
};

// // Generate Refresh Token
// const generateRefreshToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.SECRET_KEY, {
//         expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d"
//     });
// };

// // @desc    Register a new user
// // @route   POST /api/users/register
// // @access  Public
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide name, email, and password"
        });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            success: false,
            message: "Email already registered"
        });
    }
    //create new user
    const user = await User.create({
        name,
        email,
        password
    });
    if (user) {
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
                // preferredRole: user.preferredRole
            }
        });
    } else {
        res.status(400).json({
            success: false,
            message: "Invalid user data"
        });
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide email and password"
        });
    }
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.json({
            success: true,
            message: "Logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                preferredRole: user.preferredRole,
                token: generateToken(user._id),
            }
        });
    } else {
        res.status(400).json({
            success: false, 
            message: "Invalid email or password"
        });
    }
});

// const googleLogin = asyncHandler(async (req, res) => {
//     const { token } = req.body;
//     const ticket = await client.verifyIdToken({
//         idToken: token,
//         audience: process.env.GOOGLE_CLIENT_ID
//     });
//    const {email_verified, name, email,sub:googleId} = ticket.getPayload();
//    if(!email_verified)
//    {
//     return res.status(400).json({
//         success: false,
//         message: "Email not verified"
//     });
//    }
//     let user = await User.findOne({ email });
//       if(user)
//       {
//         if(!user.googleId)
//         {
//           user.googleId = googleId;
//           await user.save();
//         }
//       }
//       else
//       {
//         const newUser = await User.create({
//             name,
//             email,
//             googleId,
//             password:null

//         });  
//             res.status(201).json({
//                 _id: newUser._id,
//                 name: newUser.name,
//                 email: newUser.email,
//                 preferredRole: newUser.preferredRole,
//                 token: generateToken(newUser._id),
//             });
        
        
//       }
     
// });


// const googleLogin = asyncHandler(async (req, res) => {
//   const { token } = req.body;

//   if (!token) {
//     return res.status(400).json({
//       success: false,
//       message: "Google token is required",
//     });
//   }

//   const ticket = await client.verifyIdToken({
//     idToken: token,
//     audience: process.env.GOOGLE_CLIENT_ID,
//   });

//   const { email_verified, name, email, sub: googleId } = ticket.getPayload();

//   if (!email_verified) {
//     return res.status(400).json({
//       success: false,
//       message: "Email not verified",
//     });
//   }

//   let user = await User.findOne({ email });

//   if (user) {
//     if (!user.googleId) {
//       user.googleId = googleId;
//       await user.save();
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Google login successful",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         preferredRole: user.preferredRole,
//         token: generateToken(user._id),
//       },
//     });
//   }

//   user = await User.create({
//     name,
//     email,
//     googleId,
//     password: null,
//   });

//   return res.status(201).json({
//     success: true,
//     message: "Google user registered successfully",
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       preferredRole: user.preferredRole,
//       token: generateToken(user._id),
//     },
//   });
// });

const logout = asyncHandler(async (req, res) => {
    try {
        // Clear refresh token cookie
        res.clearCookie("refreshToken");

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error logging out",
            error: error.message
        });
    }
});

const getProfile = asyncHandler(async (req, res) => {
   if(req.user)
   {
    res.status(200).json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        preferredRole: req.user.preferredRole
    });
   }
    else
    {   
        res.status(404).json
        ({
            success: false,
            message: "User not found"
        });
    }
});

const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Google token is required",
    });
  }

  const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!googleRes.ok) {
    return res.status(401).json({
      success: false,
      message: "Invalid Google access token",
    });
  }

  const googleUser = await googleRes.json();

  const {
    email_verified,
    name,
    email,
    sub: googleId,
  } = googleUser;

  if (!email_verified) {
    return res.status(400).json({
      success: false,
      message: "Email not verified",
    });
  }

  let user = await User.findOne({ email });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredRole: user.preferredRole,
        token: generateToken(user._id),
      },
    });
  }

  user = await User.create({
    name,
    email,
    googleId,
    password: null,
  });

  return res.status(201).json({
    success: true,
    message: "Google user registered successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      preferredRole: user.preferredRole,
      token: generateToken(user._id),
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
    // const { name, preferredRole } = req.body;

    // try {
    //     const user = await User.findById(req.user._id);

    //     if (!user) {
    //         return res.status(404).json({
    //             success: false,
    //             message: "User not found"
    //         });
    //     }

    //     // Update fields if provided
    //     if (name) user.name = name;
    //     if (preferredRole) user.preferredRole = preferredRole;

    //     await user.save();

    //     res.status(200).json({
    //         success: true,
    //         message: "Profile updated successfully",
    //         user: {
    //             id: user._id,
    //             name: user.name,
    //             email: user.email,
    //             preferredRole: user.preferredRole
    //         }
    //     });
    // } catch (error) {
    //     res.status(500).json({
    //         success: false,
    //         message: "Error updating profile",
    //         error: error.message
    //     });
    // }

    if(req.user)
    {
        const user = await User.findById(req.user._id);
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.preferredRole = req.body.preferredRole || user.preferredRole;
        if(req.body.password)
        {
            user.password = req.body.password;
        }
        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            preferredRole: user.preferredRole,
            token: generateToken(user._id),
        });
    }
    else
    {
        res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    
});

export { register, login, googleLogin, logout, getProfile, updateProfile };

