import { JsonRpcSigner } from '@ethersproject/providers';
import { Form, Button } from 'react-bootstrap';
import { Contract } from 'ethers';

import useCollectionManager from '../hooks/usеCollectionManager';
import useModal from '../hooks/useModal';
import useIPFS from '../hooks/useIPFS';

import styles from './CSS/CreateCollection.module.css'
import Modal from "../components/Modal";

const CreateCollection = ({marketplace, signer, account} : {marketplace: Contract , signer: JsonRpcSigner, account: string}) => {
  
  const { openModal, transactionHash, modalState, toggleModal, changeModalState, setTx } = useModal();
  const { uploadToIPFS, image } = useIPFS();
  const { mintCollection,
          setCollectionName,
          setCollectionTicker,
          setCollectionDescription,
          setCollectionIsRentable 
    } = useCollectionManager(marketplace, signer, account)

  return (
    <div className={styles.Container}>
      { openModal ? (
        <div className={styles.modalOverlay}>
          <Modal className={styles.Modal} toggleModal={toggleModal} currentStep={modalState} transactionHash={transactionHash} />         
        </div>
      ) : (
        <div>
        </div>
      )}
      <div className={styles.FormContainer}>
       
        <div className={styles.CollectionData}><Form.Control onChange={(e) => setCollectionName(e.target.value)} size="lg" required type="text" placeholder="Name" /></div>
        <div className={styles.CollectionData}><Form.Control onChange={(e) => setCollectionTicker(e.target.value)} size="lg" required type="text" placeholder="Ticker" /></div>
        <div className={styles.CollectionData}><Form.Control onChange={(e) => setCollectionDescription(e.target.value)} size="lg" required type="text" placeholder="Description" /></div>
        <div className={styles.CollectionData}><Form.Control type="file" required name="file" onChange={uploadToIPFS} /></div>

        <Button className={styles.CollectionMintBtn} onClick={() => {
          toggleModal()
          mintCollection(image, changeModalState, setTx)
        }}>
          Mint Collection!
        </Button>
      </div>
    </div>
  );
}

export default CreateCollection