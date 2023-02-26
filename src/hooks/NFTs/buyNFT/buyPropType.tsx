import marketNFT from "../../../types/marketNFT";

type buyPropType = {
    item: marketNFT,
    changeModalState: (state:number) => void,
    setTx: (tx: string) => void
}

export default buyPropType