import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../boss_battle/bloc/boss_battle_bloc.dart';
import '../../../boss_battle/bloc/boss_battle_event.dart';
import '../../../../core/theme/colors.dart';

class BossPredictionScreen extends StatelessWidget {
  final String? title;
  final String? rank;
  final int? preparationPercentage;
  final int? victoryProbability;
  final List<Map<String, dynamic>>? tacticalInsights;
  final String? systemRecommendation;

  const BossPredictionScreen({
    Key? key,
    this.title,
    this.rank,
    this.preparationPercentage,
    this.victoryProbability,
    this.tacticalInsights,
    this.systemRecommendation,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Read route arguments if instantiated via Router
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;

    final displayTitle = title ?? args?['title'] ?? 'Epic Encounter';
    final displayRank = rank ?? args?['rank'] ?? 'A';
    final displayPrep = preparationPercentage ?? args?['preparationPercentage'] ?? 50;
    final displayVictory = victoryProbability ?? args?['victoryProbability'] ?? 50;
    final displayInsights = tacticalInsights ?? (args?['tacticalInsights'] as List?)?.map((e) => Map<String, dynamic>.from(e)).toList() ?? [];
    final displayRecommendation = systemRecommendation ?? args?['systemRecommendation'] ?? 'The System has analyzed your indicators.';
    final List<String> phases = (args?['phases'] as List?)?.map((e) => e.toString()).toList() ?? [];

    return Scaffold(
      backgroundColor: const Color(0xFF020205), // Zero-point void black
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Segment
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'THREAT ANALYSIS COMPLETE',
                    style: TextStyle(
                      fontFamily: 'Courier',
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2.0,
                      color: ForgeColors.threatRed, // Threat Red
                      fontSize: 12,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    color: ForgeColors.indigoPanel,
                    child: Text(
                      'ESTIMATED RANK: $displayRank',
                      style: const TextStyle(
                        fontFamily: 'Courier',
                        fontWeight: FontWeight.bold,
                        color: ForgeColors.indigoText,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                displayTitle.toUpperCase(),
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                  color: Color(0xFFFAFAFA),
                ),
              ),
              const SizedBox(height: 32),

              // Metrics Cluster Row
              Row(
                children: [
                  Expanded(
                    child: _buildMetricBlock(
                      label: 'PREPARATION STATUS',
                      value: '$displayPrep%',
                      subtitle: 'PHASES & ATTRIBUTES LEVEL',
                      color: ForgeColors.amber,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildMetricBlock(
                      label: 'VICTORY PROBABILITY',
                      value: '$displayVictory%',
                      subtitle: 'ALGORITHMIC ESTIMATION',
                      color: displayVictory >= 70 ? ForgeColors.emerald : ForgeColors.threatRed,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Tactical Insight Vector Panel
              const Text(
                'TACTICAL INFERENCE VECTORS',
                style: TextStyle(
                  fontFamily: 'Courier',
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Colors.white38,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView.builder(
                  itemCount: displayInsights.length,
                  itemBuilder: (context, index) {
                    final insight = displayInsights[index];
                    final isPositive = insight['isPositive'] as bool? ?? insight['is_positive'] as bool? ?? true;
                    return Container(
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0A0A10),
                        border: Border.all(color: Colors.white10),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isPositive ? Icons.check_circle_outline : Icons.error_outline,
                            color: isPositive ? ForgeColors.emerald : ForgeColors.amber,
                            size: 18,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              insight['text'] ?? '',
                              style: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

              // System Recommendation Box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0x1A3B82F6),
                  border: Border.all(color: const Color(0x4D3B82F6)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'SYSTEM RECOMMENDATION',
                      style: TextStyle(
                        fontFamily: 'Courier',
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                        color: Color(0xFF93C5FD),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      displayRecommendation,
                      style: const TextStyle(color: Color(0xFFBFDBFE), fontSize: 13, height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Confirmation Controls Cluster
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.white24),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: const Text('POSTPONE', style: TextStyle(color: Colors.white70, fontFamily: 'Courier')),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ForgeColors.threatRed,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () {
                        context.read<BossBattleBloc>().add(
                          CreateBossBattle(
                            userId: 'demo-user-id',
                            title: displayTitle,
                            description: displayTitle,
                            epicManifesto: displayRecommendation,
                            timeLimitHours: 168,
                            estHours: args?['estHours'] ?? 10,
                            dependencies: args?['dependencies'] ?? 0,
                            phases: phases,
                            originSource: 'USER_DECLARATION',
                          ),
                        );
                        Navigator.pop(context, true);
                      },
                      child: const Text('ACCEPT ENCOUNTER', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontFamily: 'Courier')),
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricBlock({required String label, required String value, required String subtitle, required Color color}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF09090E),
        border: Border.all(color: Colors.white10),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontFamily: 'Courier', fontSize: 9, color: Colors.white38, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: color, letterSpacing: -1)),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(fontSize: 8, color: Colors.white24, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
