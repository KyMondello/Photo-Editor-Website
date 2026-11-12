import supabaseClient from "./supabase.js";

/**
 * Queries the database for a username, email combination
 * @param {string} username - The username of the account to reset
 * @param {string} email - The email address of the account to reset
 * @returns {boolean} - Returns true if the username and email are
 * in the same db record, otherwise false
 */
export async function hasMatchingEmail(username, email) {
  const { data, error } = await supabaseClient
    .from("users")
    .select('username,email')
    .eq('username', username)
    .eq('email', email)
    .limit(1);

  if (error) return false;

  return data.length > 0;
}


