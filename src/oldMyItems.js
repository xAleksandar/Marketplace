import { useEffect, useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button, Card } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import CardItem from './components/CardItem'
import MarketplaceAddress from './contractsData/Marketplace-address.json'
import { Spinner } from 'react-bootstrap'
import styles from './routes/CSS/MyItems.module.css'
import { PulseLoader } from 'react-spinners'
import Modal from './components/Modal.js'


const MyItems = ({ marketplace, account, NFTAbi, signer }) => {

  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Loading items..")
  const [myitems, setMyitems] = useState([])
  const [zeroItems, setZeroItems] = useState(false);
  const [userAddress, setUserAddress] = useState("0")
  const [trigger, setTrigger] = useState("")
  
  //Modal variables.
  const [modal, setOpenModal] = useState(false);
  const [currentModalStep, setCurrentModalStep] = useState(1);
  const [transactionHash, setTransactionHash] = useState("");

  const _ = require("lodash");
  
  useEffect(() => {
  async function fetchUserItems() {

    const totalmarketitems = (await marketplace.returnItemsLength()).toString()
    let marketitems = []

    for (let i = 0; i <=totalmarketitems; i++) {
      let nft = await marketplace.items(i)
      console.log('11121')
      marketitems.push(nft)
    }

    let collections = await marketplace.returnCollections()
    const changeLoadingMessage = Math.round((collections.length / 100 ) * 50)
    let items = []

    for (let i = 0; i < collections.length; i++) {
      
      if (i == changeLoadingMessage) {
        setLoadingMessage("Almost there..")
      }

      let NFTcontract = new ethers.Contract(collections[i].Contract, NFTAbi.abi, signer)
      let NFTcount = (await NFTcontract.tokenCount()).toString()
      console.log('Reached 2')
      for (let j = 1; j <= NFTcount; j++) {

        let NFTOwner = await NFTcontract.ownerOf(j)
        if (NFTOwner.toLowerCase() == account) {
          console.log('Reched 3')
          for (let z = 0; z <= totalmarketitems; z++){
              
            if (
              marketitems[z].nft.toLowerCase() == collections[i].Contract.toLowerCase() &&
              marketitems[z].tokenId.toString() == j &&
              marketitems[z].forSell == false &&
              NFTOwner.toLowerCase() == account

              ) {
              console.log('Reached 4')
              let uri = await NFTcontract.tokenURI(j)
              let nftname = await NFTcontract.name()
              let approvedAddress = await NFTcontract.getApproved(j)
              let isMarketplaceApproved = false;

              if (approvedAddress.toLowerCase() == MarketplaceAddress.address.toLowerCase()) {
                isMarketplaceApproved = true;
              }

              let item = {
                name: nftname + " #" + j.toString(),
                collection: collections[i],
                tokenid: j,
                image: uri,
                approved: isMarketplaceApproved,
                bidPrice: ethers.utils.formatEther(marketitems[z].bidPrice)
              }

              items.push(item)
            }
          }
        }
      }
    }
    
    setMyitems(items)
    setLoading(false)
  }
  fetchUserItems()

  }, [])

  return (

    <div>
  
    { loading ? (
      
      <div className="LoadingComponent">
        <div className="LoadingMessage">
          {loadingMessage}
          <PulseLoader color="#4169E1" />
        </div>
      </div>
    
    ) : ( 
      
      <div className={styles.Container}>
        
        { zeroItems ? (
          <div className={styles.LoadingComponent}>
            <div className={styles.LoadingMessage}>
            No any items to show.
            </div>
          </div>
        ) : (
        <div>
  
          { modal ? (
            <div className={styles.Modal}>
              <Modal setOpenModal = {setOpenModal} currentStep = {currentModalStep} transactionHash = {transactionHash} />
            </div>
          ) : (
            <div>   
          <div className={styles.AddressSearchBox}>
            <Form.Control className={styles.AddressSearchBar} onChange={(e) => setUserAddress(e.target.value)} size="lg" placeholder="Search By Address" />
            <button onClick={() => setTrigger("trigger")} className={styles.AddressSearchBtn}>Search</button>
          </div>
          <div className={styles.ItemContainer}>      
            <div className={styles.ModalBox}>
                     
            </div>
            {_.chunk(myitems, 4).map(y => <div className={styles.ItemsRow}>{y.map(x => <div className={styles.Item}><li key={x.image}><span><CardItem image={x.image} tokenid={x.tokenid} approved={x.approved} collection={x.collection} bidPrice={x.bidPrice} marketplace={marketplace} name={x.name} signer={signer} /></span></li></div>)}</div>)}
          </div>
          </div>
          )}
        
        </div>
        )}
      </div>
  
    // loading end.
    )}
  
    </div>
  
  //Return and Function end.
  )}

  {/*if (myitems.length == 0) {
    return (
      <div className="App">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <h5><p className='mx-3 my-0 Loader'>No items to show.</p></h5>
        </div>
      </div>
    );
  
  } else {

    return (
        <div className="App">
          <div>
            {loading ? (
              <div className="Loader">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                  <h5><Spinner className="Loader" animation="border" style={{ display: 'flex' }} /></h5>
                  <h5><p className='mx-3 my-0 Loader'>{loadingMessage}</p></h5>
                </div>
              </div>
            ) : (
              <div className="Container">
                {_.chunk(myitems, 4).map(y => <div className="ItemRow">{y.map(x => <div className="Item"><li key={x.image}><span><CardItem image={x.image} tokenid={x.tokenid} approved={x.approved} collection={x.collection} bidPrice={x.bidPrice} marketplace={marketplace} name={x.name} signer={signer} /></span></li></div>)}</div>)}
              </div>
            )}
          </div>
        </div>
    );
}} */}

export default MyItems