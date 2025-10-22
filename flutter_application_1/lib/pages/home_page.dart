import 'package:flutter/material.dart';
import 'package:flutter_application_1/components/my_drawer.dart';
import 'package:flutter_application_1/controller/ble_controller.dart';
import 'package:get/get.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {

  final BleController bleController = Get.put(BleController());

  @override initState() {
    super.initState();
    bleController.startScan();
  }

  @override dispose() {
    bleController.stopScan();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Home"),
        centerTitle: true,
        actions: [
          Obx(() => IconButton(
            icon: Icon(
              bleController.isScanning.value ? Icons.stop : Icons.search,
            ),
            onPressed: () {
              if (bleController.isScanning.value) {
                bleController.stopScan();
              } else {
                bleController.startScan();
              }
            },
          )),
        ]
      ),
      drawer: MyDrawer(),
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: Column(
        children: [
          Obx(() {
            final device = bleController.connectedDevice.value;

            if (device == null) {
              return const Text("No device connected");
            }

            final deviceName = device.name;

            final deviceId = device.id;

            return ListTile(
              title: Text(deviceName!),
              subtitle: Text("Connected ($deviceId)"),
              trailing: IconButton(
                icon: const Icon(Icons.link_off),
                onPressed: () async {
                  final shouldDisconnect = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text("Disconnect Device"),
                      content: const Text("Are you sure you want to disconnect this device?"),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(false),
                          child: const Text("Cancel"),
                        ),
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(true),
                          child: const Text("Yes"),
                        ),
                      ],
                    ),
                  );

                  if (shouldDisconnect == true) {
                    await bleController.disconnectToDevice(device);
                    bleController.connectedDevice.value = null;
                  }
                },
              ),
            );
          }),

          const Divider(),

          // Danh sách thiết bị BLE tìm được
          Expanded(
            child: Obx(() {
              final results = bleController.scanResults;
              final connectedDevice = bleController.connectedDevice.value;

              if(connectedDevice != null){
                return ListView.builder(
                  itemCount: results.length,
                  itemBuilder: (context, index) {
                    final r = results[index];
                    final device = r;
                    return ListTile(
                      title: Text(device.name!),
                      subtitle: Text(device.id),
                      trailing: ElevatedButton(
                        onPressed: () => bleController.connectToDevice(device),
                        child: const Text('Connected'),
                      ),
                    );
                  },
                );
              }

              if (results.isEmpty) {
                return const Center(
                  child: Text('Scanning BLE Device...'),
                );
              }

              return ListView.builder(
                itemCount: results.length,
                itemBuilder: (context, index) {
                  final r = results[index];
                  final device = r;
                  return ListTile(
                    title: Text(device.name!),
                    subtitle: Text(device.id),
                    trailing: ElevatedButton(
                      onPressed: () => bleController.connectToDevice(device),
                      child: const Text('Connect'),
                    ),
                  );
                },
              );
              
            }),
          ),
        ],
      ),
    );
  }
}

