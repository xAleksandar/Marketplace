import marketNFT from "../../../types/marketNFT"

type sellPropType = {
    item: marketNFT,
    price: string,
    changeModalState: (state:number) => void,
    setTx: (tx: string) => void
}

export default sellPropType