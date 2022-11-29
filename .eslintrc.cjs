// eslint-disable-next-line no-undef
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "no-case-declarations": "off",
  },
  ignorePatterns: ["*.config.js"],
};
