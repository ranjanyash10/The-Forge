import 'package:meta/meta.dart';

@immutable
abstract class RewardEvent {}

class StartRewardMoment extends RewardEvent {
  final String questTitle;
  final String alert;
  final int xpReward;
  final String difficulty;
  final Map<String, dynamic> rewardData;

  StartRewardMoment({
    required this.questTitle,
    required this.alert,
    required this.xpReward,
    required this.difficulty,
    required this.rewardData,
  });
}

class NextRewardPhase extends RewardEvent {}

class SkipRewardMoment extends RewardEvent {}
