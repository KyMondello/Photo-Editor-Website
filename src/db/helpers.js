//Helper functions
export const success = (data = null) => ({ success: true, data });
export const failure = (message = null, code = null) => ({ success: false, data: null, message, code });

export async function handleResponse(query, message = null) {
  const { data, error } = await query;

  if (error) return failure(message, error?.code);

  return success(data);
}
