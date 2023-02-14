import { Buffer } from 'buffer';
import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Contract } from 'ethers';
import Modal from "../components/Modal";

import styles from './CSS/CreateCollection.module.css'
import infura from '../Infura.json';

//Setup Infura ipfs verification.
import { create as ipfs } from 'ipfs-http-client'

const client = ipfs({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
      authorization: 'Basic ' + Buffer.from(infura.ProjectId + ':' + infura.ApiKey).toString('base64')
  },
});


const CreateCollection = ({marketplace, account} : {marketplace: Contract , account: string}) => {
  
  //Const navigate used by useNavigate Hook to navigate to homepage.
  const navigate = useNavigate();

  //Collection variables.
  const [name, setName] = useState <string> ('')
  const [ticker, setTicker] = useState <string> ('');
  const [image, setImage] = useState({})
  const [description, setDescription] = useState <string> ('')
  
  //Modal variables.
  const [modal, setOpenModal] = useState <boolean> (false);
  const [currentModalStep, setCurrentModalStep] = useState <number> (1);
  const [transactionHash, setTransactionHash] = useState <string> ("");


  //mintCollection activated by the Mint Collection button.
  const mintCollection = async () => {

    setOpenModal(true);
    const transaction = await marketplace.createCollection(name, ticker, image, description, false);
    
    setTransactionHash(transaction.hash)
    setCurrentModalStep(2)

    marketplace.on("newCollection", async (collectionAddress, owner) => {

      if (account.toString().toLowerCase() == owner.toLowerCase()) {
        setCurrentModalStep(3)
      }
    })
  } 

  const uploadToIPFS = async (event: any) => {
    event.preventDefault()
    const file = event.target.files[0]

    if (typeof file !== 'undefined') {
      try {
        const result = await client.add(file)
        setImage(`https://infura-ipfs.io/ipfs/${result.path}`)
      } catch (error){
        console.log("ipfs image upload error: ", error)
      }
    }
  }



  return (
    <div>
      {modal && <Modal className={styles.Modal} setOpenModal = {setOpenModal} currentStep = {currentModalStep} transactionHash = {transactionHash} />}
      <div className="CollectionCreate">
       
        <Form.Control className="CollectionData" onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
        <Form.Control className="CollectionData" onChange={(e) => setTicker(e.target.value)} size="lg" required type="text" placeholder="Ticker" />
        <Form.Control className="CollectionData" onChange={(e) => setDescription(e.target.value)} size="lg" required type="text" placeholder="Description" />
        <Form.Control className = "CreateNFTFile" type="file" required name="file" onChange={uploadToIPFS} />

        <Button className={styles.CollectionMintBtn} onClick={mintCollection}>
          Mint Collection!
        </Button>
      </div>
    </div>
  );
}

export default CreateCollection