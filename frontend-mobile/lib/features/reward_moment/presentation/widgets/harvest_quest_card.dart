import 'package:flutter/material.dart';

enum QuestDifficulty { MAIN, SIDE, OPPORTUNITY, BOSS }

class HarvestQuestCard extends StatelessWidget {
  final String title;
  final String alert;
  final int xpReward;
  final QuestDifficulty difficulty;

  const HarvestQuestCard({
    Key? key,
    required this.title,
    required this.alert,
    required this.xpReward,
    required this.difficulty,
  }) : super(key: key);

  Map<String, dynamic> _getDifficultyTheme() {
    switch (difficulty) {
      case QuestDifficulty.MAIN:
        return {
          'borderColor': const Color(0x4DFFB300), // Amber-500/30
          'bgColor': const Color(0x1AFFB300),     // Amber-950/10
          'textColor': const Color(0xFFFFB300),   // Amber-400
        };
      case QuestDifficulty.SIDE:
        return {
          'borderColor': const Color(0xFF334155), // Slate-700
          'bgColor': const Color(0x1A64748B),     // Slate-900/10
          'textColor': const Color(0xFF94A3B8),   // Slate-400
        };
      case QuestDifficulty.OPPORTUNITY:
        return {
          'borderColor': const Color(0x4D10B981), // Emerald-500/30
          'bgColor': const Color(0x1A10B981),     // Emerald-950/10
          'textColor': const Color(0xFF34D399),   // Emerald-400
        };
      case QuestDifficulty.BOSS:
        return {
          'borderColor': const Color(0x8D8B5CF6), // Purple-500/50
          'bgColor': const Color(0x2A8B5CF6),     // Purple-950/15
          'textColor': const Color(0xFFA78BFA),   // Purple-400
        };
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = _getDifficultyTheme();

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: theme['bgColor'],
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: theme['borderColor'], width: 1.0),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  alert.toUpperCase(),
                  style: const TextStyle(
                    fontFamily: 'Courier',
                    fontSize: 10.0,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                    color: Colors.white60,
                  ),
                ),
                const SizedBox(height: 4.0),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16.0,
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.5,
                    color: Color(0xFFF1F5F9),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16.0),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
            decoration: BoxDecoration(
              color: Colors.black45,
              borderRadius: BorderRadius.circular(8.0),
              border: Border.all(color: Colors.white10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '+$xpReward XP',
                  style: const TextStyle(
                    fontFamily: 'Courier',
                    fontSize: 14.0,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF34D399),
                  ),
                ),
                Text(
                  difficulty.name,
                  style: const TextStyle(
                    fontFamily: 'Courier',
                    fontSize: 8.0,
                    letterSpacing: -0.2,
                    color: Colors.white24,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
