const { sendWaitlistNotification } = require('../services/emailService');
const { successResponse, errorResponse } = require('../utils/response');
const ERRORS = require('../constants/errorCodes');
const validator = require('validator');

/**
 * Join waitlist endpoint
 * Receives email and sends notification to admin
 */
async function joinWaitlist(req, res) {
  try {
    const { email } = req.body;

    // Validate email presence
    if (!email) {
      return errorResponse(res, {
        code: ERRORS.INVALID_DATA.code,
        message: 'Email is required',
        statusCode: 400,
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return errorResponse(res, {
        code: ERRORS.INVALID_DATA.code,
        message: 'Invalid email format',
        statusCode: 400,
      });
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = validator.normalizeEmail(email, {
      all_lowercase: true,
      gmail_remove_dots: false,
    });

    // Send notification to admin
    const result = await sendWaitlistNotification(normalizedEmail);

    if (!result.success) {
      console.error('Failed to send waitlist notification:', result.error);
      // Don't fail the request if email fails - just log it
      // Still return success to the user
    }

    return successResponse(res, {
      message: 'Successfully joined the waitlist',
      data: {
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error('Error in joinWaitlist:', error);
    return errorResponse(res, {
      code: ERRORS.INTERNAL_SERVER_ERROR.code,
      message: 'Failed to join waitlist',
      statusCode: 500,
    });
  }
}

module.exports = {
  joinWaitlist,
};
