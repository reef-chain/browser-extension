import { Provider } from '@reef-chain/evm-provider';
import { AccountJson } from '@reef-chain/extension-base/background/types';
import Signer from '@reef-chain/extension-base/page/Signer';
import { sendMessage } from '@reef-chain/extension-ui/messaging';
import { ReefSigner } from '@reef-chain/react-lib';
import { useEffect, useState } from 'react';

import { toReefSigner } from '../state/util';

const injectionSigner = new Signer(sendMessage);

export const useReefSigners = (accounts: AccountJson[] | null, provider: Provider|undefined): ReefSigner[] => {
  const [signers, setSigners] = useState<ReefSigner[]>([]);

  useEffect((): void => {
    const initAsync = async () => {
      if (!accounts || !accounts?.length || !provider) {
        setSigners([]);

        return;
      }

      const sgnrs: any[] = await Promise.all<ReefSigner|undefined>(accounts?.map((acc: AccountJson) => toReefSigner(acc, provider, injectionSigner)));

      setSigners(sgnrs.filter((s) => !!s));
    };

    void initAsync();
  }, [accounts, provider]);

  return signers;
};
