import asyncHandler from "express-async-handler";
import Position from "../models/positionModel.js";
import Player from "../models/playerModel.js";
import User from "../models/userModel.js";

//@desc Set Position
//@route POST /api/positions
//@access Private
//@role Admin
const setPosition = asyncHandler(async (req, res) => {
  let { name, shortName, code } = req.body;
  const duplicateCode = await Position.findOne({ code });
  // Find user
  if (!req.user) {
    res.status(400);
    throw new Error("User not found");
  }
  // Make sure the logged in user is an ADMIN
  /*if (!Object.values(req.user.roles).includes(2048)) {
    res.status(401);
    throw new Error("Not Authorized");
  }*/

  if (code <= 0) {
    res.status(400);
    throw new Error(`Code can't be less than 0`);
  }

  if (duplicateCode) {
    res.status(400);
    throw new Error("Code already taken");
  }

  if (!name || !shortName || !code) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  shortName = shortName.toLocaleUpperCase();
  const pluralName =
    name[0].toLocaleUpperCase() + name.slice(1).toLocaleLowerCase() + "s";
  const singularName =
    name[0].toLocaleUpperCase() + name.slice(1).toLocaleLowerCase();
  const position = await Position.create({
    pluralName,
    singularName,
    shortName,
    code,
  });

  res.status(200).json(position);
});

//@desc Get Positions
//@route GET /api/positions
//@access public
//@role not restricted
const getPositions = asyncHandler(async (req, res) => {
  const positions = await Position.find({}).lean();
  const players = await Player.aggregate([{$group: {_id: "$playerPosition", total: {$sum: 1}}}]);
  const mapPosition = new Map(players.map(x => [x._id.toString(), x.total]))
  const newPositions = positions.map(x => {return {
    ...x,
    total: mapPosition.get(x._id.toString())
  }})
  res.status(200).json(newPositions);
});

//@desc Get Position
//@route GET /api/position
//@access public
//@role not restricted
const getPosition = asyncHandler(async (req, res) => {
  const position = await Position.findById(req.params.id);
  res.status(200).json(position);
});

//@desc update position
//@route PUT /api/positions/:id
//@access private
//@role ADMIN, EDITOR
const updatePosition = asyncHandler(async (req, res) => {
  const position = await Position.findById(req.params.id);
  // Find user
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  // Make sure the logged in user is an ADMIN OR EDITOR
  /*if (
    Object.values(user.roles).includes(1) &&
    Object.values(user.roles).length === 1
  ) {
    res.status(401);
    throw new Error("Not Authorized");
  }*/
  if (!position) {
    res.status(400);
    throw new Error("Position not found");
  } else {
    /*Object.keys(req.body).forEach((val) => {
      if (val === "pluralName") {
        req.body.pluralName =
          req.body.pluralName[0].toLocaleUpperCase() +
          req.body.pluralName.slice(1).toLocaleLowerCase();
      }
      if (val === "singularName") {
        req.body.singularName =
          req.body.singularName[0].toLocaleUpperCase() +
          req.body.singularName.slice(1).toLocaleLowerCase();
      }
      if (val === "shortName") {
        req.body.shortName = req.body.shortName.toLocaleUpperCase();
      }
    });*/
    const updatedPosition = await Position.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res
      .status(200)
      .json({ msg: `${updatedPosition.singularName} field updated` });
  }
});

//@desc delete position
//@route DELETE /api/positions/:id
//@access private
//@role ADMIN
const deletePosition = asyncHandler(async (req, res) => {
  const position = await Position.findById(req.params.id);

  // Find user
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  // Make sure the logged in user is an ADMIN
  /*if (!Object.values(user.roles).includes(2048)) {
    res.status(401);
    throw new Error("Not Authorized");
  }*/

  if (!position) {
    res.status(400);
    throw new Error("Position not found");
  }
  const deletedPosition = await Position.findByIdAndDelete(req.params.id);
  res.status(200).json({ id: req.params.id });
});

export {
  setPosition,
  getPositions,
  getPosition,
  updatePosition,
  deletePosition,
};
