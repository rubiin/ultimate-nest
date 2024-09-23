const rubiin = require("@antfu/eslint-config").default;

module.exports = rubiin({
  stylistic: {
    semi: false,
    quotes: "double",
  }, // enable stylistic rules
  yaml: true, // enable yaml rules,
  jsonc: true, // enable jsonc rules
  markdown: false, // enable markdown rules
  gitignore: true, // enable gitignore rules,

});
