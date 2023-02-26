import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';

import MarketplaceAbi from  '../contractsData/Marketplace.json'
import MarketplaceAddress from '../contractsData/Marketplace-address.json'

const useMarketplace = () => {

    const [loading, setLoading] = useState <boolean> (true)
    const [account, setAccount] = useState <string> ('')
    const [signer, setSigner] = useState <JsonRpcSigner> ()
    const [marketplace, setMarketplace] = useState <Contract | undefined> ();
    
    const connect = async (): Promise<void> => {
        
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        const provider: Web3Provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer: JsonRpcSigner = provider.getSigner();
        setSigner(signer);

        // window.ethereum.on('chainChanged', (chainId) => {
        //   window.location.reload();
        // })

        (window as any).ethereum.on('accountsChanged', async function (accounts: string[]) {
        setAccount(accounts[0])
        await connect()
            })

        localStorage.setItem('isWalletConnected', "true");
        
        const marketplace: Contract = new Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
        setMarketplace(marketplace)
        setLoading(false)
    }

    return {connect,
            loading,
            account,
            signer,
            marketplace}

}

export default useMarketplace