import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMediaQuery } from 'react-responsive';
import styled from '@emotion/styled';
import MailchimpSubscribe from "react-mailchimp-subscribe";
import consoleLog from '../helpers/consoleLog';

import RightArrowIcon from './RightArrowIcon';

import {
  borderColor,
  inputBackgroundColor, inputActiveBackgroundColor,
  successColor, errorColor,
} from '../styles';

function MailchimpSubscribeForm(props) {
  const [focused, setFocused] = useState(false);

  let email;

  const actionUrl = "https://locallygrown.us18.list-manage.com/subscribe/post?u=63a8d52892af77b52ea0b4308&amp;id=81c8d59bc1";

  const submit = (subscribe, e) => {
    e.preventDefault();
    email &&
    email.value.indexOf("@") > -1 &&
    subscribe({
      EMAIL: email.value
    });
    consoleLog("Subscribing...");
  }

  const isNarrowSidebar = useMediaQuery({
    query: '(min-width: 800px) and (max-width: 1000px)'
  });

  const shortPlaceholder = "Sign up for the newsletter";
  const longPlaceholder = "Sign up for the Locally Grown newsletter";

  const onFocus = () => {
    setFocused(true);
    props.preventMaxMode();
  }

  const onBlur = () => {
    setFocused(false);
    props.stopPreventingMaxMode();
  }

  return (
    <MailchimpSubscribe
      url={actionUrl}
      render={({ subscribe, status, message }) => (
        <>
          <Form
            onFocus={onFocus}
            onBlur={onBlur}
            focused={focused}
            onSubmit={(e) => submit(subscribe, e)}
          >
            <Email
              ref={node => (email = node)}
              type="email"
              tabIndex="1"
              placeholder={isNarrowSidebar ? shortPlaceholder : longPlaceholder} />
            <Submit tabIndex="2">
              <RightArrowIcon />
            </Submit>
          </Form>
          {status &&
            <Response status={status}>
              {status === "sending" && "Subscribing..."}
              {status === "error" && <div dangerouslySetInnerHTML={{ __html: message }} />}
              {status === "success" && <div dangerouslySetInnerHTML={{ __html: message }} />}
            </Response>
          }
        </>
      )}
    />
  );
};

const Form = styled('form')`
  background-color: gray;
  border: 1px solid ${borderColor};
  background-color: ${props => props.focused ? inputActiveBackgroundColor : inputBackgroundColor};
  height: calc(.5rem + 1.4em);
  border-radius: calc((.5rem + 1.4em) / 2);
  width: 100%;
  display: flex;
  transition: background-color 0.2s ease;
  overflow: hidden;

  &:hover {
    background-color: ${inputActiveBackgroundColor};
  }
`;

const Email = styled('input')`
  border: 0;
  background-color: transparent;
  padding: .25rem .6rem;
  height: 100%;
  width: calc(100% - 2rem);

  // Inputs have to be at least 16px on iOS or they'll "zoom in" the page
  @media screen and (max-width: 415px) {
    font-size: 16px;
  }

  &:focus {
    outline: none;
  }

  &, &:focus, &::placeholder {
    color: #fff;
  }
`;

const submitBackgroundColor = '#4B3E68';
const submitActiveBackgroundColor = '#5F5080';

const Submit = styled('button')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 2rem;
  cursor: pointer;
  background-color: ${submitBackgroundColor};
  transition: background-color 0.2s ease;

  &:focus {
    outline: none;
    background-color: ${submitActiveBackgroundColor};
  }
`;

const Response = styled('div')`
  padding: .5rem calc(.5rem + 2px) 0;

  color: ${props => props.status === "success" ? successColor : props.status === "error" ? errorColor : "inherit"};
`;

MailchimpSubscribeForm.propTypes = {
  preventMaxMode: PropTypes.func,
  stopPreventingMaxMode: PropTypes.func,
}

MailchimpSubscribeForm.defaultProps = {
  preventMaxMode: () => {},
  stopPreventingMaxMode: () => {},
}

export default MailchimpSubscribeForm;
