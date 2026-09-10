import Stats from "../models/statsModel.js";
import Property from "../models/propertymodel.js";
import Appointment from "../models/appointmentModel.js";
import User from "../models/Usermodel.js";
import Plot from "../models/plotmodel.js";
import Testimonial from "../models/testimonialModel.js";
import Blog from "../models/blogModel.js";
import Service from "../models/serviceModel.js";
import Team from "../models/teamModel.js";
import { sendEmail, getDefaultFrom } from "../config/nodemailer.js";
import { getEmailTemplate } from "../email.js";
import { Op } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const formatRecentProperties = (properties) => {
  return properties.map((property) => ({
    type: "property",
    description: `New property listed: ${property.title}`,
    timestamp: property.createdAt,
  }));
};

const formatRecentAppointments = (appointments) => {
  return appointments.map((appointment) => ({
    type: "appointment",
    description:
      appointment.user && appointment.property
        ? `${appointment.user.name} scheduled viewing for ${appointment.property.title}`
        : "Appointment scheduled (details unavailable)",
    timestamp: appointment.createdAt,
  }));
};

// Add these helper functions before the existing exports
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalProperties,
      activeListings,
      totalUsers,
      totalAdmins,
      totalPlots,
      activePlots,
      totalTestimonials,
      activeTestimonials,
      featuredTestimonials,
      totalBlogs,
      publishedBlogs,
      totalServices,
      activeServices,
      totalTeams,
      activeTeams,
      pendingAppointments,
      confirmedAppointments,
      totalAppointments,
      recentActivity,
      viewsData,
      propertyTypeData,
    ] = await Promise.all([
      Property.count(),
      Property.count({ where: { availability: "active" } }),
      User.count(),
      User.count({ where: { role: "admin" } }),
      Plot.count(),
      Plot.count({ where: { availability: "active" } }),
      Testimonial.count(),
      Testimonial.count({ where: { isActive: true } }),
      Testimonial.count({ where: { isFeatured: true } }),
      Blog.count(),
      Blog.count({ where: { isPublished: true } }),
      Service.count(),
      Service.count({ where: { isActive: true } }),
      Team.count(),
      Team.count({ where: { isActive: true } }),
      Appointment.count({ where: { status: "pending" } }),
      Appointment.count({ where: { status: "confirmed" } }),
      Appointment.count(),
      getRecentActivity(),
      getViewsData(),
      getPropertyTypeData(),
    ]);

    res.json({
      success: true,
      stats: {
        totalProperties,
        activeListings,
        totalUsers,
        totalAdmins,
        regularUsers: totalUsers - totalAdmins,
        totalPlots,
        activePlots,
        totalTestimonials,
        activeTestimonials,
        featuredTestimonials,
        totalBlogs,
        publishedBlogs,
        totalServices,
        activeServices,
        totalTeams,
        activeTeams,
        pendingAppointments,
        confirmedAppointments,
        totalAppointments,
        recentActivity,
        viewsData,
        propertyTypeData,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin statistics",
    });
  }
};

const formatRecentPlots = (plots) => {
  return plots.map((plot) => ({
    type: "plot",
    description: `New plot listed: ${plot.title}`,
    timestamp: plot.createdAt,
  }));
};

const formatRecentTestimonials = (testimonials) => {
  return testimonials.map((testimonial) => ({
    type: "testimonial",
    description: `New testimonial from ${testimonial.name}`,
    timestamp: testimonial.createdAt,
  }));
};

const formatRecentUsers = (users) => {
  return users.map((user) => ({
    type: "user",
    description: `New user registered: ${user.name || user.email}`,
    timestamp: user.createdAt,
  }));
};

const getRecentActivity = async () => {
  try {
    const [recentProperties, recentPlots, recentTestimonials, recentUsers, recentAppointments] = await Promise.all([
      Property.findAll({
        attributes: ["title", "createdAt"],
        order: [["createdAt", "DESC"]],
        limit: 3
      }),
      Plot.findAll({
        attributes: ["title", "createdAt"],
        order: [["createdAt", "DESC"]],
        limit: 3
      }),
      Testimonial.findAll({
        attributes: ["name", "createdAt"],
        order: [["createdAt", "DESC"]],
        limit: 3
      }),
      User.findAll({
        attributes: ["name", "email", "createdAt"],
        order: [["createdAt", "DESC"]],
        limit: 3
      }),
      Appointment.findAll({
        order: [["createdAt", "DESC"]],
        limit: 3,
        include: [
          { model: Property, as: "property", attributes: ["title"] },
          { model: User, as: "user", attributes: ["name"] }
        ]
      })
    ]);

    // Filter out appointments with missing user or property data
    const validAppointments = recentAppointments.filter(
      (appointment) => appointment.userId && appointment.propertyId
    );

    return [
      ...formatRecentProperties(recentProperties),
      ...formatRecentPlots(recentPlots),
      ...formatRecentTestimonials(recentTestimonials),
      ...formatRecentUsers(recentUsers),
      ...formatRecentAppointments(validAppointments),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10); // Limit to 10 most recent
  } catch (error) {
    console.error("Error getting recent activity:", error);
    return [];
  }
};

const getPropertyTypeData = async () => {
  try {
    const properties = await Property.findAll({
      attributes: ['type'],
      raw: true
    });

    const typeCounts = {};
    properties.forEach(property => {
      const type = property.type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const colors = [
      'rgba(59, 130, 246, 0.8)',   // blue
      'rgba(16, 185, 129, 0.8)',   // green
      'rgba(245, 158, 11, 0.8)',   // amber
      'rgba(239, 68, 68, 0.8)',    // red
      'rgba(139, 92, 246, 0.8)',   // purple
      'rgba(236, 72, 153, 0.8)',   // pink
    ];

    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);
    const backgroundColors = labels.map((_, index) => colors[index % colors.length]);

    return {
      labels,
      datasets: [{
        label: 'Properties by Type',
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(c => c.replace('0.8', '1')),
        borderWidth: 2,
      }],
    };
  } catch (error) {
    console.error("Error getting property type data:", error);
    return {
      labels: [],
      datasets: [{
        label: 'Properties by Type',
        data: [],
        backgroundColor: [],
      }],
    };
  }
};

const getViewsData = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Stats.findAll({
      where: {
        endpoint: { [Op.like]: '/api/products/single/%' },
        method: "GET",
        timestamp: { [Op.gte]: thirtyDaysAgo },
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('timestamp')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('timestamp'))],
      order: [[sequelize.fn('DATE', sequelize.col('timestamp')), 'ASC']],
      raw: true
    });

    // Generate dates for last 30 days
    const labels = [];
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      labels.push(dateString);

      const stat = stats.find((s) => s.date === dateString);
      data.push(stat ? parseInt(stat.count) : 0);
    }

    return {
      labels,
      datasets: [
        {
          label: "Property Views",
          data,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  } catch (error) {
    console.error("Error generating chart data:", error);
    return {
      labels: [],
      datasets: [
        {
          label: "Property Views",
          data: [],
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }
};

// Add these new controller functions
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: Property, as: "property", attributes: ["title", "location"] },
        { model: User, as: "user", attributes: ["name", "email"] }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Property, as: "property" },
        { model: User, as: "user" }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = status;
    await appointment.save();

    // Send email notification using the template from email.js
    const mailOptions = {
      from: getDefaultFrom(),
      to: appointment.user.email,
      subject: `Viewing Appointment ${
        status.charAt(0).toUpperCase() + status.slice(1)
      } — NGENZI REALESTATE`,
      html: getEmailTemplate(appointment, status),
    };

    await sendEmail(mailOptions);

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment",
    });
  }
};
