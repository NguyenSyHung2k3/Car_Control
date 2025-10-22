import 'package:flutter/material.dart';
import 'package:flutter_application_1/components/my_drawer_title.dart';
import 'package:flutter_application_1/pages/home_page.dart';
import 'package:flutter_application_1/pages/main/command_control_page.dart';
import 'package:flutter_application_1/pages/main/control_page.dart';

class MyDrawer extends StatelessWidget {

  const MyDrawer({super.key});

  // control method
  void control(BuildContext context) {

    // navigate to control page 
    Navigator.push(
      context, 
      MaterialPageRoute(
        builder: (context) => const ControlPage()
      ),
    );
  }

  // command control method
  void commandControl(BuildContext context) {

    // navigate to command control page 
    Navigator.push(
      context, 
      MaterialPageRoute(
        builder: (context) => const CommandControlPage()
      ),
    );
  }

  // home method
  void home(BuildContext context){

    // navigate to home page 
    Navigator.push(
      context, 
      MaterialPageRoute(
        builder: (context) => const HomePage()
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: Theme.of(context).colorScheme.surface,
      child: Column(
        children: [

          // app logo

          Padding(
            padding: const EdgeInsets.only(top: 100.0),
            child: Icon(
              Icons.lock_open_rounded,
              size: 80,
              color: Theme.of(context).colorScheme.inversePrimary,
            )
          ),

          Padding(
            padding: const EdgeInsets.all(25.0),
            child: Divider(
              color: Theme.of(context).colorScheme.secondary,
            ),
          ),

          // home list tile
          MyDrawerTile(text: "H O M E", icon: Icons.home, onTap: () => home(context)),
          
          // control using button list tile
          MyDrawerTile(text: "C O N T R O L 1", icon: Icons.control_point, onTap: () => control(context)),

          // control using commands list tile
          MyDrawerTile(text: "C O N T R O L 2", icon: Icons.control_point_duplicate_sharp, onTap: () => commandControl(context)),
        ],
      ),
    );
  }
}