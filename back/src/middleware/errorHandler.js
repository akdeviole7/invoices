// config/errorHandler.js
// Created new file as the provided "errorhandler.js" content was incorrect (it was a React component).
// This is a proper Express error handler middleware.
// Moved from inline in server.js to a separate file for modularity.
import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
};

export default errorHandler;