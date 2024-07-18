import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Team from "../models/teamModel.js";

//@desc Set Teams
//@route POST /api/teams
//@access Private
//@role Admin
const setTeams = asyncHandler(async (req, res) => {
  let { name, shortName, code } = req.body;
  const duplicateCode = await Team.findOne({ code });
  // Find user
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  // Make sure the logged in user is an ADMIN
  if (!Object.values(user.roles).includes(2048)) {
    res.status(401);
    throw new Error("Not Authorized");
  }

  if (duplicateCode) {
    res.status(400);
    throw new Error("Code already taken");
  }
  if (!name || !shortName || !code) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  name = name
    .split(" ")
    .map((x) => x[0].toLocaleUpperCase() + x.slice(1).toLocaleLowerCase())
    .join(" ");
  shortName = shortName.toLocaleUpperCase();
  const team = await Team.create({
    name,
    shortName,
    code,
  });
  res.status(200).json(team);
});

//@desc Get Teams
//@route GET /api/teams
//@access Public
//@role Admin, editor, normal_user
const getTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({});
  res.status(200).json(teams);
});

//@desc Update Team
//@route PUT /api/teams/:id
//@access Private
//@role Admin, editor
const updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  // Make sure the logged in user is an ADMIN OR EDITOR
  if (
    Object.values(user.roles).includes(1) &&
    Object.values(user.roles).length === 1
  ) {
    res.status(401);
    throw new Error("Not Authorized");
  }

  if (!team) {
    res.status(400);
    throw new Error("Team not found");
  } else {
    Object.keys(req.body).forEach((val) => {
      if (val === "name") {
        req.body.name = req.body.name
          .split(" ")
          .map((x) => x[0].toLocaleUpperCase() + x.slice(1).toLocaleLowerCase())
          .join(" ");
      }
      if (val === "shortName") {
        req.body.shortName = req.body.shortName.toLocaleUpperCase();
      }
    });
    const updatedTeam = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ msg: `${updatedTeam.name} updated` });
  }
});

//@desc Delete Teams
//@route DELETE /api/teams/:id
//@access Private
//@roles Admin
const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    res.status(400);
    throw new Error("Team not found");
  }
  // Find user
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  // Make sure the logged in user is an ADMIN
  if (!Object.values(user.roles).includes(2048)) {
    res.status(401);
    throw new Error("Not Authorized");
  }

  await Team.findByIdAndDelete(req.params.id);
  res.status(200).json({ id: req.params.id });
});

export { getTeams, setTeams, updateTeam, deleteTeam };
