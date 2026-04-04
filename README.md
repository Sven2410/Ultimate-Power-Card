# Ultimate Power Card

A custom Lovelace card for Home Assistant that displays voltage, power, and current per electrical phase. Supports single-phase and three-phase power systems.

## Features

- **1 or 3 phase support** — choose your configuration in the GUI editor
- **Smart power formatting** — automatically switches between W and kW (e.g. 5 W vs 1.23 kW)
- **Aligned columns** — voltage, power, and current values are always perfectly aligned regardless of value width, using tabular number formatting
- **Per-phase display** — each phase shown on its own row with voltage (V), power (W/kW), and current (A)
- **Glass morphism style** — frosted glass design consistent with the Ultimate Card series
- **GUI Editor** — grouped entity pickers per phase with clear labels (Spanning, Vermogen, Stroom)

## Installation

### HACS (recommended)

1. Open HACS in Home Assistant
2. Go to **Frontend** → click the **⋮** menu → **Custom repositories**
3. Add `https://github.com/Sven2410/ultimate-power-card` with category **Dashboard**
4. Click **Install**
5. Refresh your browser (hard refresh: Ctrl+Shift+R)

### Manual

1. Download `ultimate-power-card.js` from the [latest release](https://github.com/Sven2410/ultimate-power-card/releases/latest)
2. Copy it to `/config/www/ultimate-power-card.js`
3. Add the resource in **Settings → Dashboards → ⋮ → Resources**:
   - URL: `/local/ultimate-power-card.js`
   - Type: JavaScript Module

## Configuration

### Visual Editor

1. Add a card to your dashboard
2. Search for **Ultimate Power Card**
3. Select 1 or 3 phases
4. Fill in the sensor entities per phase

### YAML

```yaml
type: custom:ultimate-power-card
phases: 3
voltage_l1: sensor.electricity_meter_voltage_l1
power_l1: sensor.electricity_meter_power_l1
current_l1: sensor.electricity_meter_current_l1
voltage_l2: sensor.electricity_meter_voltage_l2
power_l2: sensor.electricity_meter_power_l2
current_l2: sensor.electricity_meter_current_l2
voltage_l3: sensor.electricity_meter_voltage_l3
power_l3: sensor.electricity_meter_power_l3
current_l3: sensor.electricity_meter_current_l3
```

| Option         | Type   | Required      | Default | Description                        |
|----------------|--------|---------------|---------|------------------------------------|
| `phases`       | number | No            | `3`     | Number of phases: `1` or `3`       |
| `voltage_l1`   | string | **Yes**       |         | Voltage sensor for phase 1         |
| `power_l1`     | string | **Yes**       |         | Power sensor for phase 1           |
| `current_l1`   | string | **Yes**       |         | Current sensor for phase 1         |
| `voltage_l2`   | string | 3-phase only  |         | Voltage sensor for phase 2         |
| `power_l2`     | string | 3-phase only  |         | Power sensor for phase 2           |
| `current_l2`   | string | 3-phase only  |         | Current sensor for phase 2         |
| `voltage_l3`   | string | 3-phase only  |         | Voltage sensor for phase 3         |
| `power_l3`     | string | 3-phase only  |         | Power sensor for phase 3           |
| `current_l3`   | string | 3-phase only  |         | Current sensor for phase 3         |

## Screenshots

_Coming soon_

## License

MIT
