import React from 'react';
import styled from '@emotion/styled';
import consoleLog from './consoleLog';

import MailchimpSubscribe from "react-mailchimp-subscribe";

function MailchimpSubscribeForm(props) {
  let email;

  const actionUrl = "https://locallygrown.us18.list-manage.com/subscribe/post?u=63a8d52892af77b52ea0b4308&amp;id=81c8d59bc1";

  const submit = (subscribe) => {
    email &&
    email.value.indexOf("@") > -1 &&
    subscribe({
      EMAIL: email.value
    });
    consoleLog("Subscribed...");
  }

  return (
    <MailchimpSubscribe
      url={actionUrl}
      render={({ subscribe, status, message }) => (
        <Form>
          <EmailInput ref={node => (email = node)} type="email" placeholder="Your email" />
          <Submit onClick={() => submit(subscribe)}>
            Submit
          </Submit>
          {status === "sending" && <div style={{ color: "blue" }}>sending...</div>}
          {status === "error" && <div dangerouslySetInnerHTML={{ __html: message }} />}
          {status === "success" && (
            <div
              style={{ color: "green" }}
              dangerouslySetInnerHTML={{ __html: message }}
            />
          )}
        </Form>
      )}
    />
  );
};

const Form = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  padding: 50px;
  background-color: gray;
`;

const EmailInput = styled('input')`
  border: 1px solid #000;

  &:focus {
    background-color: #eee;
  }
`;

const Submit = styled('button')`
`;

export default MailchimpSubscribeForm;
