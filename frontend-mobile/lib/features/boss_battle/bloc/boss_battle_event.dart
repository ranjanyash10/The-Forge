import 'package:meta/meta.dart';

@immutable
abstract class BossBattleEvent {}

class LoadBossBattles extends BossBattleEvent {
  final String userId;
  LoadBossBattles(this.userId);
}

class CheckEmergentBoss extends BossBattleEvent {
  final String userId;
  CheckEmergentBoss(this.userId);
}

class CreateBossBattle extends BossBattleEvent {
  final String userId;
  final String title;
  final String description;
  final String epicManifesto;
  final int timeLimitHours;
  final int estHours;
  final int dependencies;
  final List<String> phases;
  final String originSource;

  CreateBossBattle({
    required this.userId,
    required this.title,
    required this.description,
    required this.epicManifesto,
    required this.timeLimitHours,
    required this.estHours,
    required this.dependencies,
    required this.phases,
    required this.originSource,
  });
}

class ToggleBossPhase extends BossBattleEvent {
  final String phaseId;
  final bool isCompleted;
  ToggleBossPhase({required this.phaseId, required this.isCompleted});
}

class ResolveBossBattle extends BossBattleEvent {
  final String bossBattleId;
  final String outcome;
  final String lessonsLearned;
  final List<String> unlockedSkills;

  ResolveBossBattle({
    required this.bossBattleId,
    required this.outcome,
    required this.lessonsLearned,
    required this.unlockedSkills,
  });
}
