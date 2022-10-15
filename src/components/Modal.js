import React from "react";
import "./Modal.css";
import Stepper from "./Stepper.js";
import { MetroSpinner } from "react-spinners-kit";
import { Checkmark } from 'react-checkmark';
import {useNavigate} from 'react-router-dom';
import { propTypes } from "react-bootstrap/esm/Image";

const Modal = ({setOpenModal, currentStep, transactionHash}) => {

  const navigate = useNavigate();

  const transactionLink = "https://goerli.etherscan.io/tx/" + transactionHash;

  const steps = [
    "Approve Transaction",
    "Transaction Confirmation",
    "Complete",
  ];

  const displayStep = (step) => {
    switch (step) {
      case 1:
        
        return (
          <div className="modalInfo">
              <h2 className="text-3xl text-blue-600 font-bold">Plase Approve Transaction in Metamask.</h2>
          </div>
        )
        
      case 2:
        
        return (
          <div className="modalInfo" style={{display: "flex"}}>
              <h2 className="modalText text-3xl text-blue-600 font-bold">Waiting for confirmation..</h2>
              <MetroSpinner size={50} color="#2563eb" />
          </div>
        )

      case 3:
        return (
          <div className="modalInfo" style={{padding: "30px 0px"}}>
          <Checkmark size="xLarge" color="#4ade80"/>
          <h2 className="modalText text-4xl text-green-400" style={{padding: "20px auto"}}>Transaction confirmed!</h2>
          <a
          className="text-blue-400 underline"
          href={transactionLink}
          target="_blank"
          rel="noopener noreferrer"
          >
            View Transaction
          </a>

          <button className="modalCloseBtn bg-blue-600 text-gray-300" onClick={() => {
            setOpenModal(false);
            window.location.reload()
            }} >Close</button>
          </div>
        ) 
        
        //<Final />;
    }
  };

  return (
    <div className="modalBackground">
      <div className="modalContainer">
        <Stepper steps={steps} currentStep={currentStep} />
        <div className="title">
          <h1></h1>
        </div>
        <div className="body">
          <p>{displayStep(currentStep)}</p>
        </div>
      </div>
    </div>
  );
}

export default Modal;
