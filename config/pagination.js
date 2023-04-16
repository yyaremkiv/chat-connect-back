export const processPaginationParams = (query) => {
  let { page = 1, limit = 10, sort = "desc" } = query;

  const skip = parseInt((page - 1) * limit);
  limit = parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

  return { skip, limit, sort };
};
