import { ethers } from "ethers";
import { Buffer } from 'buffer';
import { useState, useEffect } from 'react';
import { PulseLoader } from 'react-spinners';

import styles from './CSS/Collections.module.css'
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



const Collections = ({ marketplace, account, NFTAbi, signer }) => {
  
  const [loading,setLoading] = useState(true)
  const [collections, setCollections] = useState([])

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
      
      //Push the collection as object in the temporary _collections list.
      _collections.push({
        id: i,
        name: nftname,
        symbol: nftsymbol,
        owner: cols[i].owner,
        image: cols[i].imageLink,
        info: cols[i].info
      })
    
    }
    
    //Pass the collections info to the useState list.
    setCollections(_collections)
    setLoading(false);
  }

  loadCollections()
  
  }, [])



  return (

    <div className={styles.CollectionsContainer}>
      
      { loading ? (
    
      <div className={styles.LoadingComponent}>
        Loading
        <PulseLoader color="#4169E1" />
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
              <div className={styles.CollectionInfo}>
                {x.info}
              </div>
            </div>
          </div>
        </li>
      )}
      </div>
      )}
    </div>
  );
}

export default Collections
