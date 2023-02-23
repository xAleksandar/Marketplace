import { useState, useEffect } from 'react';
import { create, IPFSHTTPClient } from 'ipfs-http-client'
import { Buffer } from 'buffer';

import infura from '../Infura.json';

const useIPFS = () => {

    // @ts-ignore
    window.Buffer = Buffer;

    const [ipfs, setIpfs] = useState <IPFSHTTPClient> ()
    const [image, setImage] = useState <string> ("")
    useEffect(() => {
        async function load() {
          
        const client = create({
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https',
            headers: {
                authorization: 'Basic ' + Buffer.from(infura.ProjectId + ':' + infura.ApiKey).toString('base64')
            },
            });
        setIpfs(client);
        }

    load()}, [])



    const uploadToIPFS = async (event: any) => {
        event.preventDefault()
        const file = event.target.files[0]

        if (typeof file !== 'undefined') {
          try {
            if (ipfs) {
                const upload = await ipfs.add(file)
                setImage(`https://infura-ipfs.io/ipfs/${upload.path}`)
                }
            } catch (error){
                console.log('Error while uploading image to Ipfs: ', error)
          }
        }
    }

    const getImage = () => {
        return image;
    }

    return {
        uploadToIPFS,
        getImage,
        image
    }
}

export default useIPFS