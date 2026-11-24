import { randomUUID } from "node:crypto";
import supabaseClient from "./supabaseServer.js";
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
    })
    .select('id,username,email,hashed_password')
    .single();
  if (error) {
    console.error("createUser insert failed:", error.code, error.message);
    return false;
  }
  return data;
}

export async function findUserByUsername(username) {
  const { data, error } = await supabaseClient
    .from("users")
    .select('id,username,email,hashed_password')
    .eq('username', username)
    .single();
  if (error) return false;
  return data;
}

export async function findUserByEmail(email) {
  const { data, error } = await supabaseClient
    .from("users")
    .select('id,username,email,hashed_password')
    .eq('email', email)
    .single();
  if (error) return false;
  return data;
}

export async function updatePassword(userId, hashedPassword) {
  const { error } = await supabaseClient
    .from("users")
    .update({ hashed_password: hashedPassword })
    .eq('id', userId)
    .select();
  if (error) return false;
  return true;
}

export async function findUserById(id) {
  const { data, error } = await supabaseClient
    .from("users")
    .select('id,username,email')
    .eq('id', id)
    .single();
  if (error) return false;
  return data;
}


