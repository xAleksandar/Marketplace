import { chunk } from 'lodash';
import { PulseLoader } from 'react-spinners';
import { Contract, ContractInterface } from "ethers";
import { useQueryClient } from '@tanstack/react-query';
import { JsonRpcSigner } from '@ethersproject/providers';
import PersonalItem from '../components/PersonalItem';
import styles from './CSS/MyItems.module.css';
import marketNFT from '../types/marketNFT';
import useModal from '../hooks/useModal';
import Modal from '../components/Modal';

const MyItems = ({ marketplace, signer } : {marketplace: Contract, signer: JsonRpcSigner}) => {    

  const queryClient = useQueryClient();
  const items: marketNFT[] | undefined = queryClient.getQueryData(["itemsNotForSell"]);
  const {openModal, transactionHash, modalState, toggleModal, changeModalState, setTx } = useModal();
  
return (

  <div>

  { !items ? (
    
    <div className={styles.InfoBox}>
      <div className={styles.InfoText}>
        Loading Items..
        <PulseLoader color="#4169E1" />
      </div>
    </div>
  
  ) : ( 
    
    <div className={styles.Container}>
      
      { items && items.length == 0 ? (
        <div className={styles.InfoBox}>
          <div className={styles.InfoText}>
            No any items to show.
          </div>
        </div>
      ) : (
      <div>
        { openModal ? (
          <div className={styles.modalOverlay}>
            <Modal className={styles.Modal} toggleModal={toggleModal} currentStep={modalState} transactionHash={transactionHash} />         
          </div>
        ) : (
          <div>
          </div>
        )}
          <div>   
            <div className={styles.ItemContainer}>
              {chunk(items, 4).map((y: marketNFT[]) => <div className={styles.ItemsRow}>{y.map(x => <div className={styles.Item}><PersonalItem key={x.image} marketItem ={x} marketplace={marketplace} signer={signer} toggleModal={toggleModal} changeModalState={changeModalState} setTx={setTx} /></div>)}</div>)}
            </div>
          </div>
      
      </div>
      )}
    </div>
  )}

  </div>
)}

export default MyItems