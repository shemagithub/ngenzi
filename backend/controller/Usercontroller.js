import express from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import validator from "validator";
import crypto from "crypto";
import userModel from "../models/Usermodel.js";
import transporter from "../config/nodemailer.js";
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
    const Registeruser = await userModel.findOne({ where: { email } });
    if (!Registeruser) {
      return res.json({ message: "Email not found", success: false });
    }
    const isMatch = await bcrypt.compare(password, Registeruser.password);
    if (isMatch) {
      const token = createtoken(Registeruser.id);
      return res.json({ token, user: { name: Registeruser.name, email: Registeruser.email }, success: true });
    } else {
      return res.json({ message: "Invalid password", success: false });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Server error", success: false });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!validator.isEmail(email)) {
      return res.json({ message: "Invalid email", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({ name, email, password: hashedPassword });
    const token = createtoken(newUser.id);

    // send email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Welcome to BuildEstate - Your Account Has Been Created",
      html: getWelcomeTemplate(name)
    };

    await transporter.sendMail(mailOptions);

    return res.json({ token, user: { name: newUser.name, email: newUser.email }, success: true });
  } catch (error) {
    console.error(error);
    return res.json({ message: "Server error", success: false });
  }
};

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email not found", success: false });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    const resetUrl = `${process.env.WEBSITE_URL}/reset/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset - BuildEstate Security",
      html: getPasswordResetTemplate(resetUrl)
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent", success: true });
  } catch (error) {
    console.error(error);
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

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required", 
        success: false 
      });
    }

    // First check environment variables (for backward compatibility)
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      if (email.trim() === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return res.json({ 
          token, 
          success: true,
          user: { email, role: 'admin' }
        });
      }
    }

    // Check database for admin user
    const adminUser = await userModel.findOne({ 
      where: { 
        email: email.trim().toLowerCase(),
        role: 'admin'
      } 
    });

    if (!adminUser) {
      console.log(`Admin login attempt failed: User not found with email ${email}`);
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      console.log(`Admin login attempt failed: Invalid password for ${email}`);
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }

    // Generate token
    const token = jwt.sign({ 
      id: adminUser.id, 
      email: adminUser.email, 
      role: 'admin' 
    }, process.env.JWT_SECRET, { expiresIn: '24h' });

    console.log(`✅ Admin login successful: ${adminUser.email}`);

    return res.json({ 
      token, 
      success: true,
      user: { 
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email, 
        role: 'admin' 
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ 
      message: "Server error", 
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

export { login, register, forgotpassword, resetpassword, adminlogin, logout, getname, updateProfile, changePassword, getAllUsers, getUserById, updateUserByAdmin, deleteUser, resetUserPassword };