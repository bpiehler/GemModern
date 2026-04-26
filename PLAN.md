# Modern Classic Watchface - MVP (v1) Implementation Plan

## Objective
Build an analog Pebble watchface using the Alloy (Moddable SDK) framework, targeting Gabbro (260x260) and Emery (200x228) platforms. The v1 MVP will focus on a clean, modern design with a configurable analog dial, date display, and a simplified circular battery complication. Weather functionality is deferred to v2.

## Key Files & Context
*   **`watchface/package.json`**: App metadata, platform targets (`gabbro`, `emery`), and `messageKeys` for Clay configuration.
*   **`watchface/src/embeddedjs/main.js`**: Core watchface logic, rendering via Poco, timekeeping (`minutechange`), and battery state handling.
*   **`watchface/src/pkjs/index.js`**: Phone-side logic, setting up Clay for offline configuration.
*   **Frameworks**: Alloy (Poco for graphics), `@rebble/clay` (for configuration).

## Implementation Steps

### 1. Project Configuration (`package.json`)
*   Add `@rebble/clay` as a dependency (assuming standard npm installation or local inclusion as per Alloy standards).
*   Verify `targetPlatforms` includes `gabbro` and `emery`.
*   Define `messageKeys` for configurable colors:
    *   `bgColor` (default: black)
    *   `dialColor` (default: dark gray)
    *   `numberColor` (default: white)
    *   `hourHandColor` (default: white)
    *   `minuteHandColor` (default: light gray)

### 2. Phone-Side Configuration (`src/pkjs/index.js` & Clay config)
*   Create a Clay configuration JSON (e.g., `src/pkjs/config.json`) defining color pickers for the `messageKeys`.
*   Set up `@rebble/clay` in `src/pkjs/index.js` to serve the settings page and handle the `webviewclosed` event to send settings to the watch.

### 3. Watch-Side Rendering (`src/embeddedjs/main.js`)
*   **Setup Poco**: Initialize Poco renderer and load necessary built-in fonts (e.g., a sans-serif font for numbers and complications).
*   **State Management**: Initialize variables for time, battery level, and user configuration colors. Implement an `AppMessage` listener to update color state when settings change.
*   **Render Loop (`draw` function)**:
    *   Clear screen with `bgColor`.
    *   **Dial Face**: Draw a filled circle at center (130,130 for Gabbro, scaled for Emery) with `dialColor`.
    *   **Tick Marks & Numbers**: Loop 1-12 to calculate positions around the perimeter. Draw tick marks and text using `numberColor`.
    *   **Date Complication**: Near 12 o'clock, render current date string.
    *   **Battery Complication**: Near 3 o'clock, draw a fixed circle. Set fill color based on battery state (Green >50%, Yellow 20-50%, Red <20%). Overlay percentage text.
    *   **Hands**: Calculate angles for current hour and minute. Draw thick lines from the center (length ~45% radius for hour, ~70% for minute) using `hourHandColor` and `minuteHandColor`.
*   **Event Listeners**:
    *   Register `minutechange` event to trigger the render loop.
    *   Register battery state change event to update battery value and trigger render.

## Verification & Testing
*   **Build**: Compile successfully for `gabbro` and `emery` using `pebble build`.
*   **Emulation**: Run in Gabbro/Emery emulators.
*   **Visuals**: Verify hands calculate correct angles and complications are positioned cleanly.
*   **Battery Simulation**: Use emulator tools to change battery levels and verify the complication circle updates colors correctly.
*   **Config Sync**: Simulate settings changes to ensure colors update live on the watchface.
