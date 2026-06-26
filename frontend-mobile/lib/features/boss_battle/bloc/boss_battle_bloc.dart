import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/datasources/boss_api_client.dart';
import '../data/models/boss_battle_model.dart';
import 'boss_battle_event.dart';
import 'boss_battle_state.dart';

class BossBattleBloc extends Bloc<BossBattleEvent, BossBattleState> {
  final BossApiClient apiClient;

  BossBattleBloc({required this.apiClient}) : super(BossBattleInitial()) {
    on<LoadBossBattles>((event, emit) async {
      emit(BossBattlesLoading());
      try {
        final battles = await apiClient.fetchBossBattles(event.userId);
        BossBattleModel? activeBattle;
        for (var b in battles) {
          if (b.status == 'ACTIVE' || b.status == 'PREPARATION') {
            activeBattle = b;
            break;
          }
        }
        emit(BossBattlesLoaded(battles: battles, activeBattle: activeBattle));
      } catch (e) {
        emit(BossBattleError(e.toString()));
      }
    });

    on<CheckEmergentBoss>((event, emit) async {
      try {
        final emergent = await apiClient.checkEmergentBoss(event.userId);
        if (emergent != null) {
          emit(EmergentBossAlert(emergent));
        }
      } catch (_) {
        // Suppress background errors
      }
    });

    on<CreateBossBattle>((event, emit) async {
      emit(BossBattlesLoading());
      try {
        final battle = await apiClient.createBossBattle(
          userId: event.userId,
          title: event.title,
          description: event.description,
          epicManifesto: event.epicManifesto,
          timeLimitHours: event.timeLimitHours,
          estHours: event.estHours,
          dependencies: event.dependencies,
          phases: event.phases,
          originSource: event.originSource,
        );
        
        final battles = await apiClient.fetchBossBattles(event.userId);
        BossBattleModel? activeBattle;
        for (var b in battles) {
          if (b.status == 'ACTIVE' || b.status == 'PREPARATION') {
            activeBattle = b;
            break;
          }
        }
        emit(BossBattlesLoaded(battles: battles, activeBattle: activeBattle));
      } catch (e) {
        emit(BossBattleError(e.toString()));
      }
    });

    on<ToggleBossPhase>((event, emit) async {
      final current = state;
      if (current is BossBattlesLoaded) {
        try {
          final updated = await apiClient.toggleBossPhase(
            phaseId: phaseId(current, event.phaseId),
            isCompleted: event.isCompleted,
          );
          
          final updatedList = current.battles.map((b) => b.id == updated.id ? updated : b).toList();
          emit(BossBattlesLoaded(battles: updatedList, activeBattle: updated));
        } catch (e) {
          emit(BossBattleError(e.toString()));
        }
      }
    });

    on<ResolveBossBattle>((event, emit) async {
      final current = state;
      if (current is BossBattlesLoaded) {
        try {
          final result = await apiClient.resolveBossBattle(
            bossBattleId: event.bossBattleId,
            outcome: event.outcome,
            lessonsLearned: event.lessonsLearned,
            unlockedSkills: event.unlockedSkills,
          );
          
          final updated = result['bossBattle'] as BossBattleModel;
          final updatedList = current.battles.map((b) => b.id == updated.id ? updated : b).toList();
          emit(BossBattlesLoaded(battles: updatedList, activeBattle: null));
        } catch (e) {
          emit(BossBattleError(e.toString()));
        }
      }
    });
  }

  // Safety checker
  String phaseId(BossBattlesLoaded state, String rawId) => rawId;
}
