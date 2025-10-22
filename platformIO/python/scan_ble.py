from bleak import BleakScanner
import asyncio

async def main():
    print("Scanning for BLE devices...")
    devices = await BleakScanner.discover()
    for d in devices:
        print(f"Name: {d.name}, Address: {d.address}")

asyncio.run(main())
