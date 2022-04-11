import { useEffect, useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button, Card } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import CardItem from './components/CardItem'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const MyItems = ({ marketplace, account, NFTAbi, signer }) => {

  const [myitems, setMyitems] = useState([])

  useEffect(() => {
  async function fetchUserItems() {

    const totalmarketitems = (await marketplace.lengthItems()).toString()
    let marketitems = []

    for (let i = 0; i <=totalmarketitems; i++) {
      let nft = await marketplace.items(i)
      marketitems.push(nft)
    }

    let collections = await marketplace.returnCollections()
    let items = []

    for (let i = 0; i < collections.length; i++) {
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
    
              let item = {
                name: nftname + " #" + j.toString(),
                collection: collections[i],
                tokenid: j,
                image: uri
              }

              items.push(item)
            }
          }
        }
      }
    }
    
    setMyitems(items)
  
  }
  fetchUserItems()

  }, [])

  // useEffect(() => fetchUserItems(), [])

  return (
    <div>
      {myitems.map(x => <li key={x.name}><CardItem image={x.image} tokenid={x.tokenid} collection={x.collection} marketplace={marketplace} name={x.name} signer={signer} /></li>)}
    </div>
  );
}

export default MyItems