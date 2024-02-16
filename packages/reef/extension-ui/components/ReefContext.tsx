import { PoolContext, ReefStateContext, TokenContext, TokenPricesContext } from '@reef-chain/extension-ui/components';
import { hooks, ReefSigner } from '@reef-chain/react-lib';
import React, { useMemo,useContext } from 'react';
import axios from 'axios';

export const ReefContext = (props: {children?: any; signer?: ReefSigner|null}): JSX.Element => {
  const {reefState} = useContext(ReefStateContext)
  const tokens:any = hooks.useObservableState(reefState.selectedTokenPrices$,[]);
  const pools = hooks.useAllPools(axios as any);
  const tokenPrices= useMemo(
    // eslint-disable-line
    () => (tokens ? tokens.reduce((prices: any, tkn:any) => {
      prices[(tkn as any).address] = tkn.price;// eslint-disable-line
      return prices;
    }, {}) : []),
    [tokens],
  );

  return (<>
  
    <TokenContext.Provider value={tokens[0]}>
      <PoolContext.Provider value={pools}>
        <TokenPricesContext.Provider value={tokenPrices}>
          {props.children}
        </TokenPricesContext.Provider>
      </PoolContext.Provider>
    </TokenContext.Provider>
  </>);
};
