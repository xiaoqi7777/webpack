const webpack = require("./webpack");
const webpackOptions = require("./config");
const compiler = webpack(webpackOptions);
compiler.run((err, stats) => {
  // console.log(
  //   stats
  // );
});

