import React, { useEffect } from 'react';
import consoleLog from '../helpers/consoleLog';

function ChatangoChat(props) {
  const onScriptLoad = () => {
    consoleLog("- Loaded Chatango chat script");
  }

  useEffect(() => {
    let script = document.createElement("script");
    script.src = "//st.chatango.com/js/gz/emb.js";
    script.async = true;
    script.id = "cid0020000246583359945";
    script.style = "width: 300px; height: 500px;";
    script.setAttribute("data-cfasync", "false");

    const inlineScript = document.createTextNode('{"handle":"locallygrowntv","arch":"js","styles":{"a":"C8C8C8","b":100,"c":"000000","d":"000000","k":"C8C8C8","l":"C8C8C8","m":"C8C8C8","p":"10","q":"C8C8C8","r":100,"pos":"br","cv":1,"cvfnt":"\'Helvetica Neue\', Helvetica, Arial, sans-serif, sans-serif","cvfntw":"bold","cvbg":"221935","cvbga":2,"cvfg":"ffffff","cvw":75,"cvh":30,"surl":0}}');
    script.appendChild(inlineScript)

    script.onload = () => onScriptLoad();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  });

  return (
    <React.Fragment />
  );
}

export default ChatangoChat;
