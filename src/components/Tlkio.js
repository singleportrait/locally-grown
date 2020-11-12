import React, { useEffect, useState } from 'react';

import { css } from 'emotion';

function Tlkio(props) {
  const [script] = useState(document.createElement("script"));
  useEffect(() => {
    script.src = "https://tlk.io/embed.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => addTlkio();

    const addTlkio = () => {
      console.log("Tlkio loaded");
    }
  }, [script]);
  return (
    <div id="tlkio" data-channel="LocallyGrownTV" data-theme="theme--night" data-custom-css={`${process.env.REACT_APP_DOMAIN}tlkio_styles.css`} className={tlkio}></div>
  );
}

const tlkio = css`
  width: 100%;
  height: 400px;
  max-width: 100%;
  background-color: #000;
`;

export default Tlkio;
