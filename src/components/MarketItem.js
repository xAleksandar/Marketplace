import React, {useState} from 'react'
import { Row, Form, Button } from 'react-bootstrap'
import './Item.css'
import { ethers } from "ethers"
import MarketplaceAbi from  './../contractsData/Marketplace.json'
import MarketplaceAddress from './../contractsData/Marketplace-address.json'
import NFTAbi from './../contractsData/NFT.json'

const MarketItem = (props) => {

    const [price, setPrice] = useState(null)

    async function debugg() {
        const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, props.signer)
        
        console.log(await marketplace.items(7))
        console.log(await marketplace.items(8))
        console.log(await marketplace.items(9))
        console.log(await marketplace.items(10))
        console.log(await marketplace.items(11))
    }

    async function unlistItem() {
        const NFTcontract = new ethers.Contract(props.collection, NFTAbi.abi, props.signer)
        const approved = await NFTcontract.approve(props.collection, props.tokenid)
        
        const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, props.signer)
        const totalitems = (await marketplace.lengthItems()).toString()
        
        for (let i = 0; i <=totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            
            if (nftid == props.tokenid && nftaddress == props.collection) {
                await marketplace.cancelSell(i)
            }
        }

        
    }

    return (
        <div className="card">
            <div className="card__body">
                <img src={props.image} className="card__image" />
                <h2 className="card__title">{props.name}</h2>
            </div>
            
            <button onClick={() => unlistItem()} className="card__btn">Unlist</button>
        </div>
    )
}

export default MarketItem;