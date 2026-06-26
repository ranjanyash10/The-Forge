import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../boss_battle/bloc/boss_battle_bloc.dart';
import '../../../boss_battle/bloc/boss_battle_event.dart';
import '../../../../core/theme/colors.dart';

class BossDiscoveryOverlay extends StatelessWidget {
  final Map<String, dynamic> payload;

  const BossDiscoveryOverlay({
    Key? key,
    required this.payload,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final title = payload['title'] ?? 'Emergent Construct Detected';
    final manifesto = payload['discovery_manifesto'] ?? 'The System has scanned your chronicled notes and discovered friction nodes.';
    final rank = payload['calculatedRank'] ?? 'S';
    final difficultyScore = payload['difficultyScore'] ?? 80;
    final List phases = payload['phases_injected'] ?? [];

    return Scaffold(
      backgroundColor: const Color(0xFF020205), // Void void black
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 20),
              
              // Top GM warning header
              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: ForgeColors.threatBg,
                    border: Border.all(color: ForgeColors.threatRed, width: 1.5),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: ForgeColors.threatRed, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        'CRITICAL CONSTRUCT DETECTED'.toUpperCase(),
                        style: const TextStyle(
                          fontFamily: 'Courier',
                          color: ForgeColors.threatRed,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2.0,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              const Spacer(),
              
              // Threat Title
              Text(
                title.toUpperCase(),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 8),
              
              // Rank indicator
              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: ForgeColors.indigoPanel,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'THREAT CLASS: $rank (SCORE: $difficultyScore)',
                    style: const TextStyle(
                      fontFamily: 'Courier',
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: ForgeColors.indigoText,
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // GM System Prompt Manifesto text box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F0B13),
                  border: Border.all(color: ForgeColors.purpleBorder.withOpacity(0.3)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    const Text(
                      'SYSTEM DIRECTIVE TRANSMISSION',
                      style: TextStyle(
                        fontFamily: 'Courier',
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: ForgeColors.purple,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      manifesto,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 13,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Phases injected checklist
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'INJECTED PHASES MATRIX',
                  style: TextStyle(
                    fontFamily: 'Courier',
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.white30,
                    letterSpacing: 1.0,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              
              Expanded(
                flex: 4,
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: phases.length,
                  itemBuilder: (context, index) {
                    final pTitle = phases[index]['title'] ?? '';
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '▸ ',
                            style: TextStyle(color: ForgeColors.threatRed, fontSize: 13),
                          ),
                          Expanded(
                            child: Text(
                              pTitle,
                              style: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              
              const Spacer(),
              
              // Actions buttons
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
                      child: const Text(
                        'DISMISS DIRECTIVE',
                        style: TextStyle(
                          color: Colors.white70,
                          fontFamily: 'Courier',
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
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
                        // Accept Boss: call BLoC to create it
                        context.read<BossBattleBloc>().add(
                          CreateBossBattle(
                            userId: 'demo-user-id',
                            title: title,
                            description: manifesto,
                            epicManifesto: manifesto,
                            timeLimitHours: 168,
                            estHours: 8,
                            dependencies: 1,
                            phases: phases.map((p) => p['title'].toString()).toList(),
                            originSource: 'SYSTEM_EMERGENT',
                          ),
                        );
                        Navigator.pop(context, true);
                      },
                      child: const Text(
                        'CONFRONT CONSTRUCT',
                        style: TextStyle(
                          color: Colors.white,
                          fontFamily: 'Courier',
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
