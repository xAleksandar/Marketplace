import React, {useState} from 'react'
import { Row, Form, Button } from 'react-bootstrap'
import styles from './CSS/Item.module.css';
import { Contract, ContractInterface, ethers } from "ethers"
import MarketplaceAddress from './../contractsData/Marketplace-address.json'
import marketNFT from '../types/marketNFT';
import { JsonRpcSigner } from '@ethersproject/providers';

const PersonalItem = ({marketItem, marketplace, NFTAbi, signer } : { marketItem: marketNFT, marketplace: Contract, NFTAbi: ContractInterface, signer: JsonRpcSigner }) => {

    const [price, setPrice] = useState <string> ("")
    const [sellstate, setSellState] = useState <number> (0)

    async function approveMarketplace() {
        const NFTcontract = new ethers.Contract(marketItem.collection, NFTAbi, signer)
        const approved = await NFTcontract.approve(MarketplaceAddress.address, marketItem.tokenId)
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
        const totalitems = (await marketplace.returnItemsLength()).toString()

        for (let i = 0; i <= totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            
            if (nftid == marketItem.tokenId && nftaddress == marketItem.collection) {
                await marketplace.acceptBid(i)
            }
        }
    }

    async function sell() {
        const weiprice = ethers.utils.parseEther(price.toString())
        const totalitems = (await marketplace.returnItemsLength()).toString()
        
        for (let i = 0; i <=totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            
            if (nftid == marketItem.tokenId && nftaddress == marketItem.collection) {
                await marketplace.sellNFT(i, weiprice)
            }
        }
    }


    return (
        <div className={styles.card}>
            <div className={styles.card__body}>
                <img src={marketItem.image} className={styles.card__image} />
                <h2 className={styles.card__title}>{marketItem.name}</h2>
                <h2 className={styles.card__info}>Current Bid: {marketItem.bidPrice} ETH</h2>
            </div>
            { marketItem.isMarketplaceApproved ? (
                <div>
                
                { sellstate == 0 ? (
                    <div>
                        
                    { marketItem.bidPrice === "0.0" ? (
                        <button onClick={() => changeSellState()} className={styles.card__btn}>sell</button>
                    ) : (
                        <div className={styles.btn__mini}>
                            <button onClick={() => acceptBid()} className={styles.card__btn__bid__mini}>Accept Bid</button>
                            <button onClick={() => changeSellState()} className={styles.card__btn__sell__mini}>Sell</button>
                        </div>

                    )}
                    </div>
                ) : (
                    <div>
                        <Form.Control className={styles.card__price__bar} onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
                        <button onClick={() => changeSellState()} className={styles.card__btn}>sell</button>
                    </div>
                )}    
                </div>

            ) : (
                <button onClick={() => approveMarketplace()} className={styles.card__btn}>approve</button>
            )}
        </div>
    )

}

export default PersonalItem