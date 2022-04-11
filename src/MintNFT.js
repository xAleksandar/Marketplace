import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const MintNFT = ({ marketplace, account, NFTAbi, signer }) => {
  const [image, setImage] = useState('')
  const [collections, setCollections] = useState([]);
  const [collectionNames, setCollectionNames] = useState([]);
  const [usecollection, setUseCollection] = useState(null)
  
  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
        const result = await client.add(file)
        
        setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
      } catch (error){
        console.log("ipfs image upload error: ", error)
      }
    }
  }

  const createNFT = async () => {
    if (!image) return
    
    const result = await client.add(JSON.stringify({usecollection, image}))
    await marketplace.mintNFT(usecollection, image)
    
  }
  
  useEffect(() => {
  async function loadNFT() {
    let cols = await marketplace.returnCollections()
    let newcollections = []
    let newnames = []
    
    for (let i = 0; i < cols.length; i++) {
      
      let nftcontract = new ethers.Contract(cols[i], NFTAbi.abi, signer)
      let nftname = await nftcontract.name()
      newcollections.push(cols[i])
      newnames.push(nftname)
    }
    
    setCollectionNames(newnames)
    setCollections(newcollections)
    setUseCollection(newcollections[0])
  
  }
  loadNFT()
  }, [])

  function changeCollection(x) {
    for (let i = 0; i < collections.length; i++) {
      if (collectionNames[i] == x) {
        setUseCollection(i)
      }
    }
  }
  
  // useEffect(() => loadNFT(), [])

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              {collectionNames.map(x => <li key={x}><Button onClick={() => changeCollection(x)} >{x}</Button></li>)}
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Mint NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MintNFT
