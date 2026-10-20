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
