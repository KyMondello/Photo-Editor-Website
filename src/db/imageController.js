import { listImageProjects, getLatestVersion, downloadVersion, uploadVersion, uploadProject, deleteVersion, deleteProject, renameImage } from "../db/imageStorage.js";

export async function getImageProjects(req, res) {
  //Require authentication before request.
  const result = await listImageProjects(req.user.id);

  if (!result.success) {
    return res.status(500).json({ message: result.message, code: result.code })
  }

  return res.status(200).json(result.data);
}

export async function fetchLatestVersion(req, res) {
  const { imageId } = req.params;
  const userId = req.user.id;

  const result = await getLatestVersion(userId, imageId);

  if (!result.success) {
    return res.status(500).json({ message: result.message, code: result.code })
  }

  return res.status(200).json(result.data);
}

//download an image version
export async function getImageData(req, res) {
  const userId = req.user.id;
  const { imageId, version } = req.params;

  const result = await downloadVersion(userId, imageId, version);

  if (!result.success) {
    return res.status(404).json({ message: result.message, code: result.code })
  }

  const imageBuffer = Buffer.from(await result.data.arrayBuffer());
  return res.send(imageBuffer);
}

//download latest image version
export async function getLatestData(req, res) {
  const userId = req.user.id;
  const { imageId } = req.params;

  const result = await downloadLatest(userId, imageId);

  if (!result.success) {
    return res.status(404).json({ message: result.message, code: result.code })
  }

  const imageBuffer = Buffer.from(await result.data.arrayBuffer());
  return res.send(imageBuffer);
}

//Upload an image version
export async function uploadImageVersion(req, res) {
  const userId = req.user.id;
  const { imageId, extension } = req.params;
  const imageData = req.body;

  const result = await uploadVersion(
    userId,
    imageData,
    imageId,
    extension
  );

  if (!result.success) {
    return res.status(500).json({ message: result.message, code: result.code })
  }

  return res.status(200).json({
    message: "Image uploaded."
  });
}

//Upload an image project
export async function uploadImageProject(req, res) {
  const userId = req.user.id;
  const { filename } = req.params;
  const imageData = req.body;

  const result = await uploadProject(
    userId,
    imageData,
    filename
  );

  if (!result.success) {
    return res.status(500).json({ message: result.message, code: result.code })
  }

  return res.status(200).json({
    message: "Image uploaded.",
    imageId: result.data.imageId
  });
}

//Delete an image version
export async function deleteImageVersion(req, res) {
  const userId = req.user.id;
  const { imageId, version } = req.params;

  const result = await deleteVersion(
    userId,
    imageId,
    version
  );

  if (!result.success) {
    return res.status(500).json({ message: result.message, code: result.code })
  }

  return res.status(200).json({
    message: "Deleted version."
  });
}

//Delete an image project
export async function deleteImageProject(req, res) {
  const userId = req.user.id;
  const { imageId } = req.params;

  const result = await deleteProject(
    userId,
    imageId
  );

  if (!result.success) {
    return res.status(500).json({ message: result.message, code: result.code })
  }

  return res.status(200).json({
    message: "Deleted project."
  });
}

//Rename an image project
export async function renameImageProject(req, res) {
  const userId = req.user.id;
  const { imageId, newName } = req.params;

  const result = await renameImage(userId, imageId, newName);

  if (!result.success) {
    return res.status(500).json({ message: result.message, code: result.code })
  }

  return res.status(200).json({
    message: "Image renamed."
  });
}
