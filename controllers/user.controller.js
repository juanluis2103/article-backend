// controllers/user.controller.js
const mongoose = require("mongoose");
const validator = require("validator");
const User = require("../models/User");

// Helpers
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const allowedRoles = ["user", "admin"];

function validateCreate(body = {}) {
  const errors = [];

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const nick = typeof body.nick === "string" ? body.nick.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body.role === "string" ? body.role.trim() : undefined;

  if (validator.isEmpty(name)) errors.push("name is required");
  if (validator.isEmpty(nick)) errors.push("nick is required");
  if (validator.isEmpty(email)) errors.push("email is required");
  if (!validator.isEmpty(email) && !validator.isEmail(email)) errors.push("email is invalid");
  if (role && !allowedRoles.includes(role)) errors.push(`role must be one of: ${allowedRoles.join(", ")}`);

  return { name, nick, email, role, errors };
}

function validateUpdate(body = {}) {
  const errors = [];
  const update = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (validator.isEmpty(name)) errors.push("name cannot be empty");
    else update.name = name;
  }

  if (typeof body.nick === "string") {
    const nick = body.nick.trim();
    if (validator.isEmpty(nick)) errors.push("nick cannot be empty");
    else update.nick = nick;
  }

  if (typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (validator.isEmpty(email)) errors.push("email cannot be empty");
    else if (!validator.isEmail(email)) errors.push("email is invalid");
    else update.email = email;
  }

  if (typeof body.role === "string") {
    const role = body.role.trim();
    if (!allowedRoles.includes(role)) errors.push(`role must be one of: ${allowedRoles.join(", ")}`);
    else update.role = role;
  }

  // image solo si quieres permitir actualizarla por este endpoint
  if (typeof body.image === "string") {
    const image = body.image.trim();
    if (!validator.isEmpty(image)) update.image = image;
  }

  return { update, errors };
}

// CREATE
const createUser = async (req, res) => {
  try {
    const { name, nick, email, role, errors } = validateCreate(req.body);
    if (errors.length) {
      return res.status(400).json({ status: "error", message: "Validation failed", errors });
    }

    // Verificar duplicados (email/nick)
    const existing = await User.findOne({
      $or: [{ email }, { nick }],
    });

    if (existing) {
      const conflicts = [];
      if (existing.email === email) conflicts.push("email already in use");
      if (existing.nick === nick) conflicts.push("nick already in use");
      return res.status(409).json({ status: "error", message: "Conflict", errors: conflicts });
    }

    const user = new User({
      name,
      nick,
      email,
      role: role || undefined, // si no viene, toma default del schema
    });

    const saved = await user.save();
    return res.status(201).json({
      status: "success",
      message: "User created",
      user: saved,
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Error creating user", error: err.message });
  }
};

// LIST (con paginación simple)
const listUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      User.find({})
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    return res.status(200).json({
      status: "success",
      page,
      limit,
      total,
      items: items.length,
      users: items,
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Error listing users", error: err.message });
  }
};

// GET by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ status: "not_found", message: "User not found" });
    }

    return res.status(200).json({ status: "success", user });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Error retrieving user", error: err.message });
  }
};

// UPDATE
const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid user ID" });
    }

    const { update, errors } = validateUpdate(req.body);
    if (errors.length) {
      return res.status(400).json({ status: "error", message: "Validation failed", errors });
    }

    // Si actualiza email o nick, validar que no estén en uso por otro usuario
    const uniqueChecks = [];
    if (update.email) uniqueChecks.push({ email: update.email });
    if (update.nick) uniqueChecks.push({ nick: update.nick });

    if (uniqueChecks.length) {
      const conflict = await User.findOne({
        $or: uniqueChecks,
        _id: { $ne: id },
      });
      if (conflict) {
        const conflicts = [];
        if (update.email && conflict.email === update.email) conflicts.push("email already in use");
        if (update.nick && conflict.nick === update.nick) conflicts.push("nick already in use");
        return res.status(409).json({ status: "error", message: "Conflict", errors: conflicts });
      }
    }

    const updated = await User.findByIdAndUpdate(id, update, { new: true });
    if (!updated) {
      return res.status(404).json({ status: "not_found", message: "User not found" });
    }

    return res.status(200).json({ status: "success", message: "User updated", user: updated });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Error updating user", error: err.message });
  }
};

// DELETE
const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid user ID" });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ status: "not_found", message: "User not found" });
    }

    return res.status(200).json({ status: "success", message: "User deleted", user: deleted });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Error deleting user", error: err.message });
  }
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
