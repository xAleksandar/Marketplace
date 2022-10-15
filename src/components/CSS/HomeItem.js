import React, {useState} from 'react'
import { Row, Form, Button } from 'react-bootstrap'
import styles from './CSS/HomeItem.module.css'
import { ethers } from "ethers"
import MarketplaceAbi from  './../contractsData/Marketplace.json'
import MarketplaceAddress from './../contractsData/Marketplace-address.json'

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
        const totalitems = (await marketplace.returnItemsLength()).toString()
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
            console.log('Set to 1')
        }
    }


if (props.forSell == true) {
    return (
        <div className={styles.Card}>
            <div className={styles.CardBody}>
                <img src={props.image} className={styles.CardImage} />
                <h2 className={styles.CardTitle}>{props.name}</h2>
                <h2 className={styles.CardInfo}>Price: {props.price} ETH</h2>
            </div>
            <button onClick={() => buyNFT()} className={styles.CardBuyBtn}><h5>Buy NFT</h5></button>
        </div>
    )
} else {
    if (bidstate == 1){
        return (
            <div className={styles.Card}>
                <div className={styles.CardBody}>
                    <img src={props.image} className={styles.CardImage} />
                    <h2 className={styles.CardTitle}>{props.name}</h2>
                    <h2 className={styles.CardInfo}>Current Bid: {props.bidPrice} ETH</h2>
                </div>
                <Form.Control className={styles.CardPriceBar} onChange={(e) => setBidPrice(e.target.value)} size="sm" required type="number" placeholder="Price in ETH" />
                <button onClick={() => changeBidState()} className={styles.CardBidBtn}><h5>Outbid</h5></button>
            </div>
    )

    } else {
        return (
            <div className={styles.Card}>
                <div className={styles.CardBody}>
                    <img src={props.image} className={styles.CardImage} />
                    <h2 className={styles.CardTitle}>{props.name}</h2>
                    <h2 className={styles.CardInfo}>Current Bid: {props.bidPrice} ETH</h2>
                </div>

                <button onClick={() => changeBidState()} className={styles.CardBidBtn}><h5>Outbid</h5></button>
            </div>   
    )
    } 
}} 

export default HomeItem
