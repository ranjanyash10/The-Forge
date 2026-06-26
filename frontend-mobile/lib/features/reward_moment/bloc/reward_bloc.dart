import 'package:flutter_bloc/flutter_bloc.dart';
  import 'reward_event.dart';
  import 'reward_state.dart';

  class RewardBloc extends Bloc<RewardEvent, RewardState> {
    RewardBloc() : super(RewardInitial()) {
      on<StartRewardMoment>((event, emit) {
        emit(RewardCinematicIntro(
          questTitle: event.questTitle,
          alert: event.alert,
          xpReward: event.xpReward,
          difficulty: event.difficulty,
          rewardData: event.rewardData,
        ));
      });

      on<NextRewardPhase>((event, emit) {
        final current = state;
        if (current is RewardCinematicIntro) {
          emit(RewardHarvestPhase(
            questTitle: current.questTitle,
            alert: current.alert,
            xpReward: current.xpReward,
            difficulty: current.difficulty,
            rewardData: current.rewardData,
          ));
        } else if (current is RewardHarvestPhase) {
          // Determine attributes surged based on quest properties
          List<Map<String, dynamic>> attributes = [];
          
          final lowerTitle = current.questTitle.toLowerCase();
          if (lowerTitle.contains('run') || lowerTitle.contains('workout') || lowerTitle.contains('lift') || lowerTitle.contains('physique')) {
            attributes = [
              {'name': 'Strength', 'level': 11, 'progress': 65.0, 'trend': 'IMPROVING'},
              {'name': 'Endurance', 'level': 10, 'progress': 40.0, 'trend': 'IMPROVING'},
              {'name': 'Agility', 'level': 10, 'progress': 25.0, 'trend': 'STABLE'},
              {'name': 'Vitality', 'level': 12, 'progress': 80.0, 'trend': 'IMPROVING'},
            ];
          } else if (lowerTitle.contains('code') || lowerTitle.contains('program') || lowerTitle.contains('schema') || lowerTitle.contains('api')) {
            attributes = [
              {'name': 'Focus', 'level': 14, 'progress': 75.0, 'trend': 'IMPROVING'},
              {'name': 'Knowledge', 'level': 12, 'progress': 30.0, 'trend': 'IMPROVING'},
              {'name': 'Creativity', 'level': 11, 'progress': 50.0, 'trend': 'STABLE'},
            ];
          } else {
            attributes = [
              {'name': 'Resilience', 'level': 12, 'progress': 80.0, 'trend': 'IMPROVING'},
              {'name': 'Charisma', 'level': 10, 'progress': 40.0, 'trend': 'STABLE'},
            ];
          }

          emit(RewardAttributeSurgePhase(
            questTitle: current.questTitle,
            alert: current.alert,
            xpReward: current.xpReward,
            difficulty: current.difficulty,
            rewardData: current.rewardData,
            surgingAttributes: attributes,
          ));
        } else if (current is RewardAttributeSurgePhase) {
          emit(RewardCompleted());
        }
      });

      on<SkipRewardMoment>((event, emit) {
        emit(RewardCompleted());
      });
    }
  }
