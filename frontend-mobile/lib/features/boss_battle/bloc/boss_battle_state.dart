import 'package:meta/meta.dart';
import '../data/models/boss_battle_model.dart';

@immutable
abstract class BossBattleState {}

class BossBattleInitial extends BossBattleState {}

class BossBattlesLoading extends BossBattleState {}

class BossBattlesLoaded extends BossBattleState {
  final List<BossBattleModel> battles;
  final BossBattleModel? activeBattle;

  BossBattlesLoaded({
    required this.battles,
    this.activeBattle,
  });
}

class BossBattleCreationSuccess extends BossBattleState {
  final BossBattleModel battle;
  BossBattleCreationSuccess(this.battle);
}

class EmergentBossAlert extends BossBattleState {
  final Map<String, dynamic> emergentPayload;
  EmergentBossAlert(this.emergentPayload);
}

class BossBattleError extends BossBattleState {
  final String message;
  BossBattleError(this.message);
}
