const Account = require('../models/Account.model');
const Patient = require('../models/Patient.model');
const Caregiver = require('../models/Caregiver.model');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../../../shared/utils/jwt.util');
const { logger } = require('../../../shared/utils/logger');
const AppError = require('../../../shared/utils/AppError');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Created user with tokens
   */
  async register(userData) {
    const { email, password, role, firstName, lastName, phone } = userData;

    // Check if account already exists
    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      throw new AppError('Email already registered', 400, 'EMAIL_EXISTS');
    }

    // Create account (password will be hashed by pre-save hook)
    const account = new Account({
      email,
      passwordHash: password,
      role,
      isActive: true
    });
    await account.save();

    // Create role-specific profile
    let profile;
    if (role === 'PATIENT') {
      profile = new Patient({
        accountId: account._id,
        firstName,
        lastName,
        phone
      });
    } else if (role === 'CAREGIVER') {
      profile = new Caregiver({
        accountId: account._id,
        firstName,
        lastName,
        phone
      });
    } else {
      // Admin doesn't need a profile in this schema
      profile = null;
    }

    if (profile) {
      await profile.save();
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      accountId: account._id,
      role: account.role
    });
    const refreshToken = generateRefreshToken({
      accountId: account._id,
      role: account.role
    });

    logger.info(`User registered: ${email}, role: ${role}`);

    return {
      accessToken,
      refreshToken,
      user: {
        accountId: account._id,
        role: account.role,
        profileId: profile ? profile._id : null
      }
    };
  }

  /**
   * Login user
   * @param {Object} credentials - User login credentials
   * @returns {Object} User with tokens
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find account
    const account = await Account.findOne({ email });
    if (!account) {
      throw new AppError('Incorrect email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check if account is active
    if (!account.isActive) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_INACTIVE');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, account.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Incorrect email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      accountId: account._id,
      role: account.role
    });
    const refreshToken = generateRefreshToken({
      accountId: account._id,
      role: account.role
    });

    logger.info(`User logged in: ${email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        accountId: account._id,
        role: account.role
      }
    };
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token from cookie
   * @returns {Object} New access token
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 401, 'UNAUTHORIZED');
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    // Find account
    const account = await Account.findById(decoded.accountId);
    if (!account || !account.isActive) {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_TOKEN');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      accountId: account._id,
      role: account.role
    });

    logger.info(`Token refreshed for account: ${account._id}`);

    return {
      accessToken
    };
  }

  /**
   * Logout user
   * @param {string} accountId - Account ID
   * @returns {Object} Logout confirmation
   */
  async logout(accountId) {
    logger.info(`User logged out: ${accountId}`);
    
    return {
      message: 'Logged out successfully'
    };
  }

  /**
   * Get account by ID
   * @param {string} accountId - Account ID
   * @returns {Object} Account data
   */
  async getAccountById(accountId) {
    const account = await Account.findById(accountId).select('-passwordHash');
    if (!account) {
      throw new AppError('Account not found', 404, 'NOT_FOUND');
    }
    return account;
  }
}

module.exports = new AuthService();
