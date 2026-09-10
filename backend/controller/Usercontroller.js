import express from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import validator from "validator";
import crypto from "crypto";
import userModel from "../models/Usermodel.js";
import transporter, { getDefaultFrom } from "../config/nodemailer.js";
import { getWelcomeTemplate } from "../email.js";
import { getPasswordResetTemplate } from "../email.js";

const backendurl = process.env.BACKEND_URL;

const createtoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

dotenv.config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const Registeruser = await userModel.findOne({
      where: { email: String(email || "").trim().toLowerCase() },
    });
    if (!Registeruser) {
      return res.status(400).json({ message: "Email not found", success: false });
    }
    const isMatch = await bcrypt.compare(password, Registeruser.password);
    if (isMatch) {
      const token = createtoken(Registeruser.id);
      return res.json({ token, user: { name: Registeruser.name, email: Registeruser.email }, success: true });
    }
    return res.status(400).json({ message: "Invalid password", success: false });
  } catch (error) {
    console.error("Login error:", error?.message || error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required", success: false });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters", success: false });
    }
    if (!validator.isEmail(String(email).trim())) {
      return res.status(400).json({ message: "Invalid email", success: false });
    }
    if (!process.env.JWT_SECRET) {
      console.error("Register error: JWT_SECRET is not set");
      return res.status(500).json({ message: "Server misconfiguration", success: false });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await userModel.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({
        message: "Email already registered. Please sign in.",
        success: false,
        code: "EMAIL_EXISTS",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });
    const token = createtoken(newUser.id);

    // Welcome email is best-effort — never fail signup if SMTP is down
    try {
      if (transporter) {
        await transporter.sendMail({
          from: getDefaultFrom(),
          to: normalizedEmail,
          subject: "Welcome to NGENZI REALESTATE — Your account is ready",
          html: getWelcomeTemplate(name),
        });
      }
    } catch (mailErr) {
      console.warn("⚠️  Welcome email skipped:", mailErr?.message || mailErr);
    }

    return res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      success: true,
    });
  } catch (error) {
    if (error?.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Email already registered. Please sign in.",
        success: false,
        code: "EMAIL_EXISTS",
      });
    }
    console.error("Register error:", error?.message || error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ where: { email: String(email || "").trim().toLowerCase() } });
    if (!user) {
      return res.status(404).json({ message: "Email not found", success: false });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    const resetUrl = `${process.env.WEBSITE_URL}/reset/${resetToken}`;

    if (!transporter) {
      return res.status(503).json({
        message: "Email service is not configured. Contact support to reset your password.",
        success: false,
      });
    }

    try {
      await transporter.sendMail({
        from: getDefaultFrom(),
        to: user.email,
        subject: "Reset your NGENZI REALESTATE password",
        html: getPasswordResetTemplate(resetUrl),
      });
    } catch (mailErr) {
      console.warn("⚠️  Password reset email failed:", mailErr?.message || mailErr);
      return res.status(503).json({
        message: "Could not send reset email. Check SMTP settings or try again later.",
        success: false,
      });
    }

    return res.status(200).json({ message: "Email sent", success: true });
  } catch (error) {
    console.error("Forgot password error:", error?.message || error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const resetpassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await userModel.findOne({
      where: {
        resetToken: token,
        resetTokenExpire: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token", success: false });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();
    return res.status(200).json({ message: "Password reset successful", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("Admin login error: JWT_SECRET is not set");
      return res.status(500).json({
        message: "Server misconfiguration: JWT_SECRET missing",
        success: false,
      });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const passwordNorm = String(password).trim();
    // Strip accidental quotes/spaces from cPanel .env values
    const strip = (v) => String(v || "").trim().replace(/^['"]|['"]$/g, "");
    const envEmail = strip(process.env.ADMIN_EMAIL).toLowerCase();
    const envPass = strip(process.env.ADMIN_PASSWORD);

    // Env credentials — always work if set in .env
    if (envEmail && envPass && emailNorm === envEmail && passwordNorm === envPass) {
      let envAdmin = null;
      try {
        envAdmin = await userModel.findOne({ where: { email: emailNorm } });
        const hash = await bcrypt.hash(passwordNorm, 10);
        if (!envAdmin) {
          envAdmin = await userModel.create({
            name: process.env.ADMIN_NAME || "Admin User",
            email: emailNorm,
            password: hash,
            role: "admin",
          });
        } else {
          await envAdmin.update({ role: "admin", password: hash });
        }
      } catch (ensureErr) {
        console.warn("⚠️  Could not ensure admin row:", ensureErr?.message || ensureErr);
      }

      const token = jwt.sign(
        {
          id: envAdmin?.id,
          email: emailNorm,
          role: "admin",
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      console.log(`✅ Admin login via .env: ${emailNorm}`);
      return res.json({
        token,
        success: true,
        user: {
          id: envAdmin?.id,
          name: envAdmin?.name || "Admin",
          email: emailNorm,
          role: "admin",
        },
      });
    }

    // Database admin user
    let adminUser;
    try {
      adminUser = await userModel.findOne({
        where: {
          email: emailNorm,
          role: "admin",
        },
      });
    } catch (dbErr) {
      const missing =
        dbErr?.parent?.code === "ER_NO_SUCH_TABLE" ||
        String(dbErr?.message || "").includes("doesn't exist");
      if (missing) {
        console.warn("⚠️  users table missing — creating tables…");
        await userModel.sync({ alter: false });
        if (envEmail && envPass && emailNorm === envEmail && passwordNorm === envPass) {
          const hash = await bcrypt.hash(passwordNorm, 10);
          adminUser = await userModel.create({
            name: process.env.ADMIN_NAME || "Admin User",
            email: emailNorm,
            password: hash,
            role: "admin",
          });
        } else {
          adminUser = await userModel.findOne({
            where: { email: emailNorm, role: "admin" },
          });
        }
      } else {
        throw dbErr;
      }
    }

    if (!adminUser) {
      console.log(`Admin login failed: no admin for ${emailNorm}`);
      return res.status(400).json({
        message: "Invalid email or password. Use ADMIN_EMAIL / ADMIN_PASSWORD from the server .env",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(passwordNorm, adminUser.password);
    if (!isMatch) {
      console.log(`Admin login failed: bad password for ${emailNorm}`);
      return res.status(400).json({
        message: "Invalid email or password. Use ADMIN_EMAIL / ADMIN_PASSWORD from the server .env",
        success: false,
      });
    }

    const token = jwt.sign(
      {
        id: adminUser.id,
        email: adminUser.email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log(`✅ Admin login successful: ${adminUser.email}`);

    return res.json({
      token,
      success: true,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error?.message || error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

/**
 * One-time / emergency admin reset for hosting (no SSH needed).
 * POST /api/users/setup-admin
 * Body: { setupKey, email?, password? }
 * setupKey must equal SETUP_KEY or JWT_SECRET from server .env
 */
const setupAdmin = async (req, res) => {
  try {
    const setupKey = String(req.body?.setupKey || "").trim();
    const expected = String(process.env.SETUP_KEY || process.env.JWT_SECRET || "").trim();
    if (!expected || !setupKey || setupKey !== expected) {
      return res.status(403).json({ success: false, message: "Invalid setup key" });
    }

    const strip = (v) => String(v || "").trim().replace(/^['"]|['"]$/g, "");
    const email = strip(req.body?.email || process.env.ADMIN_EMAIL || "admin@buildestate.com").toLowerCase();
    const password = strip(req.body?.password || process.env.ADMIN_PASSWORD || "Admin@123");
    const name = strip(req.body?.name || process.env.ADMIN_NAME || "Admin User");

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password required" });
    }

    await userModel.sync({ alter: false });
    const hash = await bcrypt.hash(password, 10);
    let admin = await userModel.findOne({ where: { email } });
    if (!admin) {
      admin = await userModel.create({ name, email, password: hash, role: "admin" });
    } else {
      await admin.update({ password: hash, role: "admin", name: admin.name || name });
    }

    console.log(`✅ Admin reset via setup-admin: ${email}`);
    return res.json({
      success: true,
      message: "Admin ready. You can sign in now.",
      email,
    });
  } catch (error) {
    console.error("setupAdmin error:", error?.message || error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

const logout = async (req, res) => {
    try {
        return res.json({ message: "Logged out", success: true });
    } catch (error) {
        console.error(error);
        return res.json({ message: "Server error", success: false });
    }
};

// get name and email

const getname = async (req, res) => {
  try {
    const user = await userModel.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    // Return user data in expected format
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
}



const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ 
        message: "Name and email are required", 
        success: false 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        message: "Invalid email format", 
        success: false 
      });
    }

    // Check if email is already taken by another user
    const existingUser = await userModel.findOne({ 
      where: { email },
      attributes: ['id']
    });
    
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ 
        message: "Email is already in use", 
        success: false 
      });
    }

    // Update user
    const user = await userModel.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found", 
        success: false 
      });
    }

    user.name = name;
    user.email = email;
    await user.save();

    // Return updated user data
    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ 
      message: "Server error", 
      success: false 
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required", 
        success: false 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters long", 
        success: false 
      });
    }

    const user = await userModel.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found", 
        success: false 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: "Current password is incorrect", 
        success: false 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ 
      message: "Server error", 
      success: false 
    });
  }
};

// Admin user management functions
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.findAll({
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpire'] },
      order: [['createdAt', 'DESC']]
    });
    
    return res.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ 
      message: "Server error", 
      success: false 
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findByPk(id, {
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpire'] }
    });
    
    if (!user) {
      return res.status(404).json({ 
        message: "User not found", 
        success: false 
      });
    }
    
    return res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ 
      message: "Server error", 
      success: false 
    });
  }
};

const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    const user = await userModel.findByPk(id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found", 
        success: false 
      });
    }
    
    // Validate email if provided
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ 
        message: "Invalid email format", 
        success: false 
      });
    }
    
    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await userModel.findOne({ 
        where: { email },
        attributes: ['id']
      });
      
      if (existingUser && existingUser.id !== parseInt(id)) {
        return res.status(400).json({ 
          message: "Email is already in use", 
          success: false 
        });
      }
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ['user', 'admin'].includes(role)) user.role = role;
    
    await user.save();
    
    // Return updated user without sensitive data
    const updatedUser = await userModel.findByPk(id, {
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpire'] }
    });
    
    return res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ 
      message: "Server error", 
      success: false 
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (req.user && req.user.id === parseInt(id)) {
      return res.status(400).json({ 
        message: "You cannot delete your own account", 
        success: false 
      });
    }
    
    const user = await userModel.findByPk(id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found", 
        success: false 
      });
    }
    
    await user.destroy();
    
    return res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ 
      message: "Server error", 
      success: false 
    });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long", 
        success: false 
      });
    }
    
    const user = await userModel.findByPk(id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found", 
        success: false 
      });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    return res.json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ 
      message: "Server error", 
      success: false 
    });
  }
};

export { login, register, forgotpassword, resetpassword, adminlogin, setupAdmin, logout, getname, updateProfile, changePassword, getAllUsers, getUserById, updateUserByAdmin, deleteUser, resetUserPassword };