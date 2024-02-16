import {  Components, hooks, TokenWithAmount, utils as reefUtils } from '@reef-chain/react-lib';
import React, { useEffect, useState,useContext } from 'react';

import { Loading } from '../uik';
import { SigningOrChildren } from './SigningOrChildren';
import { ReefStateContext } from '@reef-chain/extension-ui/components';

export const Transfer = (): JSX.Element => {
  const {selectedReefSigner,signers,reefState,provider}=  useContext(ReefStateContext);
  const signerTokenBalances: TokenWithAmount[] | undefined = hooks.useObservableState<TokenWithAmount[]|undefined>(reefState.selectedTokenPrices$, []);
  const theme = localStorage.getItem('theme');

  const [token, setToken] = useState<reefUtils.DataWithProgress<TokenWithAmount>>(reefUtils.DataProgress.LOADING);

  useEffect(() => {
    if (reefUtils.isDataSet(signerTokenBalances)) {
      const sigTokens = reefUtils.getData(signerTokenBalances);

      if (sigTokens === null) {
        setToken(reefUtils.DataProgress.NO_DATA);

        return;
      }

      const signerTokenBalance = sigTokens ? sigTokens[0] : undefined;

      if (signerTokenBalance ) {
        const tkn = { ...signerTokenBalance, amount: '', isEmpty: false } as TokenWithAmount;

        setToken(tkn);
      }
    }

  }, [signerTokenBalances]);

  return (
    <SigningOrChildren>
      {!reefUtils.isDataSet(token) && token === reefUtils.DataProgress.LOADING && <Loading />}
      {!reefUtils.isDataSet(token) && token === reefUtils.DataProgress.NO_DATA &&
      <div>No tokens for transaction.</div>}
      {provider && reefUtils.isDataSet(token) && signerTokenBalances && reefUtils.isDataSet(signerTokenBalances) && selectedReefSigner && signers &&
      <div className={theme === 'dark' ? 'theme-dark' : ''}>
        <Components.TransferComponent
          accounts={signers}
          currentAccount={selectedReefSigner}
          from={selectedReefSigner}
          provider={provider}
          token={token as TokenWithAmount}
          tokens={signerTokenBalances}
        />
      </div>
      }
    </SigningOrChildren>
  );
};
