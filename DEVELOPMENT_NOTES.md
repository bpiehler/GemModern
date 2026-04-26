# Pebble Alloy Development Notes

These notes summarize the key technical learnings and workflows established during the development of the **Modern Classic** watchface.

## 1. Core Framework & Rendering (Alloy/Poco)
*   **Poco Engine:** Procedural, low-level graphics framework. It does not have built-in `fillCircle` or `drawLine` (arbitrary angle) methods in its base JavaScript API.
*   **Optimized Algorithms:**
    *   **Circles:** Use the **Midpoint Circle Algorithm** (scanline approach) using `fillRectangle` with a height of 1px for maximum performance.
    *   **Lines (Hands):** Use **Bresenham's Line Algorithm** with `fillRectangle` as a primitive. Ensure thickness is handled by offsetting the rectangle origin.
*   **Rendering Loop:** Always wrap drawing commands between `render.begin()` and `render.end()`.
*   **Battery Efficiency:** Bind the primary render loop to the `minutechange` event instead of `secondchange` to significantly reduce wake cycles.

## 2. Platform & Hardware Specifics
*   **Targets:** This project targets **Gabbro** (260x260 round) and **Emery** (200x228).
*   **Fonts:** System fonts must be referenced by their family and specific size identifiers. 
    *   *Safe choices:* `"Bitham-Bold"` (sizes like 42), `"Gothic-Bold"` (sizes like 18, 24).
    *   *Error:* Using an unsupported font name/size combination (e.g., `"Gothic-14"`) will throw a "font not found" exception and halt rendering.

## 3. Debugging & Logging
*   **Watch-side Logs:** Use `console.log()` in `embeddedjs`. These logs are piped through the Pebble tool but can be brittle.
*   **C-side Logs:** Use `APP_LOG(APP_LOG_LEVEL_DEBUG, "msg")` in `src/c/mdbl.c` to verify the Moddable machine initialization.
*   **Reference Errors:** Objects like `navigator` are **not** globally available in the embedded Alloy environment. Use the `watch` global (e.g., `watch.battery.level`) for hardware state.

## 4. Testing & Verification Workflow
To ensure a clean test environment and capture accurate screenshots, follow this sequence:
1.  **Build:** `pebble build`
2.  **Reset:** `pebble kill && pebble wipe` (Stops old instances and clears cache)
3.  **Deploy:** `pebble install --emulator gabbro --logs`
4.  **Wait:** Allow ~12–15 seconds for the boot sequence and the first `Draw success` log before interacting.
5.  **Screenshot:** `pebble screenshot --emulator gabbro filename.png`

## 5. Configuration (Clay)
*   **Module:** Use `@rebble/clay` for offline, phone-side settings.
*   **Integration:** Define `messageKeys` in `package.json` as an object mapping keys to integers.
*   **Sync:** Handle the `appmessage` event on the watch to live-update colors without requiring a restart.

## 6. Known Emulator Quirks
*   **Crashes:** The emulator (especially for high-res prototypes like Gabbro) may crash after several minutes of uptime. This is typically an emulator-side issue rather than a code leak. Relaunch with `pebble kill` and `pebble install`.
*   **Screenshot Timing:** Taking a screenshot too early in the boot sequence may result in a blank or partially rendered frame. Always verify "Draw success" in the logs first.
