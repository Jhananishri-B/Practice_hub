/**
 * Helper utility to normalize MySQL query results
 * MySQL returns results as [rows, fields] array, unlike PostgreSQL which returns {rows, ...} object
 */

export const getRows = (result: any) => {
  // MySQL returns [rows, fields] array
  // PostgreSQL returns {rows, ...} object
  if (Array.isArray(result) && result.length > 0) {
    return result[0]; // MySQL format - first element is rows array
  }
  if (result && result.rows) {
    return result.rows; // PostgreSQL format (for backward compatibility)
  }
  return result || [];
};

export const getFirstRow = (result: any) => {
  const rows = getRows(result);
  return rows && rows.length > 0 ? rows[0] : null;
};


