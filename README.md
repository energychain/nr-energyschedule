# nr-energyschedule

A Node-RED node for smart energy consumption scheduling based on the [Corrently GrünstromIndex](https://gruenstromindex.de) (GreenPowerIndex). This node helps optimize the energy consumption of your devices by scheduling their operation during periods of favorable electricity conditions - whether that's lowest cost, highest renewable energy content, or maximum user comfort.

## Description

The Energy Schedule node uses the [Corrently API](https://console.corrently.io) to create and manage energy consumption schedules. It's designed for the German energy market and uses the GrünstromIndex to determine optimal operation times for electrical devices and systems.

### Key Features

- Optimize for different goals (price, CO2 emissions, or comfort)
- Flexible scheduling with configurable active hours
- Support for consecutive and non-consecutive operation periods
- Real-time status monitoring
- Persistent schedule tracking across Node-RED restarts
- Simple boolean output for easy device control
- Detailed schedule information for advanced use cases

### Use Cases

1. **Smart Home Appliances**
   - Schedule washing machines to run during cheap/green energy periods
   - Optimize dishwasher operation for overnight running
   - Control water heaters based on energy availability

2. **Electric Vehicle Charging**
   - Smart charging when renewable energy is abundant
   - Cost-optimized charging schedules
   - CO2-minimized charging patterns

3. **Heat Pump Management**
   - Optimize heating cycles based on energy prices
   - Buffer heat during green energy periods
   - Balance comfort and efficiency

4. **Energy Storage Systems**
   - Schedule battery charging during optimal periods
   - Support grid stability through smart timing
   - Maximize self-consumption of solar energy

## Prerequisites

- Location must be in Germany (uses German postal codes/Postleitzahl)
- Node-RED installation
- Optional: Personal API token from [Corrently Console](https://console.corrently.io/)

## Installation

```bash
npm install nr-energyschedule
```

or install via the Node-RED Palette Manager.

## Configuration

### Node Settings

- **Name**: Optional node name
- **ZIP**: German postal code (Postleitzahl) for location-specific scheduling
- **Personal Token**: Your Corrently API token (optional)
- **Law**: Optimization strategy
  - `comfort`: Optimize for user convenience (default)
  - `price`: Optimize for lowest electricity cost
  - `co2`: Optimize for lowest CO2 emissions
- **Coverage Hours**: How many hours ahead to schedule (default: 24)
- **Active Hours**: Required operation hours within coverage period (default: 1)
- **Consecutive Hours**: Whether operation hours must be consecutive (default: true)

### Input

The node accepts a payload with scheduling requirements:

```javascript
{
    "zip": "69168",                    // Optional: override configured ZIP
    "coverageHours": 24,              // Optional: override configured coverage
    "requirements": {
        "law": "price",               // Optional: override configured law
        "activeHours": 4,             // Optional: override configured hours
        "consecutiveHours": true,     // Optional: override configured setting
        "energyDemand": 10,           // Required energy in kWh
        "maxLoad": 3500,              // Maximum power in watts
        "avgLoad": 2000               // Average power in watts
    }
}
```

### Outputs

1. **Status Output** (first output)
   ```javascript
   {
       "payload": true  // or false - indicates if schedule is currently active
   }
   ```

2. **Details Output** (second output)
   ```javascript
   {
       "payload": {
           "scheduleId": "...",
           "timeSlots": [...],
           "progress": {...},
           // Additional schedule details
       }
   }
   ```

## Example Flows

Example flows are included in the `exsamples` directory:

- `basic-schedule-flow.json`: Basic washing machine scheduling
- `ev-charging-flow.json`: Electric vehicle charging optimization
- `dynamic-requirements-flow.json`: Dynamic requirement calculation

## Limitations

- **Geographic Restriction**: This node only works in Germany as it relies on the GrünstromIndex (GreenPowerIndex) which is specifically designed for the German energy market.
- **ZIP Code Required**: A valid German postal code (Postleitzahl) is required for proper operation.
- **API Rate Limits**: May apply depending on your Corrently API access level.


## License

[Apache-2.0](./LICENSE)

## Credits

- Uses the [Corrently API](https://api.corrently.io/) and GrünstromIndex
- Developed for the Node-RED community