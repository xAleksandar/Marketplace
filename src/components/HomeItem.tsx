import { useState } from 'react';
import { Contract } from "ethers";
import { Form } from 'react-bootstrap';
import { JsonRpcSigner } from '@ethersproject/providers';

import styles from './CSS/Item.module.css';
import marketNFT from '../types/marketNFT';
import useNFTManager from '../hooks/usеNFTManager';
import useModal from '../hooks/useModal';

const HomeItem = ({ marketItem, marketplace, signer } : { marketItem: marketNFT, marketplace: Contract, signer: JsonRpcSigner }) => {
    
    const [bidprice, setBidPrice] = useState <string> ("")
    const [bidstate, setBidState] = useState <number> (0)
    const [trigger, setTrigger] = useState <string> ("")

    const {buyNFT, bidForNFT} = useNFTManager(marketplace, signer);
    const {openModal, toggle, checkToggle} = useModal();


    let opnModal = false;

    async function changeBidState() {
        
        if (bidstate == 1) {
            toggle()
            checkToggle();
            console.log('Modal is now: ', openModal)
            marketItem = await bidForNFT(marketItem, bidprice);
            console.log(marketItem)
            setBidState(0)
        }
        
        if (bidstate == 0) {
            setBidState(1)
        }
    }


    if (marketItem.forSell == true) {
        return (
            <div className={styles.card}>
                <div className={styles.card__body}>
                    <img src={marketItem.image} className={styles.card__image} />
                    <h2 className={styles.card__title}>{marketItem.name}</h2>
                    <h2 className={styles.card__info}>Price: {marketItem.price} ETH</h2>
                </div>
                <button onClick={() => buyNFT(marketItem)} className={styles.card__btn}><h5>Buy NFT</h5></button>
            </div>
        )
    } else {
        if (bidstate == 1){
            return (
                <div className={styles.card}>
                    <div className={styles.card__body}>
                        <img src={marketItem.image} className={styles.card__image} />
                        <h2 className={styles.card__title}>{marketItem.name}</h2>
                        <h2 className={styles.card__info}>Current Bid: {marketItem.bidPrice} ETH</h2>
                    </div>
                    
                    <Form.Control className={styles.card__price__bar} onChange={(e) => setBidPrice(e.target.value)} size="sm" required type="number" placeholder="Price in ETH" />
                    <button onClick={() => changeBidState()} className={styles.card__btn__bid}><h5>Outbid</h5></button>
                </div>
        )

        } else {
            return (
                <div className={styles.card}>
                    <div className={styles.card__body}>
                        <img src={marketItem.image} className={styles.card__image} />
                        <h2 className={styles.card__title}>{marketItem.name}</h2>
                        <h2 className={styles.card__info}>Current Bid: {marketItem.bidPrice} ETH</h2>
                    </div>

                    <button onClick={() => changeBidState()} className={styles.card__btn__bid}><h5>Outbid</h5></button>
                </div>   
            )
        } 
    }
}

export default HomeItem
