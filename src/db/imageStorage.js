/**
 * @file Provides queries to interact with Supabase database and storage buckets.
 */

import supabaseClient from "./supabase.js";
import { success, failure, handleResponse } from "./helpers.js"

/**
 * @template T
 * @typedef {Object} SupabaseResponse
 * @property {boolean} success - Whether the supabase query was successful
 * @property {T|null} data - The data returned from the query, or null if unsuccessful
 */

/**
 * Uploads given image to file storage bucket and updates db tables.
 *
 * @param {Blob} imagedata - The raw image data to be uploaded.
 * @param {string} name - The image's file name including extension.
 * @param {string} userId - The current user's unique identifier.
 * @param {string|null} imageId - The image project's unique identifier. Null to create new project.
 * @param {number} version - The version number of the image.
 * @returns {Promise<SupabaseResponse<null>>}
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

    if (rowCreationError) return failure();
  }

  const path = `${userId}/${imageId}/${version}_${name}`;

  // Add image to storage
  const { error: storageError } = await supabaseClient
    .storage
    .from("Images")
    .upload(path, imagedata);

  if (storageError) return failure();

  //Add version to table
  const { error: versionError } = await supabaseClient
    .from("image_versions")
    .insert({
      version: version,
      image_id: imageId
    });

  if (versionError) return failure();

  return success();
}

/**
 * Delete a single version of an image.
 *
 * @param {string} userId - The current user's unique identifier.
 * @param {string} imageId - The image project's unique identifier.
 * @param {number} version - The version number of the image.
 * @param {string} name - The image's file name including extension.
 * @returns {Promise<SupabaseResponse<null>>}
 */
export async function deleteVersion(userId, imageId, version, name) {
  const path = `${userId}/${imageId}/${version}_${name}`;

  //Remove from storage bucket
  const { error } = await supabaseClient
    .storage
    .from("Images")
    .remove([path]);

  if (error) return failure();

  //Remove version from table
  const { error: versionTableError } = await supabaseClient
    .from("image_versions")
    .delete()
    .match({ image_id: imageId, version: version });

  if (versionTableError) return failure();

  return success();
}

/**
 * Delete every version of an image and associated tables.
 *
 * @param {string} userId - The current user's unique identifier.
 * @param {string} imageId - The image project's unique identifier.
 * @returns {Promise<SupabaseResponse<null>>}
 */
export async function deleteImageProject(userId, imageId) {
  //Get all images in folder
  const path = `${userId}/${imageId}/`;
  const { data: files, error } = await supabaseClient
    .storage
    .from("Images")
    .list(path);

  if (error) return failure();

  //Supabase requires absolute filepaths
  const fileNames = files.map(file => `${path}${file.name}`);

  //Delete all images from storage
  const { error: deletionError } = await supabaseClient
    .storage
    .from("Images")
    .remove(fileNames);

  if (deletionError) return failure();

  //update versions table
  const { error: versionDeletionError } = await supabaseClient
    .from("image_versions")
    .delete()
    .match({ image_id: imageId });
  if (versionDeletionError) return failure();

  //update images table
  const { error: rowDeletionError } = await supabaseClient
    .from("images")
    .delete()
    .match({ image_id: imageId, user_id: userId });
  if (rowDeletionError) return failure();

  return success();
}

/**
 * Get a list of image project UUIDs and filenames for a given user.
 * @param {string} userId - The current user's UUID.
 * @returns {Promise<SupabaseResponse<Array<{image_id: string, file_name: string}>>>}
 */
export function listImageProjects(userId) {
  return handleResponse(
    supabaseClient
      .from("images")
      .select('image_id, file_name')
      .eq('user_id', userId)
  );
}

/**
 * Get the most recently saved version number for a given image.
 * @param {string} imageId - The image project's UUID.
 * @returns {Promise<SupabaseResponse<number>>}
 */
export async function getLatestVersion(imageId) {
  const result = await handleResponse(
    supabaseClient
      .from("image_versions")
      .select("version")
      .eq("image_id", imageId)
      .order("version", { ascending: false })
      .limit(1)
      .single()
  );

  if (!result.success) return failure();

  return success(result.data.version);
}

/**
 * Fetch image data from storage bucket.
 * @param {string} userId - The current user's unique identifier.
 * @param {string} imageId - The image project's unique identifier.
 * @param {number} version - The version number of the image.
 * @param {string} name - The image's file name including extension.
 * @returns {Promise<SupabaseResponse<Blob>>}
 */
export function downloadImage(userId, imageId, version, name) {
  const path = `${userId}/${imageId}/${version}_${name}`;

  return handleResponse(
    supabaseClient
      .storage
      .from("Images")
      .download(path)
  );
}
