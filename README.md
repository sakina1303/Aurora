# Aurora

Aurora is a private, local-first diary for daily writing, photos, vision boards, and small rituals. The redesign keeps the original warm palette and Dancing Script / Lobster typography. A single warm serif supports the decorative headings and keeps navigation, forms, and longer text consistent.

## What's new

- A diary page with paper edges, dates, page numbers, and readable body text.
- An offline 3D page turn across consecutive calendar days, including unwritten days. In Diary, tap **Read as a diary**, then swipe left for the next day or right for the previous day. The Previous and Next controls work too, and older days keep loading as you turn. Reduced-motion settings shorten the transition.
- Today now turns left to a locked tomorrow page and right to a previous day. Tomorrow opens at **12:00 AM in the device's IANA time zone**; previous saved pages show Edit. The day gate checks the rule in the storage layer, and can use a server clock when configured.
- A searchable diary where tapping an entry opens its full page. Existing `journal-YYYY-MM-DD` entries are read without a destructive migration.
- Date-based streaks with a seven-day history, today toggle, rename, and delete. Rituals now persist between launches.
- Monthly and Yearly vision boards are saved by calendar period. Notes and photos can be dragged, marked done with a soft green finish, edited, and moved forward to the next month or year. Earlier boards appear in **Diary → Vision board history** with done and pending counts. Existing saved board items migrate into the current period when the new format first loads.
- New photos are copied from picker cache into the app's document storage. Accessible older journal photos are copied there when entries are loaded.

## Run locally

Requires Node.js 20+, npm, and an iOS or Android device/simulator with a compatible Expo Go client.

```sh
npm ci
npm start
```

Scan the QR code with Expo Go or press `i` / `a` when a simulator is installed. For a native development build, use `npm run ios` or `npm run android` with the corresponding platform tools installed.

For a browser preview, run `npm run web`. The browser uses local storage for entries and boards. Native builds keep selected photos in the app's document storage; the web preview keeps photo picker URIs for the current session only.

For a server-authoritative unlock check, run `npm run day-gate` and build or start the app with `EXPO_PUBLIC_AURORA_API_URL` set to its reachable URL (for example `http://127.0.0.1:8766` for the local web preview). The app checks this endpoint before every journal save and uses its clock for the day boundary. The endpoint validates IANA time zones and returns the exact UTC unlock instant, including daylight-saving changes. Use a hosted HTTPS URL for a mobile release. If no URL is set, the app uses the device clock.

## Storage

Entries, habits, and boards are kept on the device with AsyncStorage. Photos selected after this redesign are stored in the app's document directory. Uninstalling the app removes local data. The day-gate server handles time checks only; there is no account or cloud sync.

## Manual checks

1. Write and save today's entry, add a photo, leave the tab, and reopen it.
2. On Today, swipe left to tomorrow's lock, then right to return. Swipe right again to a previous day. In Diary, use Read as a diary, check Edit on a saved past page and Write on an unwritten one.
3. Add a ritual, complete and undo today, then restart the app and check its history.
4. Add a note to each vision board, mark one done, move another to the next period, and restart the app. Use the period arrows to check the saved boards. After a period ends, find it in Diary → Vision board history.
5. Enable reduced motion in device settings and turn a diary page again.
6. Run `npm run test:day-gate` to check midnight unlocks in India and across a New York daylight-saving change.
