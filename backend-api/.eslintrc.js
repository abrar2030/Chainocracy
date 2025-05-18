module.exports = {
  extends: [
    'eslint:recommended'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-empty': 'warn',
    'require-yield': 'warn',
    'no-unsafe-finally': 'warn'
  },
  env: {
    node: true,
    es6: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  }
};
