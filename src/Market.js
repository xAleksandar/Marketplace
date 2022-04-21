import { useEffect, useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button, Card } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import HomeItem from './components/HomeItem'
import './App.css'
import { Spinner } from 'react-bootstrap'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const Market = ({ marketplace, account, NFTAbi, signer }) => {

  const [myitems, setMyitems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Loading items..")

  useEffect(() => {
  async function fetchItems() {

    const totalmarketitems = (await marketplace.lengthItems()).toString()
    const changeLoadingMessage = Math.round((totalmarketitems.length / 100 ) * 75)
    let items = []
    
    for (let i = 0; i <=totalmarketitems; i++) {
      
      if (i == changeLoadingMessage) {
        setLoadingMessage("Almost there..")
      }

      let nft = await marketplace.items(i)
      
      if (nft.forSell == true) {
        let NFTcontract = new ethers.Contract(nft.nft, NFTAbi.abi, signer)
        let nftname = await NFTcontract.name()
        let uri = await NFTcontract.tokenURI(nft.tokenId.toString())
        
        let item = {
          name: nftname + " #" + nft.tokenId.toString(),
          collection: nft.nft,
          tokenid: nft.tokenId,
          price: ethers.utils.formatEther(nft.price),
          image: uri
        }
        items.push(item)
      }

    }
    setMyitems(items)
    setLoading(false)
  }
  
fetchItems()}, [])
console.log(myitems.length)

if (myitems.length == 0) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <h5><p className='mx-3 my-0 Loader'>No items to show.</p></h5>
    </div>
  );

} else {

  return (
    <div className="Container">
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
            {myitems.map(x => <li key={x.name}><HomeItem image={x.image} tokenid={x.tokenid} price={x.price} collection={x.collection} marketplace={marketplace} name={x.name} signer={signer} /></li>)}
          </div>
        )}
      </div>
    </div>

  );

}}

export default Market