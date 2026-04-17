# TankerTrackers GIS Overlay

Quick local Vite + React app for exploring TankerTrackers-style monthly export data.

## What it does

- Loads TankerTrackers-style monthly export data from JSON, CSV, or the bundled TXT matrix sample.
- Shows all years present in the loaded dataset by default.
- Draws world flow lines with GIS-style country overlays.
- Supports the documented monthly export API shape, a flat CSV import, and the tab-separated monthly traffic matrix used in `tankertraffic2021-2023.txt`.
- Includes destination filtering, separate source/destination map markers, and a month timeline scrubber/animation control.

## Supported inputs

### Monthly API JSON

Expected around the documented Corporate Lite monthly endpoint shape:

`api/em/v4/[API Key]/[Country Code]/[Year]/[Month]`

The parser reads the request parameters and `data[]` rows, including fields such as:

- `destination_country`
- `destination_code`
- `barrels`
- `cargo_type`

### Flat CSV

Minimum required columns:

- `year`
- `month`
- `origin_code`
- `destination_code`
- `barrels`

Optional fields:

- `origin_name`
- `destination_name`
- `cargo_type`

### Tab-Separated TXT Matrix

The app also parses the monthly origin/destination matrix format used by [tankertraffic2021-2023.txt](/home/john/repos/tankertracker/tankertraffic2021-2023.txt).

## Local run

1. Install dependencies with `npm install`
2. Start the app with `npm run dev`
3. Open the local Vite URL shown in the terminal

## Deploy

This project is a static Vite app, so the simplest live deployment is Vercel.

### Recommended: Vercel via GitHub

1. Initialize git in this folder if needed:
   `git init`
2. Create a GitHub repo and push this project.
3. Import the repo into Vercel.
4. Use these settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`

No extra Vercel configuration is required for the current app.

### Alternative: Netlify

Use:
- Build command: `npm run build`
- Publish directory: `dist`

## Notes

The map defaults to country-to-country flows because that is the public API shape this app is built around. If you later have CSV exports with ports and coordinates, the same data flow can be extended to render true port-to-port routes.
