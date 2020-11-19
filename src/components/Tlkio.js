import React, { useEffect, useState, useRef } from 'react';
import Helmet from 'react-helmet';

import { css } from 'emotion';

function Tlkio(props) {
  // const [script] = useState(document.createElement("script"));
  // const tlkioRef = useRef(null);
  useEffect(() => {
    const loadScript = async (url) => {
      const response = await fetch(url, {
        mode: 'no-cors', // no-cors
      });
      const script = await response.text();
      Function(script);
    }

    const scriptUrl = "https://tlk.io/embed.js";
    loadScript(scriptUrl);

    // const tlkioContainer = document.getElementById("tlkio");
    // console.log("Tlkio container exists?", tlkioContainer);

    // console.log("Creating script");
    // let script = document.createElement("script");
    // // const script = document.createElement('script');
    // script.src = "https://tlk.io/embed.js";
    // script.async = true;
    // script.onload = () => addTlkio();

    // const addTlkio = () => {
    //   console.log("Tlkio loaded");
    //   tlkioRef.current.appendChild(script);
    //   // document.body.appendChild(script);
    // }

    // () => {
    //   chatRef.current.innerHtml = "";
    //   // document.removeChild(script);
    // }
  }, []);
  return (
    <>
      <Helmet>
        {/* <script src="https://tlk.io/embed.js" type="text/javascript"></script> */}
        {/* <script src="https://rumbletalk.com/client/?NTr0OjGf"></script> */}
        {/* <script> */}
        {/*   window.__lc = window.__lc || {}; */}
        {/*   window.__lc.license = 12374838; */}
        {/*   ;(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e}(window,document,[].slice)) */}
        {/* </script> */}

      </Helmet>
      <div id="tlkio" data-channel="LocallyGrownTV" data-theme="theme--night" data-custom-css={`${process.env.REACT_APP_DOMAIN}tlkio_styles.css`} className={tlkio}></div>
      {/* <div ref={tlkioRef} /> */}
      {/* <div style={{height: "500px"}}><div id="rt-a375967aaeda39ea2923ea26430061c6"></div></div> */}
    </>
  );
}

const tlkio = css`
  width: 100%;
  height: 400px;
  max-width: 100%;
  background-color: #000;
  margin-bottom: 1rem;
  border: 1px solid #333;
`;

export default Tlkio;
