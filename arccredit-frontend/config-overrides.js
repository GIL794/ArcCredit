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
    os: require.resolve('os-browserify/browser'),
    path: require.resolve('path-browserify'),
    util: require.resolve('util/'),
    fs: false,
    tty: require.resolve('tty-browserify'),
    vm: require.resolve('vm-browserify'),
    zlib: require.resolve('browserify-zlib'),
  });

  config.resolve.fallback = fallback;
  // Some packages ship sourceMappingURL comments that point to TypeScript
  // sources which are not distributed. The `source-map-loader` rule (a
  // pre-enforced rule) attempts to load those maps and produces many
  // non-fatal but noisy warnings. Remove the rule entirely from the dev
  // build so those warnings don't clutter the console.
  if (config.module && Array.isArray(config.module.rules)) {
    config.module.rules = config.module.rules.filter((rule) => {
      try {
        if (rule && rule.enforce === 'pre' && rule.use) {
          const uses = Array.isArray(rule.use) ? rule.use : [rule.use];
          const hasSourceMapLoader = uses.some((u) => {
            if (!u) return false;
            if (typeof u === 'string') return u.includes('source-map-loader');
            if (u.loader) return String(u.loader).includes('source-map-loader');
            return false;
          });
          // filter out this rule from the rules array
          return !hasSourceMapLoader;
        }
      } catch (e) {
        return true;
      }
      return true;
    });
  }

  // Suppress common noisy source-map parsing warnings coming from
  // third-party packages. These are non-fatal and safe to ignore in
  // development. Keep a few related patterns to reduce console spam.
  config.ignoreWarnings = config.ignoreWarnings || [];
  config.ignoreWarnings.push(/Failed to parse source map/);
  config.ignoreWarnings.push(/Unable to read source map/);
  config.ignoreWarnings.push(/source map/i);
  config.ignoreWarnings.push(/Failed to parse '.*\.map'/);

  return config;
};

// Additionally, some dependencies ship compiled JS with sourceMappingURL pointing
// to TypeScript sources that are not packaged. These produce many non-fatal
// warnings during development. Consumers can safely ignore those "Failed to parse
// source map" warnings. We add a catch-all ignore pattern for them.
module.exports.__ignoreSourceMapWarning = true;
