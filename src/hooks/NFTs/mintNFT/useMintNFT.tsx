import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Contract } from 'ethers';
import marketNFT from '../../../types/marketNFT';
import Status from '../../../components/steps';
import mintPropType from "./mintPropType";

export const useMintNFT = (marketplace: Contract) => {

    const queryClient = useQueryClient();
    
    const mintNFT = async ({collectionId, image, changeModalState, setTx} : {collectionId: number, image: string, changeModalState: (state:number) => void, setTx: (tx: string) => void}) => {    
        const transaction = await marketplace.mintNFT(collectionId, image);
        changeModalState(Status.AwaitConfirmation)
        setTx(transaction.hash)

        const result = await new Promise<marketNFT> (async (resolve, reject) => {
            marketplace.once("nft", async (action, id, issuer) => {
                if (action === "Mint") {
                    await new Promise(r => setTimeout(r, 1000));
                    changeModalState(Status.Confirmed);
                    const newItem = await marketplace.items(id)
                    return resolve(newItem);
                }
            })
        })

        return result;
    }

    return useMutation<marketNFT, Error, mintPropType>(mintNFT, {
        onSuccess: (data) => {
            queryClient.invalidateQueries(["allItems"]);
            queryClient.invalidateQueries(["itemsNotForSell"]);
        }
    })
}
