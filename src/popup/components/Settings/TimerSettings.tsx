import React, { useContext } from 'react';
import { SettingsContext } from '../../SettingsProvider';
import Section from '../Common/Section';
import Option from './Option';
import NumberInput from './NumberInput';
import Checkbox from './Checkbox';

const locale = {
  title: chrome.i18n.getMessage('settings_timer'),
  cycleMinutes: chrome.i18n.getMessage('settings_timer_cycleMinutes'),
  cycleBreaks: chrome.i18n.getMessage('settings_timer_breakMinutes'),
  totalCycles: chrome.i18n.getMessage('settings_timer_totalCycles'),
  badgeTimer: chrome.i18n.getMessage('settings_timer_badgeTimer'),
};

/**
 * @todo Understand if wrappingthe dispatch function causes unexpected renders.
 * These might render again when the 'settings' state is updated by other components.
 * Consider wrapping each of these in a useCallback() with [settingsDispatch] as a dependency.
 */
export default function TimerSettings(): JSX.Element {
  const [settings, settingsDispatch] = useContext(SettingsContext);

  // Destructuring appropriate settings
  const { cycleMinutes, breakMinutes, totalCycles, badgeTimer } = settings;

  // Wrappers for settingsDispatch
  function updateCycleMinutes(value: number) {
    settingsDispatch({ type: 'cycleMinutes', payload: value });
  }

  function updateBreakMinutes(value: number) {
    settingsDispatch({ type: 'breakMinutes', payload: value });
  }

  function updateTotalCycles(value: number) {
    settingsDispatch({ type: 'totalCycles', payload: value });
  }

  return (
    <Section>
      <h1>{locale['title']}</h1>

      <Option>
        <span>{locale['cycleMinutes']}</span>
        <NumberInput
          value={cycleMinutes}
          updateValue={updateCycleMinutes}
          min={1}
          max={59}
        />
      </Option>

      <Option>
        <span>{locale['cycleBreaks']}</span>
        <NumberInput
          value={breakMinutes}
          updateValue={updateBreakMinutes}
          min={1}
          max={59}
        />
      </Option>

      <Option>
        <span>{locale['totalCycles']}</span>
        <NumberInput
          value={totalCycles}
          updateValue={updateTotalCycles}
          min={1}
          max={8}
        />
      </Option>

      <Option>
        <span>{locale['badgeTimer']}</span>
        <Checkbox
          isChecked={badgeTimer}
          onClick={() => settingsDispatch({ type: 'badgeTimer' })}
        />
      </Option>
    </Section>
  );
}
