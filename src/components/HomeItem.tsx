import { useState } from 'react';
import { Contract } from "ethers";
import { Form } from 'react-bootstrap';
import { JsonRpcSigner } from '@ethersproject/providers';

import styles from './CSS/Item.module.css';
import marketNFT from '../types/marketNFT';
import useNFTManager from '../hooks/usеNFTManager';

const HomeItem = ({ marketItem, marketplace, signer, toggleModal, changeModalState, setTx, ...rest } : { marketItem: marketNFT, marketplace: Contract, signer: JsonRpcSigner, toggleModal: () => void, changeModalState: (state: number) => void, setTx: (tx: string) => void }) => {
    
    const {buyNFT, bidForNFT} = useNFTManager(marketplace, signer, "", 0);
    const [bidprice, setBidPrice] = useState <string> ("")
    const [bidstate, setBidState] = useState <number> (0)

    async function changeBidState() {
        
        if (bidstate == 1) {
            toggleModal()
            marketItem = await bidForNFT(marketItem, bidprice, changeModalState, setTx);
            setBidState(0)
        }
        
        if (bidstate == 0) {
            setBidState(1)
        }
    }


    if (marketItem.forSell == true) {
        return (
            <div className={styles.card} {...rest}>
                <div className={styles.card__body}>
                    <img src={marketItem.image} className={styles.card__image} />
                    <h2 className={styles.card__title}>{marketItem.name}</h2>
                    <h2 className={styles.card__info}>Price: {marketItem.price} ETH</h2>
                </div>
                <button onClick={async () => {
                    toggleModal();
                    marketItem = await buyNFT(marketItem, changeModalState, setTx)}
                } className={styles.card__btn}><h5>Buy NFT</h5></button>
            </div>
        )
    } else {
        if (bidstate == 1){
            return (
                <div className={styles.card} {...rest}>
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
                <div className={styles.card} {...rest}>
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
