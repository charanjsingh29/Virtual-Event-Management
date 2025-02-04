/**
 * Adds a paginated response method to the Response object.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export default (req, res, next) => {
    // Success response: 200 or 201 status with data
    res.success = function (data = {}, statusCode = 200) {
      return this.status(statusCode).json(data);
    };

    /**
     * Sends a successful response with data and a message.
     * @param {Object} [data={}] - The data to send.
     * @param {string} [message=""] - The message to send.
     * @param {boolean} [status=true] - The status of the response.
     * @param {number} [statusCode=200] - The HTTP status code.
     * @returns {Response} - The response object.
     */
    res.successWithMessage = function (data = {}, message = "", status = true, statusCode = 200) {
      return this.status(statusCode).json({
        status: status,
        message: message,
        ...data,
      });
    };

    /**
     * Sends a paginated response with data and metadata.
     * @param {Array/Object} [data=[]] - The data to send.
     * @param {number} [currentPage=1] - The current page number.
     * @param {number} [lastPage=1] - The last page number.
     * @param {number} [perPage=10] - The number of items per page.
     * @param {number} [total=0] - The total number of items.
     * @returns {Response} - The response object.
     */
    res.paginated = function (data = {}, currentPage = 1, lastPage = 1, perPage = 10, total = 0) {  
      return this.json({
        data: data,
        meta: {
          current_page: parseInt(currentPage),
          last_page: parseInt(lastPage),
          per_page: parseInt(perPage),
          total: parseInt(total),
        },
      })
    }
  
    // Error response: 400, 401, 404, 500, etc.
    res.error = function (message = "An error occurred", statusCode = 500, errors = []) {
      return this.status(statusCode).json({
        status: false,
        message: message,
        errors: errors,
      });
    };

    res.notFound = function () {
      return this.error("Not found", 404);
    };
  
    // Validation error response: 400 status with error details
    res.validationError = function (errors = {}) {
      const fields = errors.details.map((detail) => ({
        field: detail.path[0], // Get the field name
        message: detail.message // Get the error message
      }));
      const errorDetails = errors.details.map(err => err.message);
      return this.status(400).json({
        message: "Validation failed",
        fields: fields,
        errors: errorDetails
      });
    };
  
    next();
  };
  