import { useEffect, useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button, Card } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import CardItem from './components/CardItem'
import MarketplaceAddress from './contractsData/Marketplace-address.json'
import { Spinner } from 'react-bootstrap'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const MyItems = ({ marketplace, account, NFTAbi, signer }) => {

  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Loading items..")
  const [myitems, setMyitems] = useState([])
  const [userAddress, setUserAddress] = useState("0")
  const [trigger, setTrigger] = useState("")

  useEffect(() => {
  async function fetchUserItems() {

    const totalmarketitems = (await marketplace.lengthItems()).toString()
    let marketitems = []

    for (let i = 0; i <=totalmarketitems; i++) {
      let nft = await marketplace.items(i)
      marketitems.push(nft)
    }

    let collections = await marketplace.returnCollections()
    const changeLoadingMessage = Math.round((collections.length / 100 ) * 50)
    let items = []

    for (let i = 0; i < collections.length; i++) {
      
      if (i == changeLoadingMessage) {
        setLoadingMessage("Almost there..")
      }

      let NFTcontract = new ethers.Contract(collections[i], NFTAbi.abi, signer)
      let NFTcount = (await NFTcontract.tokenCount()).toString()

      for (let j = 1; j <= NFTcount; j++) {

        let NFTOwner = await NFTcontract.ownerOf(j)
        if (NFTOwner.toLowerCase() == account) {
          
          for (let z = 0; z <= totalmarketitems; z++){
              
            if (
              marketitems[z].nft.toLowerCase() == collections[i].toLowerCase() &&
              marketitems[z].tokenId.toString() == j &&
              marketitems[z].forSell == false &&
              NFTOwner.toLowerCase() == account

              ) {

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

  if (myitems.length == 0) {
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
                {myitems.map(x => <li key={x.name}><span><CardItem image={x.image} tokenid={x.tokenid} approved={x.approved} collection={x.collection} bidPrice={x.bidPrice} marketplace={marketplace} name={x.name} signer={signer} /></span></li>)}
              </div>
            )}
          </div>
        </div>
    );
}}

export default MyItems