import { hooks, TokenWithAmount, utils } from '@reef-chain/react-lib';
import React,{useContext,useMemo} from 'react';

import { TokenBalances } from './TokenBalances';
import { ReefStateContext } from '@reef-chain/extension-ui/components';

export const TokenMenu = (): JSX.Element => {
  const {reefState} =useContext(ReefStateContext)
  const tokens: TokenWithAmount[] | undefined = hooks.useObservableState(reefState.selectedTokenPrices$);
  const tokensWithPrice= useMemo(
    () => (tokens ? tokens.reduce((prices: any, tkn) => {
      prices[tkn.address] = tkn.price;// eslint-disable-line
      return prices;
    }, {}) : []),
    [tokens],
  );

  return (<>
    <TokenBalances
      tokens={tokensWithPrice || utils.DataProgress.LOADING}
    ></TokenBalances>
  </>);
};
