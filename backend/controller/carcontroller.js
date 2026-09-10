import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import imagekit, { isImageKitConfigured } from "../config/imagekit.js";
import Car from "../models/carmodel.js";
import { persistYoutubeForDb, resolveYoutubeRawFromRequest, hasYoutubeUrlQuery } from "../utils/youtubeUrl.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseArrayField = (body, fieldName) => {
  const raw = body[fieldName];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [raw];
    } catch {
      return [raw];
    }
  }
  const keys = Object.keys(body).filter((k) => k.startsWith(`${fieldName}[`));
  if (keys.length > 0) {
    return keys
      .sort((a, b) => {
        const indexA = parseInt(a.match(/\[(\d+)\]/)?.[1] || "0");
        const indexB = parseInt(b.match(/\[(\d+)\]/)?.[1] || "0");
        return indexA - indexB;
      })
      .map((k) => body[k])
      .filter(Boolean);
  }
  return [];
};

const normalizeJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
};

const toFullUrls = (data, baseUrl) => {
  if (data.frontImage?.startsWith("/uploads/")) {
    data.frontImage = `${baseUrl}${data.frontImage}`;
  }
  data.image = normalizeJsonArray(data.image).map((img) =>
    typeof img === "string" && img.startsWith("/uploads/") ? `${baseUrl}${img}` : img
  );
  data.features = normalizeJsonArray(data.features);
  return data;
};

const saveImage = async (imageFile, isFrontImage = false) => {
  if (!imageFile) return null;

  if (isImageKitConfigured && imagekit) {
    try {
      const filePath = imageFile.path;
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const folderPath = isFrontImage ? "Car/Front" : "Car";
        const result = await imagekit.upload({
          file: fileBuffer,
          fileName: imageFile.originalname,
          folder: folderPath,
        });
        fs.unlink(filePath, () => {});
        return result.url;
      }
    } catch {
      // fall through to local storage
    }
  }

  try {
    const uploadsDir = path.join(__dirname, "..", "uploads", "cars");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const filePath = imageFile.path;
    if (!filePath || !fs.existsSync(filePath)) return null;

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(imageFile.originalname) || ".jpg";
    const baseName = path.basename(imageFile.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
    const prefix = isFrontImage ? "front-" : "";
    const newFileName = `${prefix}car-${timestamp}-${randomSuffix}-${baseName}${ext}`;
    const newFilePath = path.join(uploadsDir, newFileName);

    fs.copyFileSync(filePath, newFilePath);
    if (fs.existsSync(newFilePath)) {
      try { fs.unlinkSync(filePath); } catch { /* ignore */ }
      return `/uploads/cars/${newFileName}`;
    }
  } catch (err) {
    console.error("Car image save error:", err.message);
  }
  return null;
};

const addcar = async (req, res) => {
  try {
    await Car.sync({ alter: false });

    const features = parseArrayField(req.body, "features");
    const title = req.body.title?.trim();
    const brand = req.body.brand?.trim();
    const model = req.body.model?.trim();
    const year = parseInt(req.body.year, 10);
    const mileage = parseInt(req.body.mileage, 10) || 0;
    const mileageUnit = req.body.mileageUnit?.trim() || "km";
    const fuelType = req.body.fuelType?.trim();
    const transmission = req.body.transmission?.trim();
    const color = req.body.color?.trim() || null;
    const condition = req.body.condition?.trim() || "Used";
    const bodyType = req.body.bodyType?.trim() || null;
    const engineSize = req.body.engineSize?.trim() || null;
    const vin = req.body.vin?.trim() || null;
    const location = req.body.location?.trim();
    const price = parseFloat(req.body.price);
    const availability = req.body.availability?.trim();
    const description = req.body.description?.trim();
    const phone = req.body.phone?.trim() || "";

    if (!title || !brand || !model || !location || !availability || !description || !fuelType || !transmission) {
      return res.status(400).json({
        message: "Missing required fields: title, brand, model, location, availability, description, fuelType, and transmission are required",
        success: false,
      });
    }
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      return res.status(400).json({ message: "Invalid year", success: false });
    }
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ message: "Invalid price", success: false });
    }

    const ytResolved = resolveYoutubeRawFromRequest(req, ["x-car-youtube-url", "x-youtube-url"]);
    const youtubeUrl = persistYoutubeForDb(ytResolved);

    const frontImageFile = req.files?.frontImage?.[0];
    const images = [req.files?.image1?.[0], req.files?.image2?.[0], req.files?.image3?.[0], req.files?.image4?.[0]].filter(Boolean);

    const frontImageUrl = frontImageFile ? await saveImage(frontImageFile, true) : null;
    const imageUrls = (await Promise.all(images.map((img) => saveImage(img, false)))).filter(Boolean);

    const carData = {
      title,
      brand,
      model,
      year,
      mileage,
      mileageUnit,
      fuelType,
      transmission,
      color,
      condition,
      bodyType,
      engineSize,
      vin,
      location,
      price,
      frontImage: frontImageUrl,
      image: imageUrls,
      availability,
      description,
      features,
      phone: phone || "N/A",
      youtubeUrl,
    };

    const car = await Car.create(carData);
    const savedData = toFullUrls(car.get({ plain: true }), `${req.protocol}://${req.get("host")}`);

    res.json({ message: "Car added successfully", success: true, car: savedData });
  } catch (error) {
    console.error("Error adding car:", error);
    res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};

const listcar = async (req, res) => {
  try {
    let cars;
    try {
      cars = await Car.findAll({ order: [["createdAt", "DESC"]] });
    } catch (dbErr) {
      const missingTable =
        dbErr?.parent?.code === "ER_NO_SUCH_TABLE" ||
        String(dbErr?.message || "").includes("doesn't exist");
      const badColumn =
        dbErr?.parent?.code === "ER_BAD_FIELD_ERROR" ||
        String(dbErr?.message || "").toLowerCase().includes("unknown column");

      if (missingTable || badColumn) {
        console.warn("⚠️  cars table missing/outdated — syncing…");
        await Car.sync({ alter: true });
        cars = await Car.findAll({ order: [["createdAt", "DESC"]] });
      } else {
        throw dbErr;
      }
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const carData = (cars || []).map((c) => toFullUrls(c.toJSON(), baseUrl));
    return res.json({ success: true, cars: carData });
  } catch (error) {
    console.error("Error listing cars:", error?.message || error);
    // Prefer empty list over hard 500 so the Cars page still loads
    return res.status(200).json({
      success: true,
      cars: [],
      message: "No cars available yet",
      warning: error?.message || "Database error",
    });
  }
};

const removecar = async (req, res) => {
  try {
    const deletedCount = await Car.destroy({ where: { id: req.body.id } });
    if (deletedCount === 0) {
      return res.status(404).json({ message: "Car not found", success: false });
    }
    return res.json({ message: "Car removed successfully", success: true });
  } catch (error) {
    console.error("Error removing car:", error);
    return res.status(500).json({ message: "Server Error", success: false });
  }
};

const updatecar = async (req, res) => {
  try {
    const carId = req.body.id;
    if (!carId) {
      return res.status(400).json({ message: "Car ID is required", success: false });
    }

    const features = parseArrayField(req.body, "features");
    const updateData = {};

    if (req.body.title) updateData.title = req.body.title.trim();
    if (req.body.brand) updateData.brand = req.body.brand.trim();
    if (req.body.model) updateData.model = req.body.model.trim();
    if (req.body.year) updateData.year = parseInt(req.body.year, 10);
    if (req.body.mileage !== undefined) updateData.mileage = parseInt(req.body.mileage, 10) || 0;
    if (req.body.mileageUnit) updateData.mileageUnit = req.body.mileageUnit.trim();
    if (req.body.fuelType) updateData.fuelType = req.body.fuelType.trim();
    if (req.body.transmission) updateData.transmission = req.body.transmission.trim();
    if (req.body.color !== undefined) updateData.color = req.body.color?.trim() || null;
    if (req.body.condition) updateData.condition = req.body.condition.trim();
    if (req.body.bodyType !== undefined) updateData.bodyType = req.body.bodyType?.trim() || null;
    if (req.body.engineSize !== undefined) updateData.engineSize = req.body.engineSize?.trim() || null;
    if (req.body.vin !== undefined) updateData.vin = req.body.vin?.trim() || null;
    if (req.body.location) updateData.location = req.body.location.trim();
    if (req.body.price) updateData.price = parseFloat(req.body.price);
    if (req.body.availability) updateData.availability = req.body.availability.trim();
    if (req.body.description) updateData.description = req.body.description.trim();
    if (req.body.phone) updateData.phone = req.body.phone.trim();
    if (features.length > 0) updateData.features = features;

    const hasYoutubeBodyKey =
      req.body &&
      typeof req.body === "object" &&
      Object.keys(req.body).some((k) => {
        const nk = k.toLowerCase().replace(/_/g, "");
        return nk === "youtubeurl" || (/youtube/i.test(k) && /url/i.test(k));
      });
    const hasYoutubeHeader = ["x-car-youtube-url", "x-youtube-url"].some((h) => req.get(h) != null);
    const hasYoutubeQuery = hasYoutubeUrlQuery(req);
    if (hasYoutubeBodyKey || hasYoutubeHeader || hasYoutubeQuery) {
      const ytResolved = resolveYoutubeRawFromRequest(req, ["x-car-youtube-url", "x-youtube-url"]);
      updateData.youtubeUrl = persistYoutubeForDb(ytResolved);
    }

    const frontImageFile = req.files?.frontImage?.[0];
    const newImages = [req.files?.image1?.[0], req.files?.image2?.[0], req.files?.image3?.[0], req.files?.image4?.[0]].filter(Boolean);

    if (frontImageFile) {
      const url = await saveImage(frontImageFile, true);
      if (url) updateData.frontImage = url;
    }

    if (newImages.length > 0) {
      const existingCar = await Car.findByPk(carId);
      const existingImages = normalizeJsonArray(existingCar?.image);
      const newUrls = (await Promise.all(newImages.map((img) => saveImage(img, false)))).filter(Boolean);
      updateData.image = [...existingImages, ...newUrls];
    }

    const [updatedCount] = await Car.update(updateData, { where: { id: carId }, omitNull: false });
    if (updatedCount === 0) {
      return res.status(404).json({ message: "Car not found", success: false });
    }

    const updatedCar = await Car.findByPk(carId);
    res.json({ message: "Car updated successfully", success: true, car: updatedCar });
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ message: error.message || "Server Error", success: false });
  }
};

const singlecar = async (req, res) => {
  try {
    const carId = parseInt(req.params.id, 10);
    if (isNaN(carId) || carId <= 0) {
      return res.status(400).json({ message: "Invalid car ID", success: false });
    }

    let car;
    try {
      car = await Car.findByPk(carId);
    } catch (dbErr) {
      const missingTable =
        dbErr?.parent?.code === "ER_NO_SUCH_TABLE" ||
        String(dbErr?.message || "").includes("doesn't exist");
      const badColumn =
        dbErr?.parent?.code === "ER_BAD_FIELD_ERROR" ||
        String(dbErr?.message || "").toLowerCase().includes("unknown column");
      if (missingTable || badColumn) {
        await Car.sync({ alter: true });
        car = await Car.findByPk(carId);
      } else {
        throw dbErr;
      }
    }

    if (!car) {
      return res.status(404).json({ message: "Car not found", success: false });
    }

    const carData = toFullUrls(car.toJSON(), `${req.protocol}://${req.get("host")}`);
    return res.json({ success: true, car: carData });
  } catch (error) {
    console.error("Error fetching car:", error?.message || error);
    return res.status(500).json({ message: error?.message || "Server Error", success: false });
  }
};

export { addcar, listcar, removecar, updatecar, singlecar };
