import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Navigation from './components/Navbar';
import Home from './routes/Home.js'
import CreateCollection from './routes/CreateCollection.js'
import MyListedItems from './MyListedItems.js'
import MintNFT from './routes/MintNFT.js'
import MyItems from './oldMyItems.js'
import Collections from './routes/Collections.js' 

import MarketplaceAbi from  './contractsData/Marketplace.json'
import MarketplaceAddress from './contractsData/Marketplace-address.json'

import NFTAbi from './contractsData/NFT.json'

import { useEffect, useState } from 'react'
import { ethers } from "ethers"
import { Spinner } from 'react-bootstrap'

import './App.css';

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [signer, setSigner] = useState(undefined);
  const [nftfactory, setNFTFactory] = useState({})
  const [marketplace, setMarketplace] = useState({})
  
  useEffect(() => {
    async function fetchUserItems() {
      if (localStorage?.getItem('isWalletConnected') === 'true') {
        await web3Handler();
      }
    }
      fetchUserItems()
  
    }, [])

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
  
    localStorage.setItem('isWalletConnected', true)
    loadContracts(signer)
  }


  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    setMarketplace(marketplace)
    setLoading(false)
    
  }

  return (
    <BrowserRouter>
      <div className="App">
        <div className="NaviBox">
          <Navigation className="Navibar" web3Handler={web3Handler} account={account} />
        </div>
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <h5><p className='text-4xl Loader'>Please connect your wallet.</p></h5>
            </div>
          ) : (
            <Routes>
              <Route path="/"  element={<Home marketplace={marketplace} account={account} NFTAbi={NFTAbi} signer={signer} />} />
              <Route path="/Collections" element={<Collections marketplace={marketplace} account={account} NFTAbi={NFTAbi} signer={signer}/>}/>
              <Route path="/create" element={<CreateCollection marketplace={marketplace} account={account}/>}/>
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
