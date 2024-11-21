import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

//@desc Auth user/set token
//@route POST /api/users/auth
//@access Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  console.log(req.body)

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
      hasPicks: user.roles.NORMAL_USER ? user.hasPicks : null
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

//@desc Register user 
//@route POST /api/users
//@access Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, roles } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error(`User already exists`);
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    roles,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
      hasPicks: user.hasPicks
    });
  } else {
    res.status(400);
    throw new Error(`Invalid user data`);
  }
});

//@desc Logout user
//@route POST /api/users/logout
//@access Public
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User logged out" });
});

//@desc Get user profile
//@route GET /api/users/profile
//@access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName
  };
  res.status(200).json(user);
});

//@desc Auth user/set token
//@route PUT /api/users/profile
//@access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
  }

  if (req.body.password) {
    user.password = req.body.password;
  }

  if(req.body.hasPicks) {
    user.hasPicks = req.body.hasPicks
  }

  const updatedUser = await user.save();
  res.status(200).json({
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    roles: updatedUser.roles,
    hasPicks: updatedUser.hasPicks
  });
});

//@desc
//@route GET /api/users/all
//@access Private
//@role ADMIN
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(200).json(users);
});

//@desc Get total number of managers
//@route GET /api/users/totalManagers
const getTotalManagers = asyncHandler(async (req, res) => {
  const users = await User.find({hasPicks: true})
  const managerLength = users.length
  res.status(200).json({total: managerLength})
})

const getAllManagers = asyncHandler(async (req, res) => {
  const users = await User.find({hasPicks: true})
  const managerLength = users.length
  return managerLength
})

const updateHasPicks = asyncHandler(async (userId, req, res) => {
  const user = await User.findByIdAndUpdate(userId, {hasPicks: true}, {new: true}).select('-password')
  return user
})

export {
  updateHasPicks,
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getTotalManagers,
  getAllUsers,
  getAllManagers
};
