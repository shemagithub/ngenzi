import Team from '../models/teamModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';
import imagekit, { isImageKitConfigured } from '../config/imagekit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to save image
const saveImage = async (file, teamId) => {
  if (!file) return null;

  try {
    let imageUrl = null;

    // Try ImageKit upload first
    if (isImageKitConfigured) {
      try {
        const imageKitResponse = await imagekit.upload({
          file: fs.readFileSync(file.path),
          fileName: `team-${teamId}-${Date.now()}.${file.originalname.split('.').pop()}`,
          folder: '/teams'
        });
        imageUrl = imageKitResponse.url;
        console.log('✅ ImageKit upload successful:', imageUrl);
      } catch (imageKitError) {
        console.error('❌ ImageKit upload failed:', imageKitError.message);
      }
    }

    // Fallback to local storage
    if (!imageUrl) {
      const uploadDir = path.join(__dirname, '../uploads/teams');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uniqueFileName = `team-${teamId}-${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, uniqueFileName);
      fs.copyFileSync(file.path, filePath);
      imageUrl = `/uploads/teams/${uniqueFileName}`;
      console.log('✅ Local image saved:', imageUrl);
    }

    // Delete temporary file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return imageUrl;
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
};

// Get all teams (public)
export const getTeams = async (req, res) => {
  try {
    const { isActive } = req.query;
    const whereClause = {};

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const teams = await Team.findAll({
      where: whereClause,
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

    const teamsData = teams.map(team => {
      const teamData = team.toJSON();
      
      // Convert image path to full URL if it's a local path
      if (teamData.image && teamData.image.startsWith('/uploads/teams/')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        teamData.image = `${baseUrl}${teamData.image}`;
      }
      
      return teamData;
    });

    res.json({
      success: true,
      teams: teamsData
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch teams'
    });
  }
};

// Get single team (public)
export const getTeam = async (req, res) => {
  try {
    const { id } = req.params;
    
    const team = await Team.findByPk(id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    const teamData = team.toJSON();
    
    // Convert image path to full URL if it's a local path
    if (teamData.image && teamData.image.startsWith('/uploads/teams/')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      teamData.image = `${baseUrl}${teamData.image}`;
    }

    res.json({
      success: true,
      team: teamData
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch team'
    });
  }
};

// Get all teams (admin)
export const getAllTeams = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { position: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const teams = await Team.findAll({
      where: whereClause,
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

    const teamsData = teams.map(team => {
      const teamData = team.toJSON();
      
      // Convert image path to full URL if it's a local path
      if (teamData.image && teamData.image.startsWith('/uploads/teams/')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        teamData.image = `${baseUrl}${teamData.image}`;
      }
      
      return teamData;
    });

    res.json({
      success: true,
      teams: teamsData
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch teams'
    });
  }
};

// Add team member
export const addTeam = async (req, res) => {
  try {
    const { name, position, bio, email, phone, socialLinks, order, isActive } = req.body;
    const imageFile = req.files?.image?.[0];

    if (!name || !position) {
      return res.status(400).json({
        success: false,
        message: 'Name and position are required'
      });
    }

    // Create team member first to get ID
    const teamData = {
      name,
      position,
      bio: bio || null,
      email: email || null,
      phone: phone || null,
      order: order ? parseInt(order) : 0,
      isActive: isActive !== undefined ? isActive === 'true' : true,
      socialLinks: socialLinks ? (typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks) : {}
    };

    const team = await Team.create(teamData);

    // Handle image upload
    if (imageFile) {
      const imageUrl = await saveImage(imageFile, team.id);
      if (imageUrl) {
        await team.update({ image: imageUrl });
      }
    }

    const teamResponse = team.toJSON();
    if (teamResponse.image && teamResponse.image.startsWith('/uploads/teams/')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      teamResponse.image = `${baseUrl}${teamResponse.image}`;
    }

    res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      team: teamResponse
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add team member'
    });
  }
};

// Update team member
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, bio, email, phone, socialLinks, order, isActive } = req.body;
    const imageFile = req.files?.image?.[0];

    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    const updateData = {
      name: name || team.name,
      position: position || team.position,
      bio: bio !== undefined ? bio : team.bio,
      email: email !== undefined ? email : team.email,
      phone: phone !== undefined ? phone : team.phone,
      order: order !== undefined ? parseInt(order) : team.order,
      isActive: isActive !== undefined ? isActive === 'true' : team.isActive,
      socialLinks: socialLinks ? (typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks) : team.socialLinks
    };

    // Handle image upload
    if (imageFile) {
      const imageUrl = await saveImage(imageFile, team.id);
      if (imageUrl) {
        updateData.image = imageUrl;
      }
    }

    await team.update(updateData);

    const teamResponse = team.toJSON();
    if (teamResponse.image && teamResponse.image.startsWith('/uploads/teams/')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      teamResponse.image = `${baseUrl}${teamResponse.image}`;
    }

    res.json({
      success: true,
      message: 'Team member updated successfully',
      team: teamResponse
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update team member'
    });
  }
};

// Delete team member
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Delete image file if exists
    if (team.image && team.image.startsWith('/uploads/teams/')) {
      const imagePath = path.join(__dirname, '..', team.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await team.destroy();

    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete team member'
    });
  }
};










