const { createProxyMiddleware } = require("http-proxy-middleware");
const { REACT_APP_API_HOST, REACT_APP_API_PORT } = process.env;
module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: `http://${REACT_APP_API_HOST}:${REACT_APP_API_PORT}`,
      changeOrigin: true,
      pathRewrite: {
        "^/api": "/",
      },
    })
  );
};
