import { JsonRpcSigner } from '@ethersproject/providers';
import { PulseLoader } from 'react-spinners';
import { Form } from 'react-bootstrap';
import { Contract } from "ethers";
import { chunk } from 'lodash';
import { useState } from 'react'; 
import Modal from '../components/Modal';
import marketNFT from '../types/marketNFT';
import useNFTManager from '../hooks/usеNFTManager';
import HomeItem from '../components/HomeItem';
import styles from './CSS/Home.module.css'
import useModal from '../hooks/useModal'

const Home = ({ marketplace, signer } : {marketplace: Contract , signer: JsonRpcSigner}) => {    
  
  // const [opnModal, setOpnModal] = useState <boolean> (true)
  const {loading, items, zeroItems, setUserAddress, setTrigger, setOpenModal, modalStep, transactionHash} = useNFTManager(marketplace, signer);
  
  const {openModal} = useModal();
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
        { zeroItems ? (
          
          <div className={styles.MiddleSreenText}>
            No items found.
          </div>
        
        ) : (
          <div>
            { openModal ? (
              <div className={styles.modalOverlay}>
                {openModal && <Modal className={styles.Modal} setOpenModal={setOpenModal} currentStep={modalStep} transactionHash={transactionHash} />}          
              </div>
            ) : (
              <div>
              </div>
            )}
            
          <div className={styles.Container}>
            <div className={styles.AddressSearch}>
              <Form.Control className={styles.AddressSearchBar} onChange={(e) => setUserAddress(e.target.value)} size="lg" placeholder="Search by owner address" />
              <button onClick={() => setTrigger("trigger")} className={styles.AddressSearchBtn}>Search</button>
            </div>
            <div className={styles.ItemContainer}>
              {chunk(items, 4).map((y:marketNFT[]) => <div className={styles.ItemsRow}>{y.map(x => <div className={styles.Item}><li key={x.image}><span><HomeItem marketItem ={x} marketplace={marketplace} signer={signer} /></span></li></div>)}</div>)}
            </div>
          </div>
          </div>
        )}
      </div>
    )}
  </div>
)}

export default Home