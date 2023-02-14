import React, { useState } from 'react';
import styled from 'styled-components';

const Button = styled.button`
  background-color: royalblue;
  padding: 20px 20px;
  width: 50%;
  max-width: 50%;
  min-height: 60px;
`;

const ButtonToggle = styled(Button)`
  opacity: 0.6;
  ${({ active }) =>
    active &&
    `
    opacity: 1;
  `}
`;

const ButtonGroup = styled.div`
  display: flex;
  width: 100%;
  max-width: 100%;
  height: 40px;
  max-height: 40px;
`;

const types = ['IPFS', 'Base64'];

function ToggleGroup ({setImageType}) {
  const [active, setActive] = useState(types[0]);
  return (
    <ButtonGroup className="ButtonGroup">
      {types.map(type => (
        <ButtonToggle
          className="ButtonToggle"
          key={type}
          active={active === type}
          onClick={() => {
            console.log('Selected: ', type);
            setImageType(type)
            setActive(type)
          }}
        >
          {type}
        </ButtonToggle>
      ))}
    </ButtonGroup>
  );
}

export default ToggleGroup;