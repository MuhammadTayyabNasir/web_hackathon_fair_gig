/**
 * @param {object} data
 * @param {string} [message]
 * @returns {object}
 */
function success(data, message = 'Operation successful') {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * @param {string} error
 * @param {string} message
 * @returns {object}
 */
function fail(error, message) {
  return {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { success, fail };
