import 'package:flutter/material.dart';

class NemesisTrackingCard extends StatelessWidget {
  final String title;
  final int encounterCount;
  final int victories;
  final int overhelmedCount;
  final int averagePreparation;
  final String weakestAttribute;
  final String recommendedTraining;

  const NemesisTrackingCard({
    Key? key,
    required this.title,
    required this.encounterCount,
    required this.victories,
    required this.overhelmedCount,
    required this.averagePreparation,
    required this.weakestAttribute,
    required this.recommendedTraining,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF130303), Color(0xFF050000)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: const Color(0x33EF4444), width: 1.0),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Flag
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'NEMESIS CONSTRUCT ACTIVE',
                style: TextStyle(fontFamily: 'Courier', fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFF87171), letterSpacing: 1.5),
              ),
              Icon(Icons.gavel_outlined, color: const Color(0xFFEF4444).withOpacity(0.5), size: 16),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            title.toUpperCase(),
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFFFEE2E2), letterSpacing: -0.2),
          ),
          const SizedBox(height: 20),

          // Analytical Grid Core
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildStat('ENCOUNTERS', '$encounterCount'),
              _buildStat('VICTORIES', '$victories', color: const Color(0xFF10B981)),
              _buildStat('OVERWHELMED', '$overhelmedCount', color: const Color(0xFFEF4444)),
              _buildStat('AVG PREP', '$averagePreparation%'),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(color: Colors.white10, height: 1),
          const SizedBox(height: 16),

          // Insight Sub-Tray
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('CRITICAL WEAKNESS', style: TextStyle(fontFamily: 'Courier', fontSize: 9, color: Colors.white38)),
                    const SizedBox(height: 4),
                    Text(weakestAttribute.toUpperCase(), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFFFCA5A5))),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('RECOMMENDED PROTOCOL', style: TextStyle(fontFamily: 'Courier', fontSize: 9, color: Colors.white38)),
                    const SizedBox(height: 4),
                    Text(recommendedTraining.toUpperCase(), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF93C5FD))),
                  ],
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildStat(String label, String value, {Color color = Colors.white70}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontFamily: 'Courier', fontSize: 8, color: Colors.white24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color, fontFamily: 'Courier')),
      ],
    );
  }
}
