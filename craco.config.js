const CracoAntDesignPlugin = require("craco-antd");

const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");

const { getThemeVariables } = require("antd/dist/theme");

module.exports = {
  webpack: {
    plugins: [
      // Silence mini-css-extract-plugin generating lots of warnings for CSS ordering.
      // See: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250
      new FilterWarningsPlugin({
        exclude: /mini-css-extract-plugin[^]*Conflicting order/,
      }),
    ],
  },

  plugins: [
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeTheme: {
          ...getThemeVariables({
            dark: true,
          }),
        }
      },
    },
  ],
};
