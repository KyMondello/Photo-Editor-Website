/**
 * @file Provides queries to interact with Supabase database and storage buckets.
 */

import supabaseClient from "./supabaseServer.js";
import { success, failure, handleResponse } from "./helpers.js"
import { randomUUID } from "node:crypto"

/**
 * @template T
 * @typedef {Object} SupabaseResponse
 * @property {boolean} success - Whether the supabase query was successful
 * @property {T|null} data - The data returned from the query, or null if unsuccessful
 * @property {string|null} message - Optional message for failures.
 * @property {string|null} code - Supabase error code for failures.
 */

/**
 * Upload a new image project to storage and update db.
 *
 * @param {string} userId - The user's UUID.
 * @param {Blob} imageData - The actual image data to be uploaded.
 * @param {string} filename - The image file's name and extension.
 * @returns {Promise<SupabaseResponse<{imageId: string}>>}
 */
export async function uploadProject(userId, imageData, filename) {
  const imageId = randomUUID();
  const name = filename.replace(/\.[^.]+$/, "");
  const extension = filename.match(/\.[^.]+$/)?.[0].slice(1);
  if (!extension) return failure("Invalid file extension.");
  const path = `${userId}/${imageId}/1.${extension}`;

  //Add image to storage 
  const { error: storageError } = await supabaseClient
    .storage
    .from("Images")
    .upload(path, imageData, { contentType: `image/${extension}` });

  if (storageError) return failure("Could not upload to storage bucket.");

  //Add record to image table
  const { error: imageTableError } = await supabaseClient
    .from("images")
    .insert({
      image_id: imageId,
      file_name: name,
      user_id: userId
    });

  if (imageTableError) return failure("Could not add record to images table.");

  //Add record to version table
  const { error: versionTableError } = await supabaseClient
    .from("image_versions")
    .insert({
      version: 1,
      image_id: imageId,
      extension: extension
    });

  if (versionTableError) return failure("Could not add record to versions table.");

  return success({ imageId });
}

/**
 * Upload a new image version to an existing project and update db.
 *
 * @param {string} userId - The user's UUID.
 * @param {Blob} imageData - The actual image data to be uploaded.
 * @param {string} imageId - The UUID of the image project.
 * @param {string|null} extension - New image's file extension. Defaults to the previous version's file extension.
 * @returns {Promise<SupabaseResponse<null>>}
 */
export async function uploadVersion(userId, imageData, imageId, extension = null) {
  //Get image version and extension
  const result = await getLatestVersion(userId, imageId);
  if (!result.success) return result;

  const { version, extension: oldExtension } = result.data;
  const nextVersion = version + 1;
  extension = extension || oldExtension;
  const path = `${userId}/${imageId}/${nextVersion}.${extension}`;

  //Add image to storage
  const { error: storageError } = await supabaseClient
    .storage
    .from("Images")
    .upload(path, imageData, { contentType: `image/${extension}` });

  if (storageError) return failure("Could not upload image to storage.");

  //Add record to version table
  const { error: versionTableError } = await supabaseClient
    .from("image_versions")
    .insert({
      version: nextVersion,
      image_id: imageId,
      extension: extension
    });

  if (versionTableError) return failure("Could not add record to version table.");

  return success();
}


/**
 * Delete a single version of an image.
 *
 * @param {string} userId - The current user's unique identifier.
 * @param {string} imageId - The image project's unique identifier.
 * @param {string} name - The image's file name including extension.
 * @returns {Promise<SupabaseResponse<null>>}
 */
export async function deleteVersion(userId, imageId, version) {

  //Get extension
  const { data, error: extensionError } = await supabaseClient
    .from("image_versions")
    .select("extension, images!inner(user_id)")
    .eq("image_id", imageId)
    .eq("images.user_id", userId)
    .eq("version", version)
    .limit(1)
    .single();

  if (extensionError) return failure("Could not get version file extension.");

  const { extension } = data;
  const path = `${userId}/${imageId}/${version}.${extension}`;

  //Remove from storage bucket
  const { error } = await supabaseClient
    .storage
    .from("Images")
    .remove([path]);

  if (error) return failure("Could not remove file from storage.");

  //Remove version from table
  const { error: versionTableError } = await supabaseClient
    .from("image_versions")
    .delete()
    .match({ image_id: imageId, version: version });

  if (versionTableError) return failure("Could not remove record from version table.");

  return success();
}

/**
 * Delete every version of an image and associated tables.
 *
 * @param {string} userId - The current user's unique identifier.
 * @param {string} imageId - The image project's unique identifier.
 * @returns {Promise<SupabaseResponse<null>>}
 */
export async function deleteProject(userId, imageId) {
  //Get all images in folder
  const path = `${userId}/${imageId}/`;
  const { data: files, error } = await supabaseClient
    .storage
    .from("Images")
    .list(path);

  if (error) return failure("Could not get filenames from storage.");

  //Supabase requires absolute filepaths
  const fileNames = files.map(file => `${path}${file.name}`);

  //Delete all images from storage
  const { error: deletionError } = await supabaseClient
    .storage
    .from("Images")
    .remove(fileNames);

  if (deletionError) return failure("Could not delete files from storage.");

  //update versions table
  const { error: versionDeletionError } = await supabaseClient
    .from("image_versions")
    .delete()
    .match({ image_id: imageId });
  if (versionDeletionError) return failure("Could not delete records from version table.");

  //update images table
  const { error: rowDeletionError } = await supabaseClient
    .from("images")
    .delete()
    .match({ image_id: imageId, user_id: userId });
  if (rowDeletionError) return failure("Could not delete record from images table.");

  return success();
}

/**
 * Get a list of image project UUIDs and filenames for a given user.
 *
 * @param {string} userId - The current user's UUID.
 * @returns {Promise<SupabaseResponse<Array<{image_id: string, file_name: string}>>>}
 */
export function listImageProjects(userId) {
  return handleResponse(
    supabaseClient
      .from("images")
      .select('image_id, file_name')
      .eq('user_id', userId),
    "Could not get records from images table."
  );
}

/**
 * Get the most recent version number and file extension of an image project.
 *
 * @param {string} imageId - The image project's UUID.
 * @returns {Promise<SupabaseResponse<{version: number, extension: string}>>}
 */
export async function getLatestVersion(userId, imageId) {
  const result = await handleResponse(
    supabaseClient
      .from("image_versions")
      .select("version, extension, images!inner(user_id)")
      .eq("image_id", imageId)
      .eq("images.user_id", userId)
      .order("version", { ascending: false })
      .limit(1)
      .single(),
    "Could not get record from version table."
  );

  if (!result.success) return result;

  return success(result.data);
}

/**
 * Download a specific version of an image as a Blob.
 *
 * @param {string} userId - The user's UUID.
 * @param {string} imageId - The image project's UUID.
 * @param {number} version - The version number to download.
 * @returns {Promise<SupabaseResponse<Blob>>}
 */
export async function downloadVersion(userId, imageId, version) {
  const result = await handleResponse(
    supabaseClient
      .from("image_versions")
      .select("extension, images!inner(user_id)")
      .eq("image_id", imageId)
      .eq("images.user_id", userId)
      .eq("version", version)
      .single(),
    "Could not get records from version table."
  );

  if (!result.success) return result;

  const extension = result.data.extension;

  const path = `${userId}/${imageId}/${version}.${extension}`;

  return handleResponse(
    supabaseClient
      .storage
      .from("Images")
      .download(path),
    "Could not download image."
  );
}

/**
 * Renames an image project.
 *
 * @param {string} userId - The user's UUID.
 * @param {string} imageId - The image project's UUID.
 * @param {string} newName - The new name to give the image project.
 * @returns {Promise<SupabaseResponse<null>>}
 */
export async function renameImage(userId, imageId, newName) {
  //Clean and check file name.
  newName = newName.trim();
  if (!/^[\p{L}\p{N}_ -]+$/u.test(newName)) {
    return failure("Invalid file name.");
  }

  return handleResponse(
    supabaseClient
      .from("images")
      .update({ file_name: newName })
      .eq("image_id", imageId)
      .eq("user_id", userId)
      .single(),
    "Could not update image name."
  );
}
