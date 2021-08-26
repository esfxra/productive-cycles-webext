import React from 'react';
import Appearance from './Appearance';
import Notifications from './Notifications';
import AutoStart from './AutoStart';
import TimerSettings from './TimerSettings';

export default function Settings(): JSX.Element {
  return (
    <>
      <Appearance />
      <Notifications />
      <AutoStart />
      <TimerSettings />
    </>
  );
}
