//Helper functions
export const success = (data = null) => ({ success: true, data });
export const failure = () => ({ success: false, data: null });

export async function handleResponse(query) {
  const { data, error } = await query;

  if (error) return failure();

  return success(data);
}
