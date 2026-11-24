import express from "express";
import { requireLogin } from "../auth/authMiddleware.js";
import { fetchLatestVersion, getImageProjects, getImageData, uploadImageVersion, uploadImageProject, deleteImageVersion, deleteImageProject, renameImageProject } from "./imageController.js"

const router = express.Router();

//List user's image project names and uuids.
router.get("/", requireLogin, getImageProjects);

//Get the latest version number of an image project and its file extension.
router.get("/:imageId/versions/latest", requireLogin, fetchLatestVersion);

//Download a given version of an image project, returns a Blob which can be loaded into canvas or saved to disk.
router.get("/:imageId/versions/:version/download", requireLogin, getImageData);

//Upload a new version to an existing image project, optionally with a new file extension if it has changed format.
router.post("/:imageId/upload{/:extension}", requireLogin, express.raw({ type: "image/*", limit: "20mb" }), uploadImageVersion);

//Upload a new image project.
router.post("/upload/:filename", requireLogin, express.raw({ type: "image/*", limit: "20mb" }), uploadImageProject);

//Rename an existing image project.
router.post("/:imageId/rename/:newName", requireLogin, renameImageProject);

//Delete a version of an image project.
router.delete("/:imageId/versions/:version", requireLogin, deleteImageVersion);

//Delete all versions of an image project.
router.delete("/:imageId/", requireLogin, deleteImageProject);
export default router;
