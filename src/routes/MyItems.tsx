import { PulseLoader } from 'react-spinners'
import { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { ethers, Contract, ContractInterface } from "ethers"
import { JsonRpcSigner } from '@ethersproject/providers';
import MarketplaceAddress from '../contractsData/Marketplace-address.json'

import PersonalItem from '../components/PersonalItem'
import styles from './CSS/MyItems.module.css'
import Modal from '../components/Modal'

import marketNFT from '../types/marketNFT';

const MyItems = ({ marketplace, account, NFTAbi, signer } : {marketplace: Contract , account: string, NFTAbi: ContractInterface, signer: JsonRpcSigner}) => {    

  const [myitems, setMyitems] = useState <marketNFT[]> ([])
  const [zeroItems, setZeroItems] = useState <boolean> (false);
  const [loading, setLoading] = useState <boolean> (true)
  const [loadingMessage, setLoadingMessage] = useState <string> ("Loading items..")
  const [userAddress, setUserAddress] = useState <string> ("0")
  const [trigger, setTrigger] = useState <string> ("")
  
  //Modal variables.
  const [modal, setOpenModal] = useState(false);
  const [currentModalStep, setCurrentModalStep] = useState(1);
  const [transactionHash, setTransactionHash] = useState("");

  const _ = require("lodash");

  useEffect(() => {
  async function fetchItems() {

    const totalmarketitems = parseInt((await marketplace.returnItemsLength()).toString())
    const changeLoadingMessage = Math.round((totalmarketitems / 100 ) * 85)
    let items: marketNFT[] = []
    
    for (let i = 1; i <=totalmarketitems; i++) {
      console.log('Looking for item: ', i);
      if (i == changeLoadingMessage) {
        setLoadingMessage("Almost there..")
      }

      let nft = await marketplace.items(i)
      let NFTcontract = new ethers.Contract(nft.nft, NFTAbi, signer)
      let NFTOwner = await NFTcontract.ownerOf(nft.tokenId)
        
      
      if (NFTOwner.toLowerCase() == account.toLowerCase()) {
        let nftname = await NFTcontract.name()
        let uri = await NFTcontract.tokenURI(nft.tokenId.toString())

        let isApproved = false;
        let NFTOwner = await NFTcontract.getApproved(nft.tokenId)
        if (NFTOwner.toLowerCase() == MarketplaceAddress.address.toLowerCase()) {
          isApproved = true;
        }
         
        items.push({
          name: nftname + " #" + nft.tokenId.toString(),
          tokenId: nft.tokenId,
          collection: nft.nft,
          price: ethers.utils.formatEther(nft.price),
          bidPrice: ethers.utils.formatEther(nft.bidPrice),
          rentPrice: nft.rentPrice,
          rentPeriod: nft.rentPeriod,
          bidAddress: nft.bidAddress,
          forSell: nft.forSell,
          forRent: nft.forRent,
          image: uri,
          isMarketplaceApproved: isApproved
        })

      } //End of loop
    
      if (items.length >= 1) {
        setMyitems(items.sort((a, b) => a.name.localeCompare(b.name)))
      } else {
        setZeroItems(true)
      }
    
  }
  
  setLoading(false)
  console.log('Loading False')
  setTrigger("")
  setUserAddress("")

}
fetchItems()}, [trigger])

const bid = async (id: number, price: string) => {
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
    
    <div className={styles.InfoBox}>
      <div className={styles.InfoText}>
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
            <Modal className={styles.Modal} setOpenModal = {setOpenModal} currentStep = {currentModalStep} transactionHash = {transactionHash} />
          </div>
        ) : (
          <div>   
            <div className={styles.ItemContainer}>
              {_.chunk(myitems, 4).map((y: marketNFT[]) => <div className={styles.ItemsRow}>{y.map(x => <div className={styles.Item}><li key={x.image}><span><PersonalItem marketItem ={x} marketplace={marketplace} NFTAbi={NFTAbi} signer={signer} /></span></li></div>)}</div>)}
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

export default MyItems