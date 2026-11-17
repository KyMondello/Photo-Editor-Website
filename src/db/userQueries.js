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

export async function createUser(username, email, hashedPassword) {
  const userId = crypto.randomUUID();
  const { data, error } = await supabaseClient
    .from("users")
    .insert({
      id: userId,
      username: username,
      email: email,
      hashed_password: hashedPassword
    });
  if (error) return false;
  return true;
}

export async function findUserByUsername(username) {
  const { error } = await supabaseClient
    .from("users")
    .select('username')
    .eq('username', username)
    .limit(1)
    .single();
  if (error) return false;
  return true;
}

export async function findUserByEmail(email) {
  const { error } = await supabaseClient
    .from("users")
    .select('email')
    .eq('email', email)
    .limit(1)
    .single();
  if (error) return false;
  return true;
}

export async function updatePassword(userId, hashedPassword) {
  const { data, error } = await supabaseClient
    .from("users")
    .update({ hashed_password: hashedPassword })
    .eq('id', userId)
    .select();
  if (error) return false;
  return true;
}


