const express = require("express");
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("video"), async function (req, res) {
  try {
    const { username, title, avatar } = req.body;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Upload video to Cloudinary with the folder option
    const cloudinaryUploadResult = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",
      folder: "video", // Specify the folder here
    });

    const videoUrl = cloudinaryUploadResult.secure_url;

    const newVideo = await prisma.video.create({
      data: {
        username,
        title,
        avatar,
        videoUrl,
      },
    });

    res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      data: newVideo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error uploading video",
    });
  }
});

router.get("/videos", async (req, res) => {
  try {
    const videos = await prisma.video.findMany();
    res.json(videos);
  } catch (error) {
    console.error("Error retrieving videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/videos/:id", async (req, res) => {
  const videoId = parseInt(req.params.id);
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    console.error("Error retrieving video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/videos/:id", async (req, res) => {
  const videoId = parseInt(req.params.id);
  try {
    const deletedVideo = await prisma.video.delete({
      where: { id: videoId },
    });
    if (!deletedVideo) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
