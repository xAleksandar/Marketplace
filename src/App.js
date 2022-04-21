import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Navigation from './Navbar';
import Home from './Home.js'
import Create from './Create.js'
import MyListedItems from './MyListedItems.js'
import MintNFT from './MintNFT.js'
import MyItems from './MyItems.js'
import Market from './Market.js'
import MarketplaceAbi from  './contractsData/Marketplace.json'
import MarketplaceAddress from './contractsData/Marketplace-address.json'
import NFTFactoryAbi from './contractsData/NFTFactory.json'
import NFTFactoryAddress from './contractsData/NFTFactory-address.json'
import NFTAbi from './contractsData/NFT.json'
import { useState } from 'react'
import { ethers } from "ethers"
import { Spinner } from 'react-bootstrap'

import './App.css';

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [signer, setSigner] = useState(undefined);
  const [nftfactory, setNFTFactory] = useState({})
  const [marketplace, setMarketplace] = useState({})
  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()
    setSigner(signer)

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await web3Handler()
        })
    loadContracts(signer)
  }
  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    setMarketplace(marketplace)
    const nft = new ethers.Contract(NFTFactoryAddress.address, NFTFactoryAbi.abi, signer)
    setNFTFactory(nft)
    setLoading(false)
  }

  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navigation className="Navibar" web3Handler={web3Handler} account={account} />
        </>
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <h5><p className='mx-3 my-0 Loader'>Please connect your wallet.</p></h5>
            </div>
          ) : (
            <Routes>
              <Route path="/"  element={<Home marketplace={marketplace} account={account} NFTAbi={NFTAbi} signer={signer} />} />
              <Route path="/Market"  element={<Market marketplace={marketplace} account={account} NFTAbi={NFTAbi} signer={signer} />} />
              <Route path="/create" element={<Create marketplace={marketplace} />}/>
              <Route path="/MintNFT" element={<MintNFT marketplace={marketplace} account={account} NFTAbi={NFTAbi} signer={signer}/>}/>
              <Route path="/my-listed-items" element={<MyListedItems marketplace={marketplace} account={account} NFTAbi={NFTAbi} signer={signer} />} />
              <Route path="/my-items" element={<MyItems marketplace={marketplace} account={account} NFTAbi={NFTAbi} signer={signer} />} />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>

  );
}

export default App;
