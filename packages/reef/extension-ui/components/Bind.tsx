import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionContext, ReefStateContext, SigningReqContext } from '@reef-chain/extension-ui/components';
import { useTranslation } from '@reef-chain/extension-ui/components/translate';
import { Header } from '@reef-chain/extension-ui/partials';
import { Components, ReefSigner } from '@reef-chain/react-lib';
import { TxStatusUpdate } from '@reef-chain/react-lib/dist/utils';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import type {UpdateAction} from "@reef-chain/util-lib/dist/reefState"
import { SigningOrChildren } from './SigningOrChildren';

const onTxUpdate = (state: TxStatusUpdate) => {
  const {reefState} = useContext(ReefStateContext);
  let updateActions: UpdateAction[] = [];

  if (state.componentTxType === Components.EvmBindComponentTxType.BIND) {
    // bind
    if (state.addresses && state.addresses.length) {
      state.addresses.forEach((address) => {
        updateActions.push({
          address,
          type: reefState.UpdateDataType.ACCOUNT_EVM_BINDING
        } as UpdateAction);
        updateActions.push({
          address,
          type: reefState.UpdateDataType.ACCOUNT_NATIVE_BALANCE
        } as UpdateAction);
      });
    } else {
      updateActions = [{ type: reefState.UpdateDataType.ACCOUNT_EVM_BINDING }, { type: reefState.UpdateDataType.ACCOUNT_NATIVE_BALANCE }];
    }
  } else {
    // transaction
    updateActions = state.addresses && state.addresses.length
      ? state.addresses.map((address) => ({
        address,
        type: reefState.UpdateDataType.ACCOUNT_NATIVE_BALANCE
      } as UpdateAction))
      : [{ type: reefState.UpdateDataType.ACCOUNT_NATIVE_BALANCE }];
  }
  reefState.onTxUpdateResetSigners(state, updateActions);
};

export const Bind = (): JSX.Element => {
  const { t } = useTranslation();
  const {signers,selectedReefSigner} = useContext(ReefStateContext)
  const [bindSigner, setBindSigner] = useState<ReefSigner>();
  const theme = localStorage.getItem('theme');
  const requests = useContext(SigningReqContext);
  const hasSignRequests = requests.length > 0;
  const onAction = useContext(ActionContext);

  useEffect(() => {
    const [, params] = window.location.href.split('?');
    const urlParams = params?.split('&').map((e) => e.split('=').map(decodeURIComponent)).reduce((r: any, [k, v]) => {
      r[k] = v;

      return r;
    }, {});
    const { bindAddress } = urlParams || {};
    let paramAccount;

    if (bindAddress) {
      paramAccount = signers?.find((acc) => acc.address === bindAddress);
    }

    setBindSigner(paramAccount || selectedReefSigner || undefined);
  }, [signers, selectedReefSigner]);

  const _goHome = useCallback(
    () => onAction('/'),
    [onAction]
  );

  return (
    <>
      {!hasSignRequests && (<Header
        showLogo
        text={t<string>('Connect EVM')}
      >
        <div className='steps'>
          <button
            className='popup__close-btn'
            type='button'
            onClick={_goHome}>
            <FontAwesomeIcon
              className='popup__close-btn-icon'
              icon={faTimes as IconProp}
              title='Close'
            />
          </button>
        </div>
      </Header>)
      }
      {!hasSignRequests && (<div className='section__container--space'></div>)}
      <SigningOrChildren>
        {bindSigner && signers && (<div className={theme === 'dark' ? 'theme-dark' : ''}>
          <Components.EvmBindComponent
            bindSigner={bindSigner}
            onTxUpdate={onTxUpdate}
            signers={signers}
            onComplete={_goHome}
          ></Components.EvmBindComponent></div>)}
      </SigningOrChildren>
    </>
  );
};