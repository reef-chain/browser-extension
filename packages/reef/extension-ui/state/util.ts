import { Provider } from '@reef-chain/evm-provider';
import { AccountJson } from '@reef-chain/extension-base/background/types';
import Signer from '@reef-chain/extension-base/page/Signer';
import { InjectedAccountWithMeta } from '@reef-chain/extension-inject/types';
import { ReefSigner, rpc } from '@reef-chain/react-lib';

export function toReefSigner (acc: AccountJson, provider: Provider, injectionSigner: Signer): Promise<ReefSigner|undefined> {
  const accWithMeta: InjectedAccountWithMeta = {
    address: acc.address,
    meta: {
      genesisHash: acc.genesisHash,
      name: acc.name,
      source: acc.name || ''
    },
    type: acc.type
  };

  return rpc.metaAccountToSigner(accWithMeta, provider, injectionSigner);
}
