import { chunk } from 'lodash';
import { PulseLoader } from 'react-spinners';
import { Contract, ContractInterface } from "ethers";
import { useQueryClient } from '@tanstack/react-query';
import { JsonRpcSigner } from '@ethersproject/providers';
import PersonalItem from '../components/PersonalItem';
import useNFTManager from '../hooks/usеNFTManager';
import styles from './CSS/MyItems.module.css';
import marketNFT from '../types/marketNFT';
import useModal from '../hooks/useModal';
import Modal from '../components/Modal';

const MyItems = ({ marketplace, account, NFTAbi, signer } : {marketplace: Contract , account: string, NFTAbi: ContractInterface, signer: JsonRpcSigner}) => {    

  const {openModal, transactionHash, modalState, toggleModal, changeModalState, setTx } = useModal();
  const {loading, zeroItems, approveMarketplace} = useNFTManager(marketplace, signer, account, 2);

  const queryClient = useQueryClient();
  const items: marketNFT[] | undefined = queryClient.getQueryData(["itemsNotForSell"]);

return (

  <div>

  { loading ? (
    
    <div className={styles.InfoBox}>
      <div className={styles.InfoText}>
        Loading Items..
        <PulseLoader color="#4169E1" />
      </div>
    </div>
  
  ) : ( 
    
    <div className={styles.Container}>
      
      { zeroItems ? (
        <div className={styles.LoadingComponent}>
          <div className={styles.LoadingMessage}>
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
              {chunk(items, 4).map((y: marketNFT[]) => <div className={styles.ItemsRow}>{y.map(x => <div className={styles.Item}><PersonalItem key={x.image} marketItem ={x} marketplace={marketplace} NFTAbi={NFTAbi} signer={signer} approveMarketplace={approveMarketplace} toggleModal={toggleModal} changeModalState={changeModalState} setTx={setTx} /></div>)}</div>)}
            </div>
          </div>
      
      </div>
      )}
    </div>
  )}

  </div>
)}

export default MyItems