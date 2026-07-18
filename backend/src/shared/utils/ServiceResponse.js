class ServiceResponse {
  constructor({ success = true, status = "SUCCESS", data = {}, en = "Operation completed successfully.", ar = "تمت العملية بنجاح." }) {
    this.success = success;
    this.status = status;
    this.messages = { en, ar };
    this.data = data;
  }

  /**
   * Helper method to directly send the response to Express res object
   * @param {Object} res - Express response object 
   * @param {Number} httpStatusCode - Default fallback HTTP code
   */
  send(res, httpStatusCode = 200) {
    const finalStatus = this.status === "CREATED" ? 201 : httpStatusCode;
    return res.status(finalStatus).json({
      success: this.success,
      status: this.status,
      messages: this.messages,
      data: this.data
    });
  }
}

module.exports = ServiceResponse;