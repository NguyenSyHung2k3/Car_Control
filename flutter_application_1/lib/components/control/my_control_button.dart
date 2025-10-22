import 'package:flutter/material.dart';

class MyControlButton extends StatelessWidget {

  final IconData icon;
  final VoidCallback onPressed;

  const MyControlButton({
    super.key,
    required this.icon,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: Theme.of(context).colorScheme.primary,
        shape: const CircleBorder(), 
        padding: const EdgeInsets.all(20), 
        elevation: 5,
      ),
      onPressed: onPressed,
      child: Icon(
        icon,
        color: Colors.white,
        size: 30,
      ),
    );
  }
}