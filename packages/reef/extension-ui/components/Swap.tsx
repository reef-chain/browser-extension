import { Components, hooks, reefTokenWithAmount, Settings, store, Token } from '@reef-chain/react-lib';
import React, { useContext, useReducer } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ReefStateContext, TokenContext, TokenPricesContext } from '../../../extension-ui/src/components/contexts';
import { Loading } from '../uik';
import { SigningOrChildren } from './SigningOrChildren';
import { addressReplacer, notify, SPECIFIED_SWAP_URL, UrlAddressParams } from './utils';

const { SwapComponent } = Components;
const REEF_ADDRESS = reefTokenWithAmount().address;

export const Swap = (): JSX.Element => {
  const history = useHistory();
  const tokens = useContext(TokenContext);
  const tokenPrices = useContext(TokenPricesContext);
  const { address1, address2 } = useParams<UrlAddressParams>();
  const theme = localStorage.getItem('theme');
  const {network,selectedReefSigner}= useContext(ReefStateContext)
  const [state, dispatch] = useReducer(store.swapReducer, store.initialSwapState);

  // hook manages all necessary swap updates
  hooks.useSwapState({
    address1: address1 || REEF_ADDRESS,
    address2,
    dispatch,
    state,
    tokens,
    tokenPrices,
    account: selectedReefSigner || undefined
  });

  // Actions
  const onSwap = hooks.onSwap({
    state,
    network:network as any,
    account: selectedReefSigner || undefined,
    dispatch,
    notify,
    updateTokenState: async () => {}, // eslint-disable-line
  });

  const onSwitch = (): void => {
    dispatch(store.switchTokensAction());
    dispatch(store.clearTokenAmountsAction());
    history.push(addressReplacer(SPECIFIED_SWAP_URL, state.token2.address, state.token1.address));
  };

  const selectToken1 = (token: Token): void => {
    dispatch(store.setToken1Action(token));
    dispatch(store.clearTokenAmountsAction());
    history.push(addressReplacer(SPECIFIED_SWAP_URL, token.address, state.token2.address));
  };

  const selectToken2 = (token: Token): void => {
    dispatch(store.setToken2Action(token));
    dispatch(store.clearTokenAmountsAction());
    history.push(addressReplacer(SPECIFIED_SWAP_URL, state.token1.address, token.address));
  };

  const setSettings = (settings: Settings): void => dispatch(store.setSettingsAction(settings));
  const setToken1Amount = (amount: string): void => dispatch(store.setToken1AmountAction(amount));
  const setToken2Amount = (amount: string): void => dispatch(store.setToken2AmountAction(amount));

  const actions: store.SwapComponentActions = {
    onAddressChange: async () => {}, // eslint-disable-line
    setPercentage: async () => {}, // eslint-disable-line
    onSwap,
    onSwitch,
    selectToken1,
    selectToken2,
    setSettings,
    setToken1Amount,
    setToken2Amount
  };

  return (
    <SigningOrChildren>
      {(!tokens || !selectedReefSigner || !network) && <Loading />}
      {!!selectedReefSigner && !!network &&
          <div className={theme === 'dark' ? 'theme-dark' : ''}>
            <SwapComponent
              tokens={tokens}
              account={selectedReefSigner}
              state={state}
              actions={actions}
            />
          </div>
      }
    </SigningOrChildren>
  );
};
