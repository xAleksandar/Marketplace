import { Contract } from "ethers";
import { PulseLoader } from 'react-spinners';
import { JsonRpcSigner } from '@ethersproject/providers';
import useCollectionManager from '../hooks/usеCollectionManager';
import styles from './CSS/Collections.module.css';

const Collections = ({ marketplace, signer } : {marketplace: Contract, signer: JsonRpcSigner}) => {
  
  const { loading, collections } = useCollectionManager(marketplace, signer, "");

  return (
    <div className={styles.CollectionsContainer}>
      
      { loading ? (
    
        <div className={styles.InfoBox}>
          <div className={styles.InfoText}>
            Loading Collections..
            <PulseLoader color="#4169E1" />
          </div>
        </div>
  
      ) : (
        <div>
          {collections.map(x =>  
            <li key={x.id}>
              <div className={styles.Collection}>
              <img src={x.image} width="100" height="100" className={styles.CollectionImage} alt="" />
                <div className={styles.CollectionBody}>
                  <div className={styles.CollectionNames}>
                    <div className={styles.CollectionName}>
                      {x.name}
                    </div>
                    <div className={styles.CollectionSymbol}>
                      {x.symbol}
                    </div>
                  </div>
                  <div className={styles.CollectionInfo}>
                    {x.info}
                  </div>
                </div>
              </div>
            </li>
          )}
        </div>
      )}
    </div>
  );
}

export default Collections
