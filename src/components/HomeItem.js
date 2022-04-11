import React, {useState} from 'react'
import { Row, Form, Button } from 'react-bootstrap'
import './Item.css'
import { ethers } from "ethers"
import MarketplaceAbi from  './../contractsData/Marketplace.json'
import MarketplaceAddress from './../contractsData/Marketplace-address.json'
import NFTAbi from './../contractsData/NFT.json'

const CardItem = (props) => {

    const [price, setPrice] = useState(null)

    async function buyNFT() {
        const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, props.signer)
        const totalitems = (await marketplace.lengthItems()).toString()
        
        for (let i = 0; i <=totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            let price = nft.price
            
            if (nftid == props.tokenid && nftaddress == props.collection) {
                console.log("in loop")
                
                let buy = await marketplace.buyNFT(i, { value: price})
        
            }
        }
    }

    return (
        <div className="card">
            <div className="card__body">
                <img src={props.image} className="card__image" />
                <h2 className="card__title">{props.name} (=) Price: {props.price} ETH</h2>
            </div>
            <button onClick={() => buyNFT()} className="card__btn">Buy NFT</button>
        </div>
    )
}

export default CardItem