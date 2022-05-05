import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const CreateCollection = ({ marketplace, nft }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  
  const mintCollection = async () => {
    await marketplace.createCollection(name, description);
  } 

  return (
    <div className="CollectionCreate">
      <Form.Control className="CollectionData" onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
      <Form.Control className="CollectionData" onChange={(e) => setDescription(e.target.value)} size="lg" required type="text" placeholder="Symbol" />
      <Button className="CollectionMintBtn" onClick={mintCollection}>
        Mint Collection!
      </Button>
    </div>
  );
}

export default CreateCollection