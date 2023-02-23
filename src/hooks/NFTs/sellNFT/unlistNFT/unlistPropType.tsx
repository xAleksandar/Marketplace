import marketNFT from "../../../../types/marketNFT";

type unlistPropType = {
    item: marketNFT,
    changeModalState: (state:number) => void,
    setTx: (tx: string) => void
}

export default unlistPropType