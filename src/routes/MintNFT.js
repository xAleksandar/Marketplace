import { ethers } from "ethers";
import { Buffer } from 'buffer';
import { useState, useEffect } from 'react';
import { PulseLoader } from 'react-spinners';
import { Form } from 'react-bootstrap';
import Modal from '../components/Modal.js'
import styles from './CSS/MintNFT.module.css';

import infura from '../Infura.json';

//Setup Infura ipfs authentication.
const ipfsClient = require('ipfs-http-client');

const client = ipfsClient.create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
      authorization: 'Basic ' + Buffer.from(infura.ProjectId + ':' + infura.ApiKey).toString('base64')
  },
}); 



const MintNFT = ({ marketplace, account, NFTAbi, signer }) => {
  
  const [loading,setLoading] = useState(true)
  const [collections, setCollections] = useState([])
  const [image, setImage] = useState("");
  const [collectionSellected, setCollectionSellected] = useState(false);
  const [collectionId, setCollectionId] = useState(0);

  //Modal variables.
  const [modal, setOpenModal] = useState(false);
  const [currentModalStep, setCurrentModalStep] = useState(1);
  const [transactionHash, setTransactionHash] = useState("");


  const _ = require("lodash");

  useEffect(() => {
  async function loadCollections() {
    
    //Obtain all collections from marketplace.
    let cols = await marketplace.returnCollections()
    let _collections = [];
    
    //Fetch information for each collection.
    for (let i = 0; i < cols.length; i++) {
      
      let nftcontract = new ethers.Contract(cols[i].Contract, NFTAbi.abi, signer)
      let nftname = await nftcontract.name()
      let nftsymbol = await nftcontract.symbol()
      
      //If account == owner, push the collection as object in the temporary _collections list.
      if (account.toLowerCase() == cols[i].Owner.toLowerCase()) {
        _collections.push({
          id: i,
          name: nftname,
          symbol: nftsymbol,
          contract: cols[i].Contract,
          owner: cols[i].owner,
          image: cols[i].imageLink,
          info: cols[i].info
        })
      }

    }
    
    //Pass the collections info to the useState list.
    setCollections(_collections)
    setLoading(false);
  }

  loadCollections()
  
  }, [])

  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]

    if (typeof file !== 'undefined') {
      try {
        const result = await client.add(file)
        
        setImage(`https://infura-ipfs.io/ipfs/${result.path}`)
      } catch (error){
        console.log("ipfs image upload error: ", error)
      }
    }
  }

  const Mint = async () => {
    setOpenModal(true);
    const transaction = await marketplace.mintNFT(collectionId, image);
    setTransactionHash(transaction.hash)
    setCurrentModalStep(2)
    marketplace.on("nft", async (action, id, issuer) => {
      if (account.toString().toLowerCase() == issuer.toLowerCase()) {
        setCurrentModalStep(3)
      }
    })
  }

  return (

    <div className="CollectionsContainer">
      
      { loading ? (
    
    <div className="LoadingComponent">
    <div className="LoadingMessage">
      Loading
      <PulseLoader color="#4169E1" />
    </div>
  </div>
  
      ) : (
        <div>
        { collectionSellected ? (
          <div className={styles.MintBody}>
          <Form.Control className = "CreateNFTFile" type="file" required name="file" onChange={uploadToIPFS} />
          <div className={styles.ModalBox}>
            {modal && <Modal className={styles.Modal} setOpenModal = {setOpenModal} currentStep = {currentModalStep} transactionHash = {transactionHash} />}
          </div>
          <button className={styles.BackBtn} onClick={() => {
            setCollectionSellected(false)
          }}>
            Back
          </button>
          
          <button className={styles.NFTMintBtn} onClick={() => {
            Mint()
          }}>
            Mint
          </button>
          </div>
          ) : (
      <div>
      
      {collections.map(x =>  
        <li key={x.id}>
          <div className={styles.Collection}>
          <img src={x.image} width="100" height="100" className={styles.CollectionImage} alt="" />
            <div className={styles.CollectionBody}>
              <div className={styles.CollectionNames}>
                <div className={styles.CollectionName}>
                  {x.name}
                </div>
                <div className={styles.CollectionSymbol}>
                  {x.symbol}
                </div>
              </div>
              <div className={styles.CollectionBottom}>
                <div className={styles.CollectionInfo}>
                  {x.info}
                </div>
                <div className={styles.CollectionMintBtnBox}>
                  <button className={styles.CollectionMintBtn} onClick={() => {
                    setCollectionId(x.id)
                    setCollectionSellected(true)
                  }}>
                    Mint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </li>
      )}
      
      </div>
        )}
      </div>
      )}
    </div>
  
  
  );
}

export default MintNFT
