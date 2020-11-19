import React, { useEffect, useRef } from 'react';
import consoleLog from '../helpers/consoleLog';

import styled from '@emotion/styled';

function ScreeningChatangoChat(props) {
  const onScriptLoad = () => {
    consoleLog("- Loaded Chatango chat script");
  }

  const chatRef = useRef(null);

  useEffect(() => {
    let script = document.createElement("script");
    script.src = "//st.chatango.com/js/gz/emb.js";
    script.async = true;
    script.id = "cid0020000266742323989";
    script.style = `width: 100%;height: ${props.height};`;
    script.setAttribute("data-cfasync", "false");

    const inlineScript = document.createTextNode('{"handle":"barecorder","arch":"js","styles":{"a":"111111","b":100,"c":"a0a0a0","d":"a0a0a0","e":"111111","g":"ffffff","h":"a0a0a0","k":"111111","l":"000000","m":"000000","n":"FFFFFF","p":"10","q":"333333","r":100,"t":0,"ab":false,"usricon":0,"sbc":"404040","sba":0,"surl":0,"allowpm":0,"cnrs":"0.35"}}');
    script.appendChild(inlineScript)

    script.onload = () => onScriptLoad();
    chatRef.current.appendChild(script);

    return () => {
      // consoleLog("The chat ref is...", chatRef.current);
      chatRef.current.innerHtml = "";
    }
  }, []);

  return (
    <ChatContainer>
      <IframeContainer className={props.className} height={props.height} ref={chatRef} />
      <HideCloseIcon />
    </ChatContainer>
  );
}

const ChatContainer = styled('div')`
  position: relative;
`;

const IframeContainer = styled('div')`
  iframe {
    width: 100%;
    height: ${props => props.height};
  }
`;

const HideCloseIcon = styled('div')`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 1rem;
  height: 1rem;
  background-color: #111;
`;

ScreeningChatangoChat.defaultProps = {
  height: "420px"
}

export default ScreeningChatangoChat;
