// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountsContext, AuthorizeRequest, MetadataRequest, SigningRequest } from '@reef-chain/extension-base/background/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';

// import { ApolloClient, ApolloProvider } from '@apollo/client';
// import { Provider } from '@reef-chain/evm-provider';
import { PHISHING_PAGE_REDIRECT } from '@reef-chain/extension-base/defaults';
import { canDerive } from '@reef-chain/extension-base/utils';
import { hooks, Network, ReefSigner } from '@reef-chain/react-lib';
import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router';

import uiSettings from '@polkadot/ui-settings';

import { Bind } from '../../../reef/extension-ui/components/Bind';
import { HeaderComponent } from '../../../reef/extension-ui/components/HeaderComponent';
import { ReefContext } from '../../../reef/extension-ui/components/ReefContext';
import { useReefSigners } from '../../../reef/extension-ui/hooks/useReefSigners';
import { selectAccount } from '../../../reef/extension-ui/messaging';
import { ErrorBoundary, Loading } from '../components';
import { AccountContext, ActionContext, AuthorizeReqContext, MediaContext, MetadataReqContext, ReefStateContext, SettingsContext, SigningReqContext } from '../components/contexts';
import { chooseTheme } from '../components/themes';
import {reefState,network as nw} from "@reef-chain/util-lib";
import ToastProvider from '../components/Toast/ToastProvider';
import { subscribeAccounts, subscribeAuthorizeRequests, subscribeMetadataRequests, subscribeSigningRequests } from '../messaging';
import { buildHierarchy } from '../util/buildHierarchy';
import Accounts from './Accounts';
import AuthList from './AuthManagement';
import Authorize from './Authorize';
import CreateAccount from './CreateAccount';
import Derive from './Derive';
import Export from './Export';
import ExportAll from './ExportAll';
import ExportQr from './ExportQr';
import Forget from './Forget';
import ImportLedger from './ImportLedger';
import ImportQr from './ImportQr';
import ImportSeed from './ImportSeed';
import Metadata from './Metadata';
import PhishingDetected from './PhishingDetected';
import PrivateKey from './PrivateKey';
import RestoreJson from './RestoreJson';
import Signing from './Signing';
import Welcome from './Welcome';
import { Provider } from '@reef-chain/evm-provider';

const startSettings = uiSettings.get();

// Load approprite theme based on user preffered settings
chooseTheme();

// Request permission for video, based on access we can hide/show import
async function requestMediaAccess (cameraOn: boolean): Promise<boolean> {
  if (!cameraOn) {
    return false;
  }

  try {
    await navigator.mediaDevices.getUserMedia({ video: true });

    return true;
  } catch (error) {
    console.error('Permission for video declined', (error as Error).message);
  }

  return false;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function initAccountContext (accounts: AccountJson[], selectedAccount: AccountJson|null): AccountsContext {
  const hierarchy = buildHierarchy(accounts);
  const master = hierarchy.find(({ isExternal, type }) => !isExternal && canDerive(type));

  return {
    accounts,
    hierarchy,
    master,
    selectedAccount
  };
}

const ACTIVE_NETWORK_LS_KEY = 'reef-app-active-network';

const getNetworkFallback = (): Network => {
  let storedNetwork;
  try {
    storedNetwork = localStorage.getItem(ACTIVE_NETWORK_LS_KEY);
    storedNetwork = JSON.parse(storedNetwork!);

    storedNetwork = nw.AVAILABLE_NETWORKS[storedNetwork.name];
  } catch (e) {
    // when cookies disabled localStorage can throw
  }

  return storedNetwork != null ? storedNetwork : nw.AVAILABLE_NETWORKS.mainnet;
};

export default function Popup (): React.ReactElement {
  const [accounts, setAccounts] = useState<null | AccountJson[]>(null);

  const provider: Provider|undefined = hooks.useObservableState(reefState.selectedProvider$);

  const signers = useReefSigners(accounts, provider);

  const [accountCtx, setAccountCtx] = useState<AccountsContext>({ accounts: [], hierarchy: [] });
  const [authRequests, setAuthRequests] = useState<null | AuthorizeRequest[]>(null);
  const [cameraOn, setCameraOn] = useState(startSettings.camera === 'on');
  const [mediaAllowed, setMediaAllowed] = useState(false);
  const [metaRequests, setMetaRequests] = useState<null | MetadataRequest[]>(null);
  const [signRequests, setSignRequests] = useState<null | SigningRequest[]>(null);
  const [isWelcomeDone, setWelcomeDone] = useState(false);
  const [settingsCtx, setSettingsCtx] = useState<SettingsStruct>(startSettings);

  const selectedAddress = hooks.useObservableState(reefState.selectedAddress$);

  const currentSigner: ReefSigner | undefined | null = signers.find(signer=>signer.address===selectedAddress);

  console.log(reefState);
  const network:Network|undefined = hooks.useObservableState(reefState.selectedNetwork$)
  if(!network){
    reefState.setSelectedNetwork(network || getNetworkFallback())
  }

  // const apollo: ApolloClient<any> | undefined = hooks.useObservableState(graphql.apolloClientInstance$);

  const _onAction = useCallback(
    (to?: string): void => {
      setWelcomeDone(window.localStorage.getItem('welcome_read') === 'ok');

      if (to) {
        window.location.hash = to;
      }
    },
    []
  );

  useEffect((): void => {
    Promise.all([
      subscribeAccounts(setAccounts),
      subscribeAuthorizeRequests(setAuthRequests),
      subscribeMetadataRequests(setMetaRequests),
      subscribeSigningRequests(setSignRequests)
    ]).catch(console.error);

    uiSettings.on('change', (settings): void => {
      setSettingsCtx(settings);
      setCameraOn(settings.camera === 'on');
    });

    _onAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect((): void => {
    const onAccounts = async () => {
      const selAcc = (accounts as AccountJson[])?.find((acc) => !!acc.isSelected);

      if (!selAcc && accounts?.length) {
        await selectAccount(accounts[0].address);

        return;
      }

      setAccountCtx(initAccountContext(accounts || [], selAcc || null));

      reefState.setSelectedAddress(selAcc?.address);
    };

    onAccounts().catch((err) => console.log('Error onAccounts ', err));
  }, [accounts]);

  useEffect((): void => {
    requestMediaAccess(cameraOn)
      .then(setMediaAllowed)
      .catch(console.error);
  }, [cameraOn]);

  function wrapWithErrorBoundary (component: React.ReactElement, trigger?: string): React.ReactElement {
    return <ErrorBoundary trigger={trigger}>{component}</ErrorBoundary>;
  }

  const Root = isWelcomeDone
    ? authRequests && authRequests.length
      ? wrapWithErrorBoundary(<Authorize />, 'authorize')
      : metaRequests && metaRequests.length
        ? wrapWithErrorBoundary(<Metadata />, 'metadata')
        : signRequests && signRequests.length
          ? wrapWithErrorBoundary(<Signing />, 'signing')
          : wrapWithErrorBoundary(<Accounts />, 'tokens')
          // : accounts && accounts.length
          //   ? wrapWithErrorBoundary(<Dashboard />, 'tokens')
          //   : wrapWithErrorBoundary(<Accounts />, 'tokens')
    : wrapWithErrorBoundary(<Welcome />, 'welcome');

  return (
    <Loading>{accounts && authRequests && metaRequests && signRequests && (
      <ReefStateContext.Provider value={{reefState,selectedReefSigner:currentSigner,signers,provider,network}}>
      <ActionContext.Provider value={_onAction}>
        <SettingsContext.Provider value={settingsCtx}>
          <AccountContext.Provider value={accountCtx}>
            <AuthorizeReqContext.Provider value={authRequests}>
              <MediaContext.Provider value={cameraOn && mediaAllowed}>
                <MetadataReqContext.Provider value={metaRequests}>
                  <SigningReqContext.Provider value={signRequests}>
                    {/* {apollo && (<ApolloProvider client={apollo}> */}
                      <ReefContext
                        // apollo={apollo}
                        signer={currentSigner}>
                      </ReefContext>
                    {/* </ApolloProvider>)} */}
                    <ToastProvider>
                      {isWelcomeDone && accounts?.length > 0 && authRequests?.length <= 0 && (<HeaderComponent></HeaderComponent>)}
                      <Switch>
                        <Route
                          exact
                          path='/'>{Root}</Route>
                        <Route path='/auth-list'>{wrapWithErrorBoundary(<AuthList />, 'auth-list')}</Route>
                        <Route path='/account/create'>{wrapWithErrorBoundary(<CreateAccount />, 'account-creation')}</Route>
                        <Route path='/account/forget/:address'>{wrapWithErrorBoundary(<Forget />, 'forget-address')}</Route>
                        <Route path='/account/export/:address'>{wrapWithErrorBoundary(<Export />, 'export-address')}</Route>
                        <Route path='/account/export-qr/:address'>{wrapWithErrorBoundary(<ExportQr />, 'export-qr-address')}</Route>
                        <Route path='/account/export-privatekey/:address'>{wrapWithErrorBoundary(<PrivateKey />, 'export-privatekey')}</Route>
                        <Route path='/account/export-all'>{wrapWithErrorBoundary(<ExportAll />, 'export-all-address')}</Route>
                        <Route path='/account/import-ledger'>{wrapWithErrorBoundary(<ImportLedger />, 'import-ledger')}</Route>
                        <Route path='/account/export-privatekey'>{wrapWithErrorBoundary(<PrivateKey />, 'export-privatekey')}</Route>
                        <Route path='/account/import-qr'>{wrapWithErrorBoundary(<ImportQr />, 'import-qr')}</Route>
                        <Route path='/account/import-seed'>{wrapWithErrorBoundary(<ImportSeed />, 'import-seed')}</Route>
                        <Route path='/account/restore-json'>{wrapWithErrorBoundary(<RestoreJson />, 'restore-json')}</Route>
                        <Route path='/account/derive/:address/locked'>{wrapWithErrorBoundary(<Derive isLocked />, 'derived-address-locked')}</Route>
                        <Route path='/account/derive/:address'>{wrapWithErrorBoundary(<Derive />, 'derive-address')}</Route>
                        <Route path='/accounts'>{wrapWithErrorBoundary(<Accounts className='content-comp' />, 'accounts')}</Route>
                        <Route path='/bind'>{wrapWithErrorBoundary(<Bind />, 'bind')}</Route>
                        {/* <Route path='/tokens'>{wrapWithErrorBoundary(<TokenMenu />, 'tokens')}</Route> */}
                        {/* <Route path='/swap'>{wrapWithErrorBoundary(<Swap />, 'swap')}</Route> */}
                        <Route path={`${PHISHING_PAGE_REDIRECT}/:website`}>{wrapWithErrorBoundary(<PhishingDetected />, 'phishing-page-redirect')}</Route>
                      </Switch>
                    </ToastProvider>
                  </SigningReqContext.Provider>
                </MetadataReqContext.Provider>
              </MediaContext.Provider>
            </AuthorizeReqContext.Provider>
          </AccountContext.Provider>
        </SettingsContext.Provider>
      </ActionContext.Provider>
      </ReefStateContext.Provider>
    )}</Loading>
  );
}
