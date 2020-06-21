# Adyen Cloud Terminal API NodeJS Test

## Purpose
To create a NodeJS program that automatically sends payment requests to a terminal repeatedly while monitoring battery level to catch a DeviceOut error.

The raw request/response is sent to a txt file for further analysis.

## How to Use
1. Create a .env file
```
X_API_Key=[YOUR_API_KEY]
```
2. Check server.js line 8, 11, 14 to set number of payment requests, terminal S/N, and time in between payment requests
3. Run npm install to install dependencies