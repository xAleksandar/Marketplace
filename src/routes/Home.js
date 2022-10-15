import { PulseLoader } from 'react-spinners'
import { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { ethers } from "ethers"

import HomeItem from '../components/HomeItem'
import styles from './CSS/Home.module.css'
import Modal from '../components/Modal.js'

const Home = ({ marketplace, account, NFTAbi, signer }) => {

  const [myitems, setMyitems] = useState([])
  const [zeroItems, setZeroItems] = useState(false);
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Loading items..")
  const [userAddress, setUserAddress] = useState("0")
  const [trigger, setTrigger] = useState("")
  
  //Modal variables.
  const [modal, setOpenModal] = useState(false);
  const [currentModalStep, setCurrentModalStep] = useState(1);
  const [transactionHash, setTransactionHash] = useState("");

  const _ = require("lodash");

  const customStyles = {
    overlay: {zIndex: 1000}
  };

  useEffect(() => {
  async function fetchItems() {

    const totalmarketitems = (await marketplace.returnItemsLength()).toString()
    const changeLoadingMessage = Math.round((totalmarketitems.length / 100 ) * 85)
    let items = []
    
    for (let i = 1; i <=totalmarketitems; i++) {
      
      if (i == changeLoadingMessage) {
        setLoadingMessage("Almost there..")
      }

      let nft = await marketplace.items(i)
      let NFTcontract = new ethers.Contract(nft.nft, NFTAbi.abi, signer)
      let nftname = await NFTcontract.name()
      let uri = await NFTcontract.tokenURI(nft.tokenId.toString())
      let item = {}
      console.log(nftname)
      console.log(uri)
      if (userAddress.length > 0) {

        let nftOwner = (await NFTcontract.ownerOf(nft.tokenId)).toLowerCase()
        if (nftOwner.includes(userAddress.toLowerCase())) {
          
          let item = {
            name: nftname + " #" + nft.tokenId.toString(),
            collection: nft.nft,
            tokenid: nft.tokenId,
            price: ethers.utils.formatEther(nft.price),
            image: uri,
            forSell: nft.forSell,
            bidPrice: ethers.utils.formatEther(nft.bidPrice)
          }
          items.push(item)
        }
      
      } else {
        
        items.push({
          name: nftname + " #" + nft.tokenId.toString(),
          collection: nft.nft,
          tokenid: nft.tokenId,
          price: ethers.utils.formatEther(nft.price),
          image: uri,
          forSell: nft.forSell,
          bidPrice: ethers.utils.formatEther(nft.bidPrice)
        })

      }
    }
    
    if (items.length >= 1) {
      setMyitems(items.sort((a, b) => a.name.localeCompare(b.name)))
    } else {
      setZeroItems(true)
    }

    setLoading(false)
    setTrigger("")
    setUserAddress(0)
  }
  
fetchItems()}, [trigger])

const bid = async (id, price) => {
  
  setOpenModal(true);
  const transaction = await marketplace.bidOnNFT(id, { value: price})
  setTransactionHash(transaction.hash)
  setCurrentModalStep(2)
  
  marketplace.on("nft", async (action, id, issuer) => {
    if (account.toString().toLowerCase() == issuer.toLowerCase()) {
      
      setCurrentModalStep(3)
    }
  })

}

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
            <Modal style={customStyles} setOpenModal = {setOpenModal} currentStep = {currentModalStep} transactionHash = {transactionHash} />
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
          {_.chunk(myitems, 4).map(y => <div className={styles.ItemsRow}>{y.map(x => <div className={styles.Item}><li key={x.image}><span><HomeItem className={styles.HomeItem} bid={bid} image={x.image} forSell={x.forSell} tokenid={x.tokenid} price={x.price} bidPrice={x.bidPrice} collection={x.collection} marketplace={marketplace} name={x.name} signer={signer} /></span></li></div>)}</div>)}
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

export default Home