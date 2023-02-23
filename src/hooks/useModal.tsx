import { useState } from 'react';

const useModal = () => {

    const [openModal, setOpenModal] = useState <boolean> (false)
    const [modalState, setModalState] = useState <number> (1)
    const [transactionHash, setTransactionHash] = useState <string> ("")

    const toggleModal = () => {
        setModalState(1)
        setOpenModal(!openModal);
        document.body.style.overflowY = !openModal ? 'hidden' : 'auto'; 
    }

    const changeModalState = (state: number) => {
        console.log('Modal state now: ', modalState)
        setModalState(state)
    }

    const setTx = (tx: string) => {
        console.log('Transaction hash: ', tx);
        setTransactionHash(tx)
    }

    return {openModal,
            transactionHash,
            modalState,
            toggleModal,
            changeModalState,
            setTx}
}

export default useModal