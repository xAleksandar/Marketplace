import { useQueryClient, useMutation } from '@tanstack/react-query';
import { ethers, Contract } from 'ethers';
import marketNFT from '../../../types/marketNFT';
import Status from '../../../components/steps';
import bidPropType from "./bidPropType";

export const useBidOnNFT = (marketplace: Contract) => {

    const queryClient = useQueryClient();
    
    const bidOnNFT = async ({item, bidprice, changeModalState, setTx} : {item: marketNFT, bidprice: string, changeModalState: (state:number) => void, setTx: (tx: string) => void}) => {    
        const transaction = await marketplace.bidOnNFT(item.itemId, {value : ethers.utils.parseEther(bidprice)})
        changeModalState(Status.AwaitConfirmation)
        setTx(transaction.hash)

        const result = await new Promise<marketNFT> (async (resolve, reject) => {
            marketplace.once("nft", async (action, id, issuer) => {
                if (action === "Bid") {
                    await new Promise(r => setTimeout(r, 1000));
                    changeModalState(Status.Confirmed);
                    return resolve(item);
                }
            })
        })

        return result;
    }

    return useMutation<marketNFT, Error, bidPropType>(bidOnNFT, {
        onSuccess: (data) => {
            queryClient.invalidateQueries(["allItems"]);
        }
    })
}
