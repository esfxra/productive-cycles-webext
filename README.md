# Productive Cycles
Pomodoro-inspired timer extension for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/productive-cycles/) and [Google Chrome](https://chrome.google.com/webstore/detail/productive-cycles/lhcaggipefcoefbijhmdehhloonnlobh)

This [article](https://blog.trello.com/how-to-pomodoro-your-way-to-productivity) from the Trello blog explains it nicely

### Features
- Timer with configurable minutes
- Configurable cycles - number of periods the user wants the timer to repeat itself for
- Tracker for completed cycles during each session
- Notifications sent to the user once the timer expires

### Inspiration
- A hands-on project to practice Javascript, and to learn more about listeners + asynchronous programming
- Automating a technique that has worked really well for me
- Chrome extension vs. mobile app: quicker deployment
- This became an opportunity to publish a piece of software in a store for the first time

### License
MIT License; check out the LICENSE.md file in the repo

### References
- [MDN Web Docs - Web Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Chrome Developer Resources - Extensions](https://developer.chrome.com/extensions)

### Icons
From the open source collection [Font Awesome](https://fontawesome.com/license/free)

---

### Manual Installation
1. Clone the repository `git clone https://github.com/diegoserranor/productive-cycles-webext.git`

2. Install the necessary modules `npm install` (assuming you have Node installed)

3. Run a production build with `npm run build`

4. Load the extension to the browser:

    * Firefox - Visit `about:debugging` and load it as a temporary extension

    * Chrome - Visit `chrome:extensions`, enable the developer mode, and load it as an unpacked extension
