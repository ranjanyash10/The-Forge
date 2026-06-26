import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../boss_battle/bloc/boss_battle_bloc.dart';
import '../../../boss_battle/bloc/boss_battle_event.dart';
import '../../../boss_battle/bloc/boss_battle_state.dart';
import '../../../boss_battle/data/models/boss_battle_model.dart';
import '../../../../core/theme/colors.dart';

class ActiveBossScreen extends StatefulWidget {
  final BossBattleModel? bossBattle;

  const ActiveBossScreen({
    Key? key,
    this.bossBattle,
  }) : super(key: key);

  @override
  State<ActiveBossScreen> createState() => _ActiveBossScreenState();
}

class _ActiveBossScreenState extends State<ActiveBossScreen> {
  final TextEditingController _lessonsController = TextEditingController();

  @override
  void dispose() {
    _lessonsController.dispose();
    super.dispose();
  }

  void _showResolveDialog(BuildContext context, BossBattleModel battle, String outcome) {
    _lessonsController.clear();
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        backgroundColor: const Color(0xFF09090E),
        title: Text(
          outcome == 'VICTORIOUS' ? '✦ RECORD CONSTRUCT VICTORY ✦' : 'CONSTRUCT RESOLUTION',
          style: const TextStyle(color: Colors.white, fontFamily: 'Courier', fontSize: 13, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              outcome == 'VICTORIOUS'
                  ? 'Identify the core key lessons consolidated by seving this directive:'
                  : 'Document why this construct overwhelmed or diverted your vectors:',
              style: const TextStyle(color: Colors.white70, fontSize: 11),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _lessonsController,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                hintText: 'Enter lessons consolidated...',
                hintStyle: const TextStyle(color: Colors.white24, fontSize: 11),
                fillColor: Colors.black26,
                filled: true,
                border: OutlineInputBorder(borderSide: const BorderSide(color: Colors.white10), borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('CANCEL', style: TextStyle(color: Colors.grey, fontSize: 11, fontFamily: 'Courier')),
          ),
          TextButton(
            onPressed: () {
              context.read<BossBattleBloc>().add(
                ResolveBossBattle(
                  bossBattleId: battle.id,
                  outcome: outcome,
                  lessonsLearned: _lessonsController.text,
                  unlockedSkills: outcome == 'VICTORIOUS' ? [battle.title] : [],
                ),
              );
              Navigator.pop(dialogCtx);
              Navigator.pop(context, true);
            },
            child: Text(
              'TRANSMIT',
              style: TextStyle(
                color: outcome == 'VICTORIOUS' ? ForgeColors.emerald : ForgeColors.threatRed,
                fontWeight: FontWeight.bold,
                fontSize: 11,
                fontFamily: 'Courier',
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Read route arguments if instantiated via Router
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    final fallbackBattle = args?['bossBattle'] as BossBattleModel?;

    return Scaffold(
      backgroundColor: const Color(0xFF020205),
      body: BlocBuilder<BossBattleBloc, BossBattleState>(
        builder: (context, state) {
          BossBattleModel? battle = widget.bossBattle ?? fallbackBattle;
          
          if (state is BossBattlesLoaded) {
            battle = state.activeBattle ?? battle;
          }

          if (battle == null) {
            return const Scaffold(
              backgroundColor: Color(0xFF020205),
              body: Center(
                child: Text('No active battle encountered.', style: TextStyle(color: Colors.grey, fontFamily: 'Courier')),
              ),
            );
          }

          final allPhases = battle.phases;
          final completedCount = allPhases.where((p) => p.isCompleted).length;
          final totalCount = allPhases.length;

          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Top GM Warning Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'ENCOUNTER CONFLICT UNDERWAY',
                        style: TextStyle(
                          fontFamily: 'Courier',
                          fontWeight: FontWeight.bold,
                          color: ForgeColors.threatRed,
                          fontSize: 12,
                          letterSpacing: 1.5,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: ForgeColors.threatBg,
                          border: Border.all(color: ForgeColors.threatRed.withOpacity(0.3)),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'RANK ${battle.calculatedRank}',
                          style: const TextStyle(
                            fontFamily: 'Courier',
                            fontWeight: FontWeight.bold,
                            color: ForgeColors.threatRed,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Title
                  Text(
                    battle.title.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Preparation progress track bar
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF09090E),
                      border: Border.all(color: Colors.white10),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('PREPARATION DEPTH', style: TextStyle(fontFamily: 'Courier', fontSize: 9, color: Colors.white38)),
                            Text('${battle.preparationScore}% (${completedCount}/${totalCount} PHASES)', style: const TextStyle(fontFamily: 'Courier', fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: battle.preparationScore / 100.0,
                            backgroundColor: Colors.black,
                            color: ForgeColors.amber,
                            minHeight: 6,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('EST. VICTORY PROBABILITY', style: TextStyle(fontFamily: 'Courier', fontSize: 9, color: Colors.white38)),
                            Text('${battle.victoryProbability}%', style: TextStyle(fontFamily: 'Courier', fontSize: 10, fontWeight: FontWeight.bold, color: battle.victoryProbability >= 70 ? ForgeColors.emerald : ForgeColors.threatRed)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Phases checklist
                  const Text(
                    'ENGAGED MATRIX PHASES',
                    style: TextStyle(
                      fontFamily: 'Courier',
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.white38,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 10),

                  Expanded(
                    child: ListView.builder(
                      itemCount: allPhases.length,
                      itemBuilder: (context, index) {
                        final phase = allPhases[index];
                        return Container(
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF05050A),
                            border: Border.all(color: Colors.white10, width: 0.5),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: CheckboxListTile(
                            value: phase.isCompleted,
                            activeColor: ForgeColors.amber,
                            checkColor: Colors.black,
                            title: Text(
                              phase.title,
                              style: TextStyle(
                                color: phase.isCompleted ? Colors.white38 : const Color(0xFFE2E8F0),
                                decoration: phase.isCompleted ? TextDecoration.lineThrough : null,
                                fontSize: 13,
                              ),
                            ),
                            onChanged: (val) {
                              context.read<BossBattleBloc>().add(
                                ToggleBossPhase(phaseId: phase.id, isCompleted: val ?? false),
                              );
                            },
                          ),
                        );
                      },
                    ),
                  ),

                  // Consequence triggers
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    child: Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Colors.white24),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: () => _showResolveDialog(context, battle!, 'WITHDRAW'),
                            child: const Text('WITHDRAW', style: TextStyle(color: Colors.white70, fontFamily: 'Courier', fontSize: 11)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Colors.redAccent),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: () => _showResolveDialog(context, battle!, 'OVERWHELMED'),
                            child: const Text('OVERWHELMED', style: TextStyle(color: Colors.redAccent, fontFamily: 'Courier', fontSize: 11)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ForgeColors.emerald,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: () => _showResolveDialog(context, battle!, 'VICTORIOUS'),
                            child: const Text('CLAIM VICTORY', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontFamily: 'Courier', fontSize: 11)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// Helper color extension
extension ColorsExtension on Colors {
  static const Color whitee2 = Color(0xFFE2E8F0);
}
