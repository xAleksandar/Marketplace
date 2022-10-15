import React, {useState} from 'react'
import { Row, Form, Button } from 'react-bootstrap'
import './Item.css'
import { ethers } from "ethers"
import MarketplaceAbi from  './../contractsData/Marketplace.json'
import MarketplaceAddress from './../contractsData/Marketplace-address.json'
import NFTAbi from './../contractsData/NFT.json'

const CardItem = (props) => {

    const [price, setPrice] = useState(null)
    const [sellstate, setSellState] = useState(0)

    async function approveMarketplace() {
        const NFTcontract = new ethers.Contract(props.collection.Contract, NFTAbi.abi, props.signer)
        const approved = await NFTcontract.approve(MarketplaceAddress.address, props.tokenid)
        await new Promise(r => setTimeout(r, 6000));
        window.location.reload()
    }

    function changeSellState() {
        
        if (sellstate == 1) {
            sell()
            setSellState(0)
        }
        
        if (sellstate == 0) {
            setSellState(1)
        }
    }

    async function acceptBid() {
        const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, props.signer)
        const totalitems = (await marketplace.returnItemsLength()).toString()

        for (let i = 0; i <= totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            
            if (nftid == props.tokenid && nftaddress == props.collection.Contract) {
                let bidnft = await marketplace.acceptBid(i)
            }
        }
    }

    async function sell() {
        const weiprice = ethers.utils.parseEther(price.toString())
        const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, props.signer)
        const totalitems = (await marketplace.returnItemsLength()).toString()
        
        for (let i = 0; i <=totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            
            if (nftid == props.tokenid && nftaddress == props.collection.Contract) {
                await marketplace.sellNFT(i, weiprice)
            }
        }
    }

    if (props.approved == true && props.bidPrice == 0) {
        
        if (sellstate == 0) {
            return (
                <div className="card">
                    <div className="card__body">
                        <img src={props.image} className="card__image" />
                        <h2 className="card__title">{props.name}</h2>
                        <h2 className="card__info">Current Bid: {props.bidPrice} ETH</h2>
                    </div>
                    
                    <button onClick={() => changeSellState()} className="card__btn">sell</button>
                </div>
            )
        }
        
        if (sellstate == 1) {
            return (
                <div className="card">
                    <div className="card__body">
                        <img src={props.image} className="card__image" />
                        <h2 className="card__title">{props.name}</h2>
                    </div>
                    <Form.Control className="card__price__bar" onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
                    <button onClick={() => changeSellState()} className="card__btn">sell</button>
                </div>
            )    
        }

    } else if (props.approved == true && props.bidPrice > 0) {

        if (sellstate == 0) {
            return (
                <div className="card">
                    <div className="card__body">
                        <img src={props.image} className="card__image" />
                        <h2 className="card__title">{props.name}</h2>
                        <h2 className="card__info">Current Bid: {props.bidPrice} ETH</h2>
                    </div>
                    
                    <div className="btn__mini">
                        <button onClick={() => acceptBid()} className="card__btn__bid__mini">Accept Bid</button>
                        <button onClick={() => changeSellState()} className="card__btn__sell__mini">Sell</button>
                    </div>
                </div>
            )
        }
        
        if (sellstate == 1) {
            return (
                <div className="card">
                    <div className="card__body">
                        <img src={props.image} className="card__image" />
                        <h2 className="card__title">{props.name}</h2>
                    </div>
                    <Form.Control className="card__price__bar" onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
                    <button onClick={() => changeSellState()} className="card__btn">sell</button>
                </div>
            )    
        }

    } else {
        return (
            <div className="card">
                <div className="card__body">
                    <img src={props.image} className="card__image" />
                    <h2 className="card__title">{props.name}</h2>
                    <h2 className="card__info">Current Bid: {props.bidPrice} ETH</h2>
                </div>
                <button onClick={() => approveMarketplace()} className="card__btn">approve</button>
            </div>
        )
    }
}

export default CardItem;