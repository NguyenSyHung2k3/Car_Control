import 'dart:typed_data';
import 'package:flutter_web_bluetooth/js_web_bluetooth.dart';
import 'package:flutter_web_bluetooth/js_web_bluetooth.dart' as fwb;
import 'package:flutter_web_bluetooth/web/js/js_supported.dart';
import 'package:get/get.dart';
import 'package:flutter_web_bluetooth/flutter_web_bluetooth.dart' as fwb;

class BleController extends GetxController {
  // Reactive states
  var scanResults = <fwb.BluetoothDevice>[].obs;
  var isScanning = false.obs;
  var connectedDevice = Rxn<fwb.BluetoothDevice>();

  // UUIDs
  final String serviceUuid = "a6decdd8-f8af-49cc-91f9-5a0b43283a6e";
  final String characteristicUuid = "d6e61f51-671e-41e1-b865-11c553ef86e2";

  final flutterWebBluetooth = fwb.FlutterWebBluetooth.instance;

  fwb.WebBluetoothRemoteGATTCharacteristic? commandCharacteristic;
  @override
  void onInit() {
    super.onInit();
    // The bluetooth api exists in this user agent.
    final supported = fwb.FlutterWebBluetooth.instance.isBluetoothApiSupported;
    if(supported){
      fwb.FlutterWebBluetooth.instance.isAvailable.listen((available) {
        if (available) {
          print("[BLE] ✅ Web Bluetooth is supported and available!");
        } else {
          print("[BLE] ⚠️ Bluetooth adapter is not available on this device/browser.");
        }
      });
    }
    print("[BLE] Running in Web mode");
  }

  // ─────────────────────────────────────────────
  // 🔍 Scan (Web)
  Future<void> startScan() async {
    try {
      if (!await flutterWebBluetooth.isBluetoothApiSupported) {
        print("[BLE] ❌ Web Bluetooth not supported in this browser");
        return;
      }

      print("[BLE] 🟢 Requesting user to select a BLE device...");
      isScanning.value = true;

      // Show browser device picker dialog
      final requestOptions = fwb.RequestOptionsBuilder.acceptAllDevices(
        optionalServices: [
          fwb.BluetoothDefaultServiceUUIDS.deviceInformation.uuid,
          serviceUuid, // include your custom service UUID too
        ],
      );

      try {
        final device = await fwb.FlutterWebBluetooth.instance.requestDevice(requestOptions);

        if (device != null) {
          scanResults.value = [device]; // Add the found device
          print("[BLE] ✅ User selected device: ${device.name ?? "Unnamed"} (${device.id})");
        } else {
          print("[BLE] ⚠️ No device selected");
        }
      } catch (e) {
        printError(info: "[BLE][ScanWebInner] $e");
      } finally {
        isScanning.value = false;
      }
    } catch (e) {
      isScanning.value = false;
      printError(info: '[BLE][ScanWeb] $e');
    }
  }


  Future<void> stopScan() async {
    // Web Bluetooth does not support continuous scanning like mobile BLE
    isScanning.value = false;
    print("[BLE] stopScan() — no action needed on Web");
  }

  // ─────────────────────────────────────────────
  // 🔗 Connect
  Future<void> connectToDevice(fwb.BluetoothDevice device) async {
    try {
      print("[BLE] Connecting to Web device: ${device.name}...");
      await device.connect();
      connectedDevice.value = device;

      final gatt = device.gatt;
      if (gatt == null) {
        print("[BLE] ❌ No GATT server found on this device.");
        return;
      }

      final services = await gatt.getPrimaryServices();
      print("[BLE] Found ${services.length} services");

      for (final service in services) {
      print("🔹 Service UUID: ${service.uuid}");

      try {
        final characteristics = await service.getCharacteristics();
        print("   ↳ Found ${characteristics.length} characteristics");

        for (final c in characteristics) {
          print("     • Characteristic UUID: ${c.uuid}");
          print("       - Readable: ${c.properties.read}");
          print("       - Writable: ${c.properties.write}");
          print("       - Notifiable: ${c.properties.notify}");

          // Optional: Try to read the value if readable
          if (c.properties.read) {
            try {
              final value = await c.readValue(); // returns ByteData
              final bytes = value.buffer.asUint8List(); // convert ByteData → Uint8List
              if (bytes.isNotEmpty) {
                print("       - Value: ${String.fromCharCodes(bytes)}");
              } else {
                print("       - Value: (empty)");
              }
            } catch (e) {
              print("       - ❌ Failed to read value: $e");
            }
          }
        }
      } catch (e) {
        print("   ❌ Failed to get characteristics for ${service.uuid}: $e");
      }
    }

      // final services = await device.discoverServices();
      // final service = services.firstWhere((service) => service.uuid == fwb.BluetoothDefaultServiceUUIDS.deviceInformation.uuid);
      // final characteristic = await service.getCharacteristic(fwb.BluetoothDefaultCharacteristicUUIDS.manufacturerNameString.uuid);

      // final value = characteristic.readValue();
      // print(value);

      // Example: Device Information Service

      final service = services.firstWhere(
        (s) => s.uuid.toLowerCase() == serviceUuid,
      );

      commandCharacteristic = await service.getCharacteristic(characteristicUuid);
      if (commandCharacteristic != null) {
        print("[BLE] ✅ Found command characteristic: ${commandCharacteristic!.uuid}");
      } else {
        print("[BLE] ⚠️ Characteristic not found in service $serviceUuid");
      }
    } catch (e) {
      print("[BLE] ℹ️ No Device Information service or Manufacturer Name found: $e");
    }
  }

  // ─────────────────────────────────────────────
  // 📤 Send command
  Future<void> sendCommand(String command) async {
    try {
      if (commandCharacteristic == null) {
        print("[BLE] Not connected or characteristic unavailable");
        return;
      }

      final data = Uint8List.fromList(command.codeUnits);
      await commandCharacteristic!.writeValueWithoutResponse(
        Uint8List.fromList(command.codeUnits),
      );
      print("[BLE] Sent command: $command");
    } catch (e) {
      printError(info: '[BLE][Send] $e');
    }
  }

  // ─────────────────────────────────────────────
  // 🔌 Disconnect
  Future<void> disconnectToDevice(fwb.BluetoothDevice device) async {
    try {
      print("[BLE] Disconnecting from device...");
      device.disconnect();
      connectedDevice.value = null;
      commandCharacteristic = null;
      print("[BLE] Disconnected");
    } catch (e) {
      printError(info: '[BLE][Disconnect] $e');
    }
  }
}
