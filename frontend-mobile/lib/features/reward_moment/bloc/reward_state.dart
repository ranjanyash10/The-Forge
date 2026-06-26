import 'package:meta/meta.dart';

@immutable
abstract class RewardState {}

class RewardInitial extends RewardState {}

class RewardCinematicIntro extends RewardState {
  final String questTitle;
  final String alert;
  final int xpReward;
  final String difficulty;
  final Map<String, dynamic> rewardData;

  RewardCinematicIntro({
    required this.questTitle,
    required this.alert,
    required this.xpReward,
    required this.difficulty,
    required this.rewardData,
  });
}

class RewardHarvestPhase extends RewardState {
  final String questTitle;
  final String alert;
  final int xpReward;
  final String difficulty;
  final Map<String, dynamic> rewardData;

  RewardHarvestPhase({
    required this.questTitle,
    required this.alert,
    required this.xpReward,
    required this.difficulty,
    required this.rewardData,
  });
}

class RewardAttributeSurgePhase extends RewardState {
  final String questTitle;
  final String alert;
  final int xpReward;
  final String difficulty;
  final Map<String, dynamic> rewardData;
  final List<Map<String, dynamic>> surgingAttributes;

  RewardAttributeSurgePhase({
    required this.questTitle,
    required this.alert,
    required this.xpReward,
    required this.difficulty,
    required this.rewardData,
    required this.surgingAttributes,
  });
}

class RewardCompleted extends RewardState {}
