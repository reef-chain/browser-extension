// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReefInjected } from '@reef-chain/extension-inject/types';
import type { SendRequest } from './types';

import Accounts from '@reef-chain/extension-base/page/Accounts';

import { ReefProvider } from '../../../reef/extension-base/src/page/ReefProvider';
import { ReefSigner } from '../../../reef/extension-base/src/page/ReefSigner';
import Metadata from './Metadata';
import PostMessageProvider from './PostMessageProvider';
import SigningKey from './Signer';

export default class implements ReefInjected {
  public readonly accounts: Accounts;

  public readonly metadata: Metadata;

  public readonly provider: PostMessageProvider;

  public readonly signer: SigningKey;

  public readonly reefSigner: ReefSigner;

  public readonly reefProvider: ReefProvider;

  constructor (sendRequest: SendRequest) {
    this.accounts = new Accounts(sendRequest);
    this.metadata = new Metadata(sendRequest);
    this.provider = new PostMessageProvider(sendRequest);
    this.signer = new SigningKey(sendRequest);
    // REEF update
    this.reefProvider = new ReefProvider(sendRequest);
    this.reefSigner = new ReefSigner(this.accounts, this.signer, this.reefProvider);
  }
}
