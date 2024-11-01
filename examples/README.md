# Energy Schedule Node Examples

This folder contains example flows demonstrating different use cases for the Energy Schedule node.

## Available Examples

### 1. basic-schedule-flow.json
- Basic washing machine scheduling example
- Updates every 6 hours
- Uses price optimization
- Requires 2 consecutive hours
- Shows basic status monitoring

### 2. ev-charging-flow.json
- Smart EV charging example
- Optimizes for CO2 emissions
- Handles larger energy demands (40 kWh)
- Uses non-consecutive hours
- Demonstrates status-based actions
- Shows shorter coverage window (12 hours)

### 3. dynamic-requirements-flow.json
- Dynamic energy requirement calculation
- Adjusts based on time of day
- Updates every 30 minutes
- Uses comfort optimization
- Shows function node integration
- Demonstrates variable active hours

## Usage
1. In Node-RED, go to Menu → Import → Clipboard
2. Copy the content of any example file
3. Paste into the import dialog
4. Click Import

## Configuration Required
- Set your ZIP code (Postleitzahl) in the Energy Schedule nodes
- Optionally configure your personal token from https://console.corrently.io/