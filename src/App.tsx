import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navigation from './components/Navbar';
import React from "react";

import Home from './routes/Home';
import MintNFT from './routes/MintNFT';
import Collections from './routes/Collections';
import CreateCollection from './routes/CreateCollection';
import MyListedItems from './routes/MyListedItems';
import MyItems from './routes/MyItems';

import useMarketplace from './hooks/useMarketplace';
import NFTAbi from "./contractsData/NFT.json";
import './App.css';

const App: React.FC = () => {
  
const {connect, loading, account, signer, marketplace} = useMarketplace();

return (
  <BrowserRouter>
    <div className="App">
        <Navigation className="Navbar" web3Handler={connect} account={account} />
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
             {marketplace && signer && <Route path="/collections" element={<Collections marketplace={marketplace} signer={signer} />} />}
             {marketplace && signer && <Route path="/create" element={<CreateCollection marketplace={marketplace} signer={signer} account={account} />} />}
             {marketplace && signer && <Route path="/mintNFT" element={<MintNFT marketplace={marketplace} account={account} signer={signer} />} />}
             {marketplace && signer && <Route path="/my-listed-items" element={<MyListedItems marketplace={marketplace} account={account} NFTAbi={NFTAbi.abi} signer={signer} />} />}
             {marketplace && signer && <Route path="/my-items" element={<MyItems marketplace={marketplace} account={account} NFTAbi={NFTAbi.abi} signer={signer} />} />}
            </Routes>
          </div>
        )}
      </div>
    
  </BrowserRouter>

);

}
 
export default App;