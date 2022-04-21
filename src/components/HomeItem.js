import React, {useState} from 'react'
import { Row, Form, Button } from 'react-bootstrap'
import './Item.css'
import { ethers } from "ethers"
import MarketplaceAbi from  './../contractsData/Marketplace.json'
import MarketplaceAddress from './../contractsData/Marketplace-address.json'
import NFTAbi from './../contractsData/NFT.json'

const HomeItem = (props) => {

    const [price, setPrice] = useState(null)
    const [bidprice, setBidPrice] = useState(0)
    const [bidstate, setBidState] = useState(0)

    async function buyNFT() {
        const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, props.signer)
        const totalitems = (await marketplace.lengthItems()).toString()
        
        for (let i = 0; i <=totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            let price = nft.price
            
            if (nftid == props.tokenid && nftaddress == props.collection) {
                let buy = await marketplace.buyNFT(i, { value: price})
            }
        }
    }


    async function bid() {
        const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, props.signer)
        const totalitems = (await marketplace.lengthItems()).toString()
        const weiprice = ethers.utils.parseEther(bidprice.toString())

        for (let i = 0; i <= totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            
            if (nftid == props.tokenid && nftaddress == props.collection) {
                let bidnft = await marketplace.bidOnNFT(i, { value: weiprice})
            }
        }
    }


    function changeBidState() {
        
        if (bidstate == 1) {
            bid()
            setBidState(0)
        }
        
        if (bidstate == 0) {
            setBidState(1)
        }
    }


if (props.forSell == true) {
    return (
        <div className="card">
            <div className="card__body">
                <img src={props.image} className="card__image" />
                <h2 className="card__title">{props.name}</h2>
                <h2 className="card__info">Price: {props.price} ETH</h2>
            </div>
            <button onClick={() => buyNFT()} className="card__btn"><h5>Buy NFT</h5></button>
        </div>
    )
} else {
    if (bidstate == 1){
        return (
            <div className="card">
                <div className="card__body">
                    <img src={props.image} className="card__image" />
                    <h2 className="card__title">{props.name}</h2>
                    <h2 className="card__info">Current Bid: {props.bidPrice} ETH</h2>
                </div>
                
                <Form.Control className="card__price__bar" onChange={(e) => setBidPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
                <button onClick={() => changeBidState()} className="card__btn__bid"><h5>Outbid</h5></button>
            </div>
    )

    } else {
        return (
            <div className="card">
                <div className="card__body">
                    <img src={props.image} className="card__image" />
                    <h2 className="card__title">{props.name}</h2>
                    <h2 className="card__info">Current Bid: {props.bidPrice} ETH</h2>
                </div>

                <button onClick={() => changeBidState()} className="card__btn__bid"><h5>Outbid</h5></button>
            </div>   
    )
    } 
}} 

export default HomeItem
