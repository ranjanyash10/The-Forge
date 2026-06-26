import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/reward_bloc.dart';
import '../bloc/reward_event.dart';
import '../bloc/reward_state.dart';
import 'widgets/harvest_quest_card.dart';
import 'widgets/attribute_surge_meter.dart';

class RewardMomentScreen extends StatelessWidget {
  const RewardMomentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => RewardBloc(),
      child: const RewardMomentView(),
    );
  }
}

class RewardMomentView extends StatefulWidget {
  const RewardMomentView({super.key});

  @override
  State<RewardMomentView> createState() => _RewardMomentViewState();
}

class _RewardMomentViewState extends State<RewardMomentView> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
      if (args != null) {
        context.read<RewardBloc>().add(StartRewardMoment(
          questTitle: args['questTitle'] ?? 'Epic Quest Completion',
          alert: args['alert'] ?? 'Quest Complete',
          xpReward: args['xpReward'] ?? 50,
          difficulty: args['difficulty'] ?? 'SIDE',
          rewardData: args['rewardData'] ?? {},
        ));
      } else {
        // Fallback for direct launches
        context.read<RewardBloc>().add(StartRewardMoment(
          questTitle: 'Focus Sprint Synchronized',
          alert: 'Anchor Milestone Gained',
          xpReward: 50,
          difficulty: 'MAIN',
          rewardData: {},
        ));
      }
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<RewardBloc, RewardState>(
      listener: (context, state) {
        if (state is RewardCompleted) {
          Navigator.pop(context, true);
        }
      },
      builder: (context, state) {
        if (state is RewardInitial) {
          return const Scaffold(
            backgroundColor: Color(0xFF02040A),
            body: Center(
              child: CircularProgressIndicator(color: Color(0xFFA855F7)),
            ),
          );
        }

        return Scaffold(
          backgroundColor: const Color(0xFF02040A),
          body: Stack(
            children: [
              // Cinematic Background Painter
              Positioned.fill(
                child: CustomPaint(
                  painter: CinematicBackgroundPainter(_animationController),
                ),
              ),

              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 30),
                      // Top GM Branding Header
                      Center(
                        child: Column(
                          children: [
                            Text(
                              'THE SYSTEM'.toUpperCase(),
                              style: const TextStyle(
                                fontFamily: 'Courier',
                                color: Color(0xFFA855F7),
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 4.0,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              height: 1,
                              width: 60,
                              color: const Color(0xFFA855F7).withOpacity(0.4),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),

                      // Middle Dynamic Step Render
                      Expanded(
                        flex: 8,
                        child: Center(
                          child: SingleChildScrollView(
                            child: _buildPhaseContent(context, state),
                          ),
                        ),
                      ),

                      const Spacer(),
                      // Bottom Navigation Actions
                      if (state is! RewardCompleted)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 20),
                          child: ElevatedButton(
                            onPressed: () {
                              context.read<RewardBloc>().add(NextRewardPhase());
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFA855F7),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              elevation: 8,
                              shadowColor: const Color(0xFFA855F7).withOpacity(0.4),
                            ),
                            child: Text(
                              _getButtonLabel(state),
                              style: const TextStyle(
                                fontFamily: 'Courier',
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.5,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _getButtonLabel(RewardState state) {
    if (state is RewardCinematicIntro) {
      return 'HARVEST REWARDS';
    } else if (state is RewardHarvestPhase) {
      return 'SURGE ATTRIBUTES';
    } else if (state is RewardAttributeSurgePhase) {
      return 'CONFIRM MATRIX';
    }
    return 'NEXT PHASE';
  }

  Widget _buildPhaseContent(BuildContext context, RewardState state) {
    if (state is RewardCinematicIntro) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.sync,
            color: Color(0xFF06B6D4),
            size: 48,
          ),
          const SizedBox(height: 20),
          const Text(
            'SYNCHRONIZING REWARD MATRIX',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'Courier',
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              letterSpacing: 2.0,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'THE SYSTEM IS CONSOLIDATING DIRECTIVES...',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 10,
              letterSpacing: 0.5,
            ),
          ),
        ],
      );
    }

    if (state is RewardHarvestPhase) {
      QuestDifficulty qType = QuestDifficulty.SIDE;
      if (state.difficulty == 'MAIN') qType = QuestDifficulty.MAIN;
      if (state.difficulty == 'BOSS') qType = QuestDifficulty.BOSS;
      if (state.difficulty == 'OPPORTUNITY') qType = QuestDifficulty.OPPORTUNITY;

      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Center(
            child: Text(
              '✦ HARVEST PHASE COMPLETE ✦',
              style: TextStyle(
                color: Color(0xFF06B6D4),
                fontFamily: 'Courier',
                fontWeight: FontWeight.bold,
                fontSize: 12,
                letterSpacing: 2,
              ),
            ),
          ),
          const SizedBox(height: 16),
          HarvestQuestCard(
            title: state.questTitle,
            alert: state.alert,
            xpReward: state.xpReward,
            difficulty: qType,
          ),
        ],
      );
    }

    if (state is RewardAttributeSurgePhase) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Center(
            child: Text(
              '✦ ATTRIBUTE SURGE ACTIVATED ✦',
              style: TextStyle(
                color: Color(0xFFF59E0B),
                fontFamily: 'Courier',
                fontWeight: FontWeight.bold,
                fontSize: 12,
                letterSpacing: 2,
              ),
            ),
          ),
          const SizedBox(height: 12),
          ...state.surgingAttributes.map((attr) {
            AttributeTrend trendVal = AttributeTrend.STABLE;
            if (attr['trend'] == 'IMPROVING') trendVal = AttributeTrend.IMPROVING;
            if (attr['trend'] == 'DECLINING') trendVal = AttributeTrend.DECLINING;

            return AttributeSurgeMeter(
              name: attr['name'],
              level: attr['level'],
              progressPercentage: attr['progress'],
              trend: trendVal,
            );
          }),
        ],
      );
    }

    return const SizedBox();
  }
}

class CinematicBackgroundPainter extends CustomPainter {
  final Animation<double> animation;
  CinematicBackgroundPainter(this.animation) : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFA855F7).withOpacity(0.02)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = sqrt(size.width * size.width + size.height * size.height) / 2;

    // Pulsating rings
    for (int i = 1; i <= 5; i++) {
      final phase = (animation.value + (i / 5.0)) % 1.0;
      final radius = maxRadius * phase;
      paint.color = const Color(0xFFA855F7).withOpacity((1.0 - phase) * 0.15);
      canvas.drawCircle(center, radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CinematicBackgroundPainter oldDelegate) => true;
}
