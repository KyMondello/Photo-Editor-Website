import supabaseClient from "./supabase.js";

/**
 * Uploads given image to file storage bucket and updates db tables.
 *
 * @param {Blob} imagedata - The raw image data to be uploaded.
 * @param {string} name - The image's file name including extension.
 * @param {string} userId - The current user's unique identifier.
 * @param {string|null} imageId - The image project's unique identifier. Null to create new project.
 * @param {number} version - The version number of the image.
 */
export async function uploadImage(imagedata, name, userId, imageId = null, version = 1) {

  //First image version, so create a new folder for the image.
  if (imageId === null) {
    imageId = crypto.randomUUID();

    //Add new row to images table
    const { error: rowCreationError } = await supabaseClient
      .from("images")
      .insert({
        image_id: imageId,
        file_name: name,
        user_id: userId
      });

    if (rowCreationError) {
      console.log("ERROR:", rowCreationError);
      return false;
    }
  }

  const path = `${userId}/${imageId}/${version}_${name}`;

  // Add image to storage
  const { error: storageError } = await supabaseClient
    .storage
    .from("Images")
    .upload(path, imagedata);

  if (storageError) {
    console.log("ERROR:", storageError);
    return false;
  }

  return { imageId, version };
}

/**
 * Fetch image data from storage bucket.
 * @param {string} userId - The current user's unique identifier.
 * @param {string} imageId - The image project's unique identifier.
 * @param {number} version - The version number of the image.
 * @param {string} name - The image's file name including extension.
 */
export async function downloadImage(userId, imageId, version, name) {
  const path = `${userId}/${imageId}/${version}_${name}`;

  const { data, error: downloadError } = await supabaseClient
    .storage
    .from("Images")
    .download(path);

  if (downloadError) {
    console.log("ERROR: ", downloadError);
    return false;
  }

  return data;
}

/**
 * Delete a single version of an image.
 *
 * @param {string} userId - The current user's unique identifier.
 * @param {string} imageId - The image project's unique identifier.
 * @param {number} version - The version number of the image.
 * @param {string} name - The image's file name including extension.
 */
export async function deleteVersion(userId, imageId, version, name) {
  //TODO: Add update to image versions table once implemented
  //TODO update image table if this was last version
  const path = `${userId}/${imageId}/${version}_${name}`;

  const { data, error } = await supabaseClient
    .storage
    .from("Images")
    .remove([path]);
  if (error) {
    return error;
  }
  return data;
}

/**
 * Delete every version of an image and associated tables.
 *
 * @param {string} userId - The current user's unique identifier.
 * @param {string} imageId - The image project's unique identifier.
 */
export async function deleteImageProject(userId, imageId) {
  //Get all images in folder
  const path = `${userId}/${imageId}/`;
  const { data: files, error } = await supabaseClient
    .storage
    .from("Images")
    .list(path);
  if (error) {
    console.log(error);
    return false;
  }

  //Supabase requires absolute filepaths
  const fileNames = files.map(file => `${path}${file.name}`);

  //Delete all images from storage
  const { data: deletionData, error: deletionError } = await supabaseClient
    .storage
    .from("Images")
    .remove(fileNames);
  if (deletionError) {
    console.log(deletionError);
    return false;
  }

  //update images table
  const { data: rowDeletionData, error: rowDeletionError } = await supabaseClient
    .from("images")
    .delete()
    .match({ image_id: imageId, user_id: userId });
  if (rowDeletionError) {
    console.log(rowDeletionError);
    return false;
  }

  //TODO: Clean up messy code, fix return types, handle storage / db conflicts

  return { deletionData, rowDeletionData };
}
