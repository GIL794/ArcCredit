module.exports = function override(config, env) {
  // Override webpack config for react-app-rewired
  // This allows us to handle polyfills for Node.js core modules
  
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    path: require.resolve('path-browserify'),
    fs: false,
    tty: require.resolve('tty-browserify'),
    vm: require.resolve('vm-browserify'),
    zlib: require.resolve('browserify-zlib'),
  });

  config.resolve.fallback = fallback;
  return config;
};
