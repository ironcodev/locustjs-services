module.exports = {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "cjs",
  },
  external: ["@locustjs/base", "@locustjs/extensions-string"],
};
