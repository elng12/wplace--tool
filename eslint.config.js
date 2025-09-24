const globals = require('globals');
        const js = require('@eslint/js');
        const prettierConfig = require('eslint-config-prettier');

        module.exports = [
          // Global ignores
          {
            ignores: [
                "node_modules/",
                ".backup/",
                "lang_backup_20250827_151027/",
                "js/inline-translations.js",
                "postcss.config.js",
                "tailwind.config.js",
                ".prettierrc.json",
                "coverage/"
            ],
          },
          
          // Base configs
          js.configs.recommended,
          prettierConfig,

          // Main configuration for all JS files
          {
            files: ["**/*.js"],
            languageOptions: {
              ecmaVersion: 'latest',
              sourceType: 'script', // Default to script
              globals: {
                ...globals.browser,
                ...globals.node,
              },
            },
            rules: {
              'no-console': ['warn', { allow: ['warn', 'error', 'debug'] }],
              'no-unused-vars': ['warn', { args: 'none' }],
              'no-undef': 'error',
              'no-prototype-builtins': 'off',
              'no-useless-escape': 'warn'
            },
          },

          // Override for specific files that are ES modules
          {
            files: [
                "js/core-web-vitals-monitor.js",
                "scripts/core-web-vitals-optimizer.js"
            ],
            languageOptions: {
              sourceType: 'module' // Set these to be modules
            }
          }
        ];