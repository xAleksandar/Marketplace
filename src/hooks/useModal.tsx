import { useState } from 'react';

const useModal = () => {

    const [openModal, setOpenModal] = useState <boolean> (false)

    const toggle = () => {
        setOpenModal(!openModal);
        console.log('toggled', !openModal)
    }

    const checkToggle = () => {
        console.log('Modal in hook: ', openModal);
    }

    return {openModal,
            toggle,
            checkToggle}
}

export default useModal