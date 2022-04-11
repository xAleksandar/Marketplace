import { useEffect, useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button, Card } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import HomeItem from './components/HomeItem'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const Home = ({ marketplace, account, NFTAbi, signer }) => {

  const [myitems, setMyitems] = useState([])

  useEffect(() => {
  async function fetchItems() {

    const totalmarketitems = (await marketplace.lengthItems()).toString()
    let items = []

    for (let i = 0; i <=totalmarketitems; i++) {
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
  }
  
fetchItems()}, [])

  return (
    <div>
      {myitems.map(x => <li key={x.name}><HomeItem image={x.image} tokenid={x.tokenid} price={x.price} collection={x.collection} marketplace={marketplace} name={x.name} signer={signer} /></li>)}
    </div>
  );
}

export default Home