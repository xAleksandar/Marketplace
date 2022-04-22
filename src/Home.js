import { useEffect, useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button, Card } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import HomeItem from './components/HomeItem'
import './App.css'
import { Spinner } from 'react-bootstrap'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const Home = ({ marketplace, account, NFTAbi, signer }) => {

  const [myitems, setMyitems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Loading items..")
  const [userAddress, setUserAddress] = useState("0")
  const [trigger, setTrigger] = useState("")

  useEffect(() => {
  async function fetchItems() {

    const totalmarketitems = (await marketplace.lengthItems()).toString()
    const changeLoadingMessage = Math.round((totalmarketitems.length / 100 ) * 75)
    let items = []
    let item = {}
    console.log(userAddress)
    for (let i = 1; i <=totalmarketitems; i++) {
      
      if (i == changeLoadingMessage) {
        setLoadingMessage("Almost there..")
      }

      let nft = await marketplace.items(i)
      let NFTcontract = new ethers.Contract(nft.nft, NFTAbi.abi, signer)
      let nftname = await NFTcontract.name()
      let uri = await NFTcontract.tokenURI(nft.tokenId.toString())
      let item = {}

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

    }
    setMyitems(items)
    setLoading(false)
    setTrigger("")
    setUserAddress(0)
  }
  
fetchItems()}, [trigger])

if (myitems.length == 0) {
  return (
    <div className="App">
      <div className="Home__Body">
        <Form.Control className="address__search__bar" onChange={(e) => setUserAddress(e.target.value)} size="lg" placeholder="Search By Address" />
        <button onClick={() => setTrigger("trigger")} className="address__search__btn">Search</button>
      </div>
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
          <div className="App">
            <div className="Home__Body">
              <Form.Control className="address__search__bar" onChange={(e) => setUserAddress(e.target.value)} size="lg" placeholder="Search By Address" />
              <button onClick={() => setTrigger("trigger")} className="address__search__btn">Search</button>
            </div>
            <div className="Container">
              {myitems.map(x => <li key={x.image}><span><HomeItem image={x.image} forSell={x.forSell} tokenid={x.tokenid} price={x.price} bidPrice={x.bidPrice} collection={x.collection} marketplace={marketplace} name={x.name} signer={signer} /></span></li>)}
            </div>
          </div>
        )}
      </div>
    </div>

  );

}}

export default Home