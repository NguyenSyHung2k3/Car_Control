import 'package:flutter/material.dart';
import 'package:flutter_application_1/components/my_drawer.dart';

class CommandControlPage extends StatefulWidget {
  const CommandControlPage({super.key});

  @override
  State<CommandControlPage> createState() => _CommandControlPageState();
}

class _CommandControlPageState extends State<CommandControlPage> {

  final List<String> availableCommands = [
    "Move Forward",
    "Move Backward",
    "Turn left",
    "Turn right",
    "Stop",
  ];

  void _addCommand() {
    if (selectedCommand != null) {
      setState(() {
        selectedCommands.add(selectedCommand!);
        selectedCommand = null;
      });
    }
  }

  void _submitCommands() {
    if (selectedCommands.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("No commands to send!")),
      );
      return;
    }

    debugPrint("Commands sent: $selectedCommands");

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Commands submitted successfully!")),
    );

    setState(() {
      selectedCommands.clear();
    });
  }

  List<String> selectedCommands = [];
  String? selectedCommand;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Command Control"),
        centerTitle: true,
      ),
      drawer: MyDrawer(),
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: DropdownButton<String>(
                    value: selectedCommand,
                    hint: const Text("Select a command"),
                    isExpanded: true,
                    items: availableCommands.map((cmd) {
                      return DropdownMenuItem(
                        value: cmd,
                        child: Text(cmd),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        selectedCommand = value;
                      });
                    },
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: _addCommand,
                  child: const Text("Add"),
                ),
              ],
            ),
            const SizedBox(height: 20),

            const Text(
              "Selected Commands:",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),

            Expanded(
              child: selectedCommands.isEmpty
                  ? const Center(child: Text("No commands selected"))
                  : ListView.builder(
                      itemCount: selectedCommands.length,
                      itemBuilder: (context, index) {
                        return ListTile(
                          leading: const Icon(Icons.check_circle_outline),
                          title: Text(selectedCommands[index]),
                        );
                      },
                    ),
            ),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _submitCommands,
                icon: const Icon(Icons.send),
                label: const Text("Submit"),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}