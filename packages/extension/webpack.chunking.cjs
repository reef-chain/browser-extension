// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

const path = require('path');
let count = 0;

module.exports = [
  {
    '@polkadot/wasm-crypto-wasm/data.js': require.resolve('@polkadot/wasm-crypto-wasm/empty')
  },
  {
    splitChunks: {
      chunks: 'all',
      maxSize: 4000000,
      minSize: 1000000
    }
  },
  {
    chunkFilename: '[name].js',
    filename: (pathData) => {
      return `/extension-js/${count++}.js`;
    },
    globalObject: '(typeof self !== \'undefined\' ? self : this)',
    path: path.join(__dirname, 'build')
  }
];
