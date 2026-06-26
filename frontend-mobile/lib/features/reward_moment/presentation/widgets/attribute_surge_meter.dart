import 'package:flutter/material.dart';

enum AttributeTrend { IMPROVING, STABLE, DECLINING }

class AttributeSurgeMeter extends StatelessWidget {
  final String name;
  final int level;
  final double progressPercentage; // Value between 0.0 and 100.0
  final AttributeTrend trend;

  const AttributeSurgeMeter({
    Key? key,
    required this.name,
    required this.level,
    required this.progressPercentage,
    required this.trend,
  }) : super(key: key);

  String _getTrendSymbol() {
    switch (trend) {
      case AttributeTrend.IMPROVING: return '↑';
      case AttributeTrend.STABLE: return '→';
      case AttributeTrend.DECLINING: return '↓';
    }
  }

  Color _getTrendColor() {
    switch (trend) {
      case AttributeTrend.IMPROVING: return const Color(0xFF34D399);
      case AttributeTrend.STABLE: return const Color(0xFF94A3B8);
      case AttributeTrend.DECLINING: return const Color(0xFFF43F5E);
    }
  }

  @override
  Widget build(BuildContext context) {
    final trendColor = _getTrendColor();
    final trendSymbol = _getTrendSymbol();

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: const Color(0xFF020617), // Deep Obsidian Slate-950
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: Colors.white54, width: 0.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                children: [
                  Text(
                    name.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 14.0,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: Color(0xFFE2E8F0),
                    ),
                  ),
                  const SizedBox(width: 8.0),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 2.0),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(4.0),
                    ),
                    child: Text(
                      'LVL $level',
                      style: const TextStyle(
                        fontFamily: 'Courier',
                        fontSize: 10.0,
                        color: Color(0xFF94A3B8),
                      ),
                    ),
                  ),
                ],
              ),
              Text(
                '$trendSymbol ${trend.name}',
                style: TextStyle(
                  fontFamily: 'Courier',
                  fontSize: 12.0,
                  fontWeight: FontWeight.bold,
                  color: trendColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12.0),
          // Progress Meter Track
          Container(
            width: double.infinity,
            height: 10.0,
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(5.0),
              border: Border.all(color: Colors.black, width: 1.0),
            ),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final fillWidth = constraints.maxWidth * (progressPercentage / 100.0);
                return Align(
                  alignment: Alignment.centerLeft,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 800),
                    curve: Curves.easeOutCubic,
                    width: fillWidth,
                    height: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(5.0),
                      gradient: const LinearGradient(
                        colors: [
                          Color(0xFFD97706), // Amber-600
                          Color(0xFFF59E0B), // Amber-500
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
