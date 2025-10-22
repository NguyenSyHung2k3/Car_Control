import 'package:flutter/material.dart';
import 'package:flutter_application_1/components/my_drawer.dart';
import 'package:flutter_application_1/components/control/my_control_button.dart';
import 'package:flutter_application_1/controller/ble_controller.dart';
import 'package:get/get.dart';
class ControlPage extends StatefulWidget {
  const ControlPage({super.key});

  @override
  State<ControlPage> createState() => _ControlPageState();
}

class _ControlPageState extends State<ControlPage> {

  final BleController bleController = Get.put(BleController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Control"),
        centerTitle: true,
      ),
      drawer: MyDrawer(),
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: Center(
        child: Container(
          width: 280,
          height: 280,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Theme.of(context).colorScheme.surfaceContainerHighest,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Forward Button
              Positioned(
                top: 20,
                child: MyControlButton(
                  icon: Icons.arrow_drop_up,
                  onPressed: () => bleController.sendCommand("F"),
                ),
              ),

              // Backward Button
              Positioned(
                bottom: 20,
                child: MyControlButton(
                  icon: Icons.arrow_drop_down,
                  onPressed: () => bleController.sendCommand("D"),
                ),
              ),

              // Left Button
              Positioned(
                left: 20,
                child: MyControlButton(
                  icon: Icons.arrow_left,
                  onPressed: () => bleController.sendCommand("L"),
                ),
              ),

              // Right Button
              Positioned(
                right: 20,
                child: MyControlButton(
                  icon: Icons.arrow_right,
                  onPressed: () => bleController.sendCommand("R"),
                ),
              ),

              // Stop Button
              MyControlButton(
                icon: Icons.stop,
                onPressed: () => bleController.sendCommand("S"),
              ),
            ],
          ),
        ),
      ),
    );  
  }
}