# Circuit Mapper - Van Electrical System Designer

A visual tool for mapping and designing electrical circuits for van builds, campers, and RVs. Design your complete electrical system with an intuitive drag-and-drop interface.

![Circuit Mapper](https://img.shields.io/badge/Made%20for-Van%20Life-blue)

## Features

### 🔌 Extensive Component Library
Pre-built components organized by category for van electrical systems:
- **Power Sources**: Solar panels, alternator chargers, shore power
- **Power Storage**: Leisure batteries, lithium (LiFePO4), starter batteries
- **Power Management**: MPPT/PWM chargers, inverters, DC-DC converters
- **Distribution**: Fuse boxes, bus bars, switches, circuit breakers
- **Lighting**: LED lights, strips, dimmers
- **Climate Control**: Roof fans, diesel heaters, AC units
- **Water System**: Pumps, heaters, tank sensors
- **Appliances**: Fridges, USB outlets, 12V/AC outlets
- **Safety**: Smoke/CO/LPG detectors
- **Monitoring**: Battery monitors, shunts, display panels

### ✨ Custom Components
Create your own components with:
- Custom names and descriptions
- Image upload support (up to 500KB)
- Configurable connection nodes (positive, negative, earth, AC live/neutral, signal)
- Category organization

### 🎨 Intuitive Interface
- Drag-and-drop component placement
- Click-to-connect nodes for wiring
- Double-click cables to edit wire size
- Right-click context menu for component actions
- Zoom controls (Ctrl + scroll or buttons)
- Pan navigation (Shift + drag or middle mouse)

### 💾 Project Management
- Auto-save to browser localStorage
- Export/Import JSON project files
- Shareable circuit designs
- Project naming and organization

### ⌨️ Keyboard Shortcuts
- `Delete/Backspace` - Remove selected component
- `Escape` - Deselect / Close panels
- `Ctrl + S` - Export project
- `Ctrl + Scroll` - Zoom in/out

## Getting Started

### Prerequisites
- Node.js 18+ 
- Bun (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd circuit-maker

# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Adding Components
1. Browse or search components in the left sidebar
2. Drag a component onto the canvas
3. Position it as needed

### Creating Connections
1. Click on a node (colored circle) on any component
2. Click on another node to complete the connection
3. Double-click the cable label to edit wire size

### Custom Components
1. Click "Create Custom Component" in the sidebar
2. Enter name, description, and category
3. Optionally upload an image
4. Configure connection nodes
5. Save and start using your custom component

### Exporting Your Design
1. Click "Export" in the header
2. Save the JSON file
3. Share or import later on any device

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Storage**: Browser localStorage

## Project Structure

```
circuit-maker/
├── app/                    # Next.js app router
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles & theme
├── components/            # React components
│   ├── circuit-canvas.tsx      # Main canvas with zoom/pan
│   ├── circuit-component.tsx   # Draggable component card
│   ├── component-toolbar.tsx   # Sidebar with component library
│   ├── connections-panel.tsx   # Connection details panel
│   ├── settings-panel.tsx      # Project settings
│   ├── create-component-dialog.tsx  # Custom component creator
│   ├── swap-component-dialog.tsx    # Component swap dialog
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities
│   ├── component-definitions.ts  # Default component library
│   ├── storage.ts         # LocalStorage utilities
│   └── utils.ts           # General utilities
└── types/                 # TypeScript types
    └── circuit.ts         # Core type definitions
```

## Node Types

| Color | Type | Description |
|-------|------|-------------|
| 🔴 Red | Positive | DC positive terminal (+) |
| 🔵 Blue | Negative | DC negative terminal (-) |
| 🟢 Green | Earth | Ground/chassis connection |
| 🟠 Orange | AC Live | AC live/hot wire |
| 🟣 Purple | AC Neutral | AC neutral wire |
| 🔵 Cyan | Signal | Data/communication line |

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - feel free to use this for your van build projects!

---

Built with ⚡ for the van life community
