import { SigningReqContext } from '@reef-chain/extension-ui/components';
import Signing from '@reef-chain/extension-ui/Popup/Signing';
import React, { useContext } from 'react';

interface SigningOrComponent{
  children: any;
}

export const SigningOrChildren = ({ children }: SigningOrComponent): JSX.Element => {
  const signRequests = useContext(SigningReqContext);

  return (
    <>
      {
        <div className={(signRequests && signRequests.length) ? 'd-none' : undefined}>
          {children}
        </div>
      }
      {(!!signRequests && !!signRequests.length) && <Signing />}
    </>
  );
};
