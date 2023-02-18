import { JsonRpcSigner } from '@ethersproject/providers';
import { Contract, ContractInterface } from "ethers"
import { Form } from 'react-bootstrap'
import {useState} from 'react'

import useNFTManager from '../hooks/usеNFTManager';
import marketNFT from '../types/marketNFT';
import styles from './CSS/Item.module.css';

const PersonalItem = ({marketItem, marketplace, NFTAbi, signer, approveMarketplace, toggleModal, changeModalState, setTx } : { marketItem: marketNFT, marketplace: Contract, NFTAbi: ContractInterface, signer: JsonRpcSigner, approveMarketplace: (item: marketNFT) => Promise<marketNFT>, toggleModal: () => void, changeModalState: (state: number) => void, setTx: (tx: string) => void}) => {

    const [price, setPrice] = useState <string> ("")
    const [sellstate, setSellState] = useState <number> (0)
    const [item, setItem] = useState <marketNFT> (marketItem);
    const { sellNFT, unlistNFT, acceptBid } = useNFTManager(marketplace, signer, "", 0);
    
    function changeSellState() {
        
        if (sellstate == 1) {
            toggleModal();
            sellNFT(marketItem, price, changeModalState, setTx);
            setSellState(0)
        }
        
        if (sellstate == 0) {
            setSellState(1)
        }
    }

    return (
        <div className={styles.card}>
            <div className={styles.card__body}>
                <img src={item.image} className={styles.card__image} />
                <h2 className={styles.card__title}>{item.name}</h2>
                <h2 className={styles.card__info}>Current Bid: {item.bidPrice} ETH</h2>
            </div>
            { item.isMarketplaceApproved ? (
                <div>
                
                { item.forSell ? (
                    <button onClick={() => {
                        toggleModal();
                        unlistNFT(marketItem, changeModalState, setTx);
                    }} className={styles.card__btn}>Unlist</button>
                ) : (
                    <div>

                    { sellstate == 0 ? (
                        <div>
                            
                        { item.bidPrice === "0.0" ? (
                            <button onClick={() => changeSellState()} className={styles.card__btn}>sell</button>
                        ) : (
                            <div className={styles.btn__mini}>
                                <button onClick={() => acceptBid(marketItem)} className={styles.card__btn__bid__mini}>Accept Bid</button>
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
                )}
                </div>

            ) : (
                <button onClick={async () => setItem({...await approveMarketplace(item)})} className={styles.card__btn}>approve</button>
            )}
        </div>
    )

}

export default PersonalItem