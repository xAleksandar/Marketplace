import { Buffer } from 'buffer';
import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import ToggleGroup from '../components/ToggleGroup';
import Modal from "../components/Modal.js";

import styles from './CSS/CreateCollection.module.css'
import infura from '../Infura.json';

//Setup Infura ipfs verification.
const ipfsClient = require('ipfs-http-client');

const client = ipfsClient.create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: 'Basic ' + Buffer.from(infura.ProjectId + ':' + infura.ApiKey).toString('base64')
  },
}); 



const CreateCollection = ({marketplace, account}) => {
  
  //Const navigate used by useNavigate Hook to navigate to homepage.
  const navigate = useNavigate();

  //Collection variables.
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('');
  const [image, setImage] = useState({})
  const [description, setDescription] = useState('')
  const [imageType, setImageType] = useState("IPFS");

  //Modal variables.
  const [modal, setOpenModal] = useState(false);
  const [currentModalStep, setCurrentModalStep] = useState(1);
  const [transactionHash, setTransactionHash] = useState("");


  //mintCollection activated by the Mint Collection button.
  const mintCollection = async () => {
    
    let imagePath = "";
    if (imageType === "IPFS") {
      const result = await client.add(image)
      imagePath = await "https://infura-ipfs.io/ipfs/" + result.path
    }
    
    if (imageType === "Base64") {
      
      let imagePath = "";
      getBase64(image, function(base64Data) {
        //console.log("Base64 of file is", base64Data); // Here you can have your code which uses Base64 for its operation, // file to Base64 by oneshubh
      });
    }

    setOpenModal(true);
    const transaction = await marketplace.createCollection(name, ticker, imagePath, description);
    
    setTransactionHash(transaction.hash)
    setCurrentModalStep(2)

    marketplace.on("newCollection", async (collectionAddress, owner) => {

      if (account.toString().toLowerCase() == owner.toLowerCase()) {
        setCurrentModalStep(3)
      }
    })
  } 

  const getBase64 = async (file, callback) => {

    const reader = new FileReader();

    reader.addEventListener('load', () => callback(reader.result));

    reader.readAsDataURL(file);
  }

  const convertBase64 = async () => {
    
    let finalPath = "";
    var reader = new FileReader();
    reader.readAsDataURL(image);

    reader.onload = () => {
      console.log("Result", reader.result)
      finalPath = reader.result;
    };
    reader.onerror = error => {
      console.log("Error: ", error);
    };
  
    console.log('FInalPath', finalPath)
    return finalPath;
  }

  const setupImage = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    setImage(file)

    }



  return (
    <div>
      {modal && <Modal setOpenModal = {setOpenModal} currentStep = {currentModalStep} transactionHash = {transactionHash} />} 
    <div className="CollectionCreate">
       
      <Form.Control className="CollectionData" onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
      <Form.Control className="CollectionData" onChange={(e) => setTicker(e.target.value)} size="lg" required type="text" placeholder="Ticker" />
      <Form.Control className="CollectionData" onChange={(e) => setDescription(e.target.value)} size="lg" required type="text" placeholder="Description" />
      <Form.Control className = "CreateNFTFile" type="file" required name="file" onChange={setupImage} />
      <div className={styles.ToggleGroupBox}>
        {!modal && <ToggleGroup className={styles.ToggleGroup} setImageType={setImageType}/>}
      </div>
      <Button className={styles.CollectionMintBtn} onClick={mintCollection}>
        Mint Collection!
      </Button>
    </div>
    </div>
  );
}

export default CreateCollection