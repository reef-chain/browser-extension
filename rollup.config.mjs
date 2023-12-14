// Copyright 2017-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createBundle } from '@reef-defi/dev/config/rollup';
import path from 'path';

const pkgs = ['@reef-defi/extension-dapp'];

const external = [
  ...pkgs,
  '@reef-chain/networks',
  '@reef-chain/util',
  '@reef-chain/util-crypto'
];

const entries = [
  'extension-base',
  'extension-chains',
  'extension-inject'
].reduce(
  (all, p) => ({
    ...all,
    [`@reef-chain/${p}`]: path.resolve(process.cwd(), `packages/${p}/build`)
  }),
  {}
);

const overrides = {};

export default pkgs.map((pkg) => {
  const override = overrides[pkg] || {};

  return createBundle({
    external,
    pkg,
    ...override,
    entries: {
      ...entries,
      ...(override.entries || {})
    }
  });
});
