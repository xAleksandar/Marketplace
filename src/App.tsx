import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers, Contract, ContractInterface } from 'ethers';
import React from "react";
import Navigation from './components/Navbar';
import MarketplaceAbi from  './contractsData/Marketplace.json'
import MarketplaceAddress from './contractsData/Marketplace-address.json'

import Home from './routes/Home';
import MintNFT from './routes/MintNFT';
import Collections from './routes/Collections';
import CreateCollection from './routes/CreateCollection';
import MyItems from './routes/MyItems';
import './App.css';

import NFTAbiFile from "./contractsData/NFT.json";
const NFTAbi: ContractInterface = NFTAbiFile.abi;

//const NFTAbi: ContractInterface = require("./contractsData/NFT.json");

const App: React.FC = () => {
  
  const [loading, setLoading] = useState <boolean> (true);
  const [account, setAccount] = useState <string> ("");
  const [signer, setSigner] = useState <JsonRpcSigner > ();
  const [marketplace, setMarketplace] = useState <Contract | undefined> ();


  // useEffect(() => {
  //   async function fetchUserItems() {
  //     if (localStorage?.getItem('isWalletConnected') === 'true') {
  //       await web3Handler();
  //     }
  //   }
  //     fetchUserItems()
  
  //   }, [])



  // MetaMask Login/Connects
  const web3Handler = async (): Promise<void> => {
    
    const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
    
    // Get provider from Metamask
    const provider: Web3Provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer: JsonRpcSigner = provider.getSigner();
    setSigner(signer);

    // window.ethereum.on('chainChanged', (chainId) => {
    //   window.location.reload();
    // })

    (window as any).ethereum.on('accountsChanged', async function (accounts: string[]) {
      setAccount(accounts[0])
      await web3Handler()
        })

    localStorage.setItem('isWalletConnected', "true");
    loadContracts(signer)
  }



  const loadContracts = async (signer: JsonRpcSigner) => {
    // Get deployed copies of contracts
    const marketplace: Contract = new Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    setMarketplace(marketplace)
    setLoading(false)
    
  }

return (
  <BrowserRouter>
    <div className="App">
        <Navigation className="Navbar" web3Handler={web3Handler} account={account} />
        {loading ? (
          <div className="Body">
            <div className='InfoBox'>
              <div className="InfoText">
                Please connect your wallet.
              </div>
            </div>
          </div>
        ) : (
          <div className="Body">
           <Routes>
             {marketplace && signer && <Route path="/" element={<Home marketplace={marketplace} signer={signer} />} />}
             {marketplace && signer && <Route path="/Collections" element={<Collections marketplace={marketplace} signer={signer} />} />}
             {marketplace && signer && <Route path="/create" element={<CreateCollection marketplace={marketplace} account={account} />} />}
             {marketplace && signer && <Route path="/MintNFT" element={<MintNFT marketplace={marketplace} account={account} NFTAbi={NFTAbi} signer={signer} />} />}
             {/*
             <Route path="/my-listed-items" element={<MyListedItems marketplace={marketplace} account={account} NFTAbi={NFTAbi} signer={signer} />} />
             */}
             {marketplace && signer && <Route path="/my-items" element={<MyItems marketplace={marketplace} account={account} NFTAbi={NFTAbi} signer={signer} />} />}
            </Routes>
          </div>
        )}
      </div>
    
  </BrowserRouter>

);

}
 
export default App;