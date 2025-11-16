/**
 * Environment variable validation utility
 * Checks for required environment variables and provides helpful error messages
 */

export const validateEnvVariables = () => {
  const errors = [];
  const warnings = [];

  // Required contract addresses
  const requiredVars = {
    REACT_APP_USDC_ADDRESS: process.env.REACT_APP_USDC_ADDRESS,
    REACT_APP_EURC_ADDRESS: process.env.REACT_APP_EURC_ADDRESS,
    REACT_APP_RATE_MODEL_ADDRESS: process.env.REACT_APP_RATE_MODEL_ADDRESS,
    REACT_APP_LENDING_ADDRESS: process.env.REACT_APP_LENDING_ADDRESS,
    REACT_APP_CHAIN_ID: process.env.REACT_APP_CHAIN_ID,
    REACT_APP_RPC_URL: process.env.REACT_APP_RPC_URL,
  };

  // Optional Circle wallet variables
  const optionalVars = {
    REACT_APP_CIRCLE_API_KEY: process.env.REACT_APP_CIRCLE_API_KEY,
    REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  };

  // Check required variables
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      errors.push(`Missing required variable: ${key}`);
    }
  });

  // Check optional variables (warnings only)
  if (!optionalVars.REACT_APP_CIRCLE_API_KEY) {
    warnings.push('REACT_APP_CIRCLE_API_KEY not set - Circle wallet will not work');
  }

  if (!optionalVars.REACT_APP_BACKEND_URL) {
    warnings.push('REACT_APP_BACKEND_URL not set - Using mock tokens for development');
  }

  // Validate address format (basic check)
  const addressVars = ['REACT_APP_USDC_ADDRESS', 'REACT_APP_EURC_ADDRESS', 'REACT_APP_RATE_MODEL_ADDRESS', 'REACT_APP_LENDING_ADDRESS'];
  addressVars.forEach((key) => {
    const value = requiredVars[key];
    if (value && !value.startsWith('0x') && value.length !== 42) {
      errors.push(`Invalid address format for ${key}: ${value}`);
    }
  });

  return { errors, warnings };
};

export const logEnvStatus = () => {
  const { errors, warnings } = validateEnvVariables();

  if (errors.length > 0) {
    console.error('❌ Environment Configuration Errors:');
    errors.forEach((error) => console.error(`  - ${error}`));
    console.error('\nPlease check your arccredit-frontend/.env file');
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Environment Configuration Warnings:');
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All environment variables configured correctly');
  }

  return { errors, warnings };
};


