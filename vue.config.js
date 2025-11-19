// const { defineConfig } = require('@vue/cli-service');

// module.exports = defineConfig({
//   transpileDependencies: true,
//   devServer: {
//     proxy: {
//       '/api': {
//         target: 'http://atlastoluca.dyndns.org:20000',
//         changeOrigin: true,
//         pathRewrite: { '^/api': '/datasnap/rest/TServerMethods1' }
//       }
//     }
//   },
//   configureWebpack: {
    
//     plugins: [
//       new (require('webpack')).DefinePlugin({
//         __VUE_OPTIONS_API__: JSON.stringify(true),
//         __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
//       })
//     ]
//   }
// });

const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {} // 🔹 Dejarlo vacío o eliminarlo si no es necesario
  },
  configureWebpack: {
    plugins: [
      new (require('webpack')).DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      })
    ]
  }
});


