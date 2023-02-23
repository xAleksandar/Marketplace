import { JsonRpcSigner } from '@ethersproject/providers';
import { Contract, ContractInterface } from 'ethers';
import { PulseLoader } from 'react-spinners';
import { Form } from 'react-bootstrap';
import { useState } from 'react';

import useCollectionManager from "../hooks/usеCollectionManager";
import useNFTManager from "../hooks/usеNFTManager";
import useModal from "../hooks/useModal";
import useIPFS from "../hooks/useIPFS";

import styles from './CSS/MintNFT.module.css';
import Modal from '../components/Modal';

const MintNFT = ({ marketplace, account, signer } : {marketplace: Contract , account: string, signer: JsonRpcSigner}) => {    

  const { openModal, transactionHash, modalState, toggleModal, changeModalState, setTx } = useModal();
  const { loading, zeroItems, collections } = useCollectionManager(marketplace, signer, account);
  const { mintNFT } = useNFTManager(marketplace, signer, account, 0);
  const { uploadToIPFS, image } = useIPFS();


  const [collectionSellected, setCollectionSellected] = useState <boolean> (false);
  const [collectionId, setCollectionId] = useState <number> (0);
  
  return (
    <div className={styles.CollectionsContainer}>
      
      { loading ? (
    
        <div className={styles.InfoBox}>
          <div className={styles.InfoText}>
            Loading Collections..
            <PulseLoader color="#4169E1" />
          </div>
        </div>
  
      ) : (
        
        <div>
        { collectionSellected ? (
          <div className={styles.MintBody}>
            <Form.Control className = "CreateNFTFile" type="file" required name="file" onChange={uploadToIPFS} />
            { openModal ? (
              <div className={styles.modalOverlay}>
                <Modal className={styles.Modal} toggleModal={toggleModal} currentStep={modalState} transactionHash={transactionHash} />         
              </div>
            ) : (
              <div>
              </div>
            )}
            
            <button className={styles.BackBtn} onClick={() => {
              setCollectionSellected(false)
            }}>
              Back
            </button>
            
            <button className={styles.NFTMintBtn} onClick={() => {
              toggleModal();
              mintNFT(collectionId, image, changeModalState, setTx)
            }}>
              Mint
            </button>
            
          </div>
        ) : (
          <div>
        
         {collections.map(x =>  
          <li key={x.id}>
            <div className={styles.Collection}>
            <img src={x.image} width="100" height="100" className={styles.CollectionImage} alt="" />
              <div className={styles.CollectionBody}>
                <div className={styles.CollectionNames}>
                  <div className={styles.CollectionName}>
                    {x.name}
                  </div>
                  <div className={styles.CollectionSymbol}>
                    {x.symbol}
                  </div>
                </div>
                <div className={styles.CollectionBottom}>
                  <div className={styles.CollectionInfo}>
                    {x.info}
                  </div>
                  <div className={styles.CollectionMintBtnBox}>
                    <button className={styles.CollectionMintBtn} onClick={() => {
                      setCollectionId(x.id)
                      setCollectionSellected(true)
                    }}>
                      Mint
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        )}
        
       </div>
          )}
    </div>
  )}
  </div>
  );

}

export default MintNFT
