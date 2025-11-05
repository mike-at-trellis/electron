# Electron TypeScript App

A cross-platform desktop application built with Electron and TypeScript, ready to build for PC (Windows), Mac, and Linux.

## Features

- ⚡ Built with Electron for cross-platform support
- 📘 TypeScript for type safety
- 🏗️ electron-builder for creating distributable packages
- 🎨 Modern UI with gradient styling
- 🔒 Secure context isolation with preload script
- ✅ Production-ready with security best practices

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

```bash
npm install
```

## Development

Run the app in development mode:

```bash
npm run dev
```

## Building

### Build TypeScript files
```bash
npm run build
```

### Create distributable packages

#### Build for current platform
```bash
npm run dist
```

#### Build for Windows
```bash
npm run dist:win
```

#### Build for Mac
```bash
npm run dist:mac
```

#### Build for all platforms
```bash
npm run dist:all
```

Built applications will be available in the `release` directory.

## Project Structure

```
electron/
├── src/
│   ├── main.ts         # Main process (Electron)
│   ├── preload.ts      # Preload script (secure bridge)
│   └── renderer.ts     # Renderer process
├── index.html          # Main window HTML
├── package.json        # Project dependencies and build config
├── tsconfig.json       # TypeScript configuration (main & preload)
└── tsconfig.renderer.json  # TypeScript configuration (renderer)
```

## Security

This app follows Electron security best practices:
- Context isolation is enabled
- Node integration is disabled in the renderer
- A preload script safely exposes only necessary APIs
- Updated to Electron 35.7.5 with latest security patches

## Platform-specific Notes

### Mac
- Requires macOS to build .dmg and .zip files
- Code signing may be required for distribution

### Windows
- Creates NSIS installer and portable executable
- Can be built on any platform

### Linux
- Creates AppImage and .deb packages
- Can be built on any platform

## License

MIT