import { JsonRpcSigner } from '@ethersproject/providers';
import { useQueryClient } from '@tanstack/react-query';
import { PulseLoader } from 'react-spinners';
import { Form } from 'react-bootstrap';
import { Contract } from "ethers";
import { chunk } from 'lodash';
import Modal from '../components/Modal';
import marketNFT from '../types/marketNFT';
import useFetchItems from '../hooks/usеFetchItems';
import HomeItem from '../components/HomeItem';
import styles from './CSS/Home.module.css'
import useModal from '../hooks/useModal'

const Home = ({ marketplace, signer } : {marketplace: Contract , signer: JsonRpcSigner}) => {    
  const {openModal, transactionHash, modalState, toggleModal, changeModalState, setTx } = useModal();
  const {loading, setUserAddress, setTrigger} = useFetchItems(marketplace, signer, "", 0);
  
  const queryClient = useQueryClient();
  const items: marketNFT[] | undefined = queryClient.getQueryData(["allItems"]);

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
      
      <div>
        { items && items.length == 0 ? (
          
          <div className={styles.MiddleSreenText}>
            No items found.
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
            
          <div className={styles.Container}>
            <div className={`${styles.AddressSearch} d-flex`}>
              <Form.Control className={styles.AddressSearchBar} onChange={(e) => setUserAddress(e.target.value)} size="lg" placeholder="Search by owner address" />
              <button onClick={() => setTrigger("trigger")} className={styles.AddressSearchBtn}>Search</button>
            </div>
            <div className={styles.ItemContainer}>
              {chunk(items, 4).map((y:marketNFT[]) => <div className={styles.ItemsRow}>{y.map(x => <div className={styles.Item}><HomeItem key={x.name} marketItem ={x} marketplace={marketplace} signer={signer} toggleModal={toggleModal} changeModalState={changeModalState} setTx={setTx} /></div>)}</div>)}
            </div>
          </div>
          </div>
        )}
      </div>
    )}
  </div>
)}

export default Home