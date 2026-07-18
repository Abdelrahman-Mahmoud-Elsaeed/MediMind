const Account = require("../models/Account.model");
const Admin = require("../models/Admin.model");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../../../shared/utils/jwt.util");
const { logger } = require("../../../shared/utils/logger");
const AppError = require("../../../shared/utils/AppError");
const { _finalizeSession } = require("../utiltis/auth.utils");

class AdminService {

}

module.exports = new AdminService();
