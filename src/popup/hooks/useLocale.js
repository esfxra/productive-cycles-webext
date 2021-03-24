"use strict";

import { useState, useEffect } from "react";

const useLocale = (message_set) => {
  const [locale, setLocale] = useState({});

  useEffect(() => {
    let set = {};
    message_set.forEach((message) => {
      set[message] = chrome.i18n.getMessage(message);
    });

    setLocale(set);
  }, []);

  return locale;
};

export default useLocale;
