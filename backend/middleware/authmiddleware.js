import jwt from "jsonwebtoken";
import userModel from "../models/Usermodel.js";
import Appointment from "../models/appointmentModel.js";
import { Op } from "sequelize";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Handle admin tokens (from env-based login) that might only have email
    if (decoded.email && decoded.role === 'admin' && !decoded.id) {
      // For env-based admin login, check if user exists in DB or allow
      const adminUser = await userModel.findOne({ 
        where: { email: decoded.email, role: 'admin' },
        attributes: { exclude: ['password'] }
      });
      
      if (adminUser) {
        req.user = adminUser;
        req.user.role = 'admin';
        return next();
      }
      
      // If not in DB but has admin role in token, allow (backward compatibility)
      if (decoded.role === 'admin') {
        req.user = { email: decoded.email, role: 'admin', id: null };
        return next();
      }
    }
    
    // Regular user authentication
    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    
    const user = await userModel.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};

// In backend/middleware/authmiddleware.js
export const checkAppointmentOwnership = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this appointment",
      });
    }

    req.appointment = appointment;
    next();
  } catch (error) {
    console.error("Error checking appointment ownership:", error);
    res.status(500).json({
      success: false,
      message: "Error checking appointment ownership",
    });
  }
};

// Admin middleware - checks if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
      });
    }
    
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }
    
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking admin status",
    });
  }
};

export default protect;
