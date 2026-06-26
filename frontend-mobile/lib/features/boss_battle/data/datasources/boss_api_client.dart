import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/boss_battle_model.dart';

class BossApiClient {
  String get _apiBaseUrl {
    const envUrl = String.fromEnvironment('API_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }
    if (kIsWeb) {
      return 'http://localhost:3000/api';
    } else if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3000/api';
    } else {
      return 'http://localhost:3000/api';
    }
  }

  Future<List<BossBattleModel>> fetchBossBattles(String userId) async {
    final response = await http.get(
      Uri.parse('$_apiBaseUrl/boss-battles?userId=$userId'),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List battles = data['bossBattles'] ?? [];
      return battles.map((json) => BossBattleModel.fromJson(json)).toList();
    } else {
      throw Exception('Failed to fetch Boss Battles: ${response.body}');
    }
  }

  Future<BossBattleModel> createBossBattle({
    required String userId,
    required String title,
    required String description,
    required String epicManifesto,
    required int timeLimitHours,
    required int estHours,
    required int dependencies,
    required List<String> phases,
    String originSource = 'USER_DECLARATION',
  }) async {
    final response = await http.post(
      Uri.parse('$_apiBaseUrl/boss-battles'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userId': userId,
        'title': title,
        'description': description,
        'epicManifesto': epicManifesto,
        'timeLimitHours': timeLimitHours,
        'estHours': estHours,
        'dependencies': dependencies,
        'phases': phases,
        'originSource': originSource,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return BossBattleModel.fromJson(data['bossBattle']);
    } else {
      throw Exception('Failed to create Boss Battle: ${response.body}');
    }
  }

  Future<BossBattleModel> toggleBossPhase({
    required String phaseId,
    required bool isCompleted,
  }) async {
    final response = await http.post(
      Uri.parse('$_apiBaseUrl/boss-battles/complete-phase'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'phaseId': phaseId,
        'isCompleted': isCompleted,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return BossBattleModel.fromJson(data['bossBattle']);
    } else {
      throw Exception('Failed to toggle Boss Phase: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> resolveBossBattle({
    required String bossBattleId,
    required String outcome,
    required String lessonsLearned,
    required List<String> unlockedSkills,
  }) async {
    final response = await http.post(
      Uri.parse('$_apiBaseUrl/boss-battles/resolve'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'bossBattleId': bossBattleId,
        'outcome': outcome,
        'lessonsLearned': lessonsLearned,
        'unlockedSkills': unlockedSkills,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return {
        'bossBattle': BossBattleModel.fromJson(data['bossBattle']),
        'xpGained': data['xpGained'] ?? 0,
      };
    } else {
      throw Exception('Failed to resolve Boss Battle: ${response.body}');
    }
  }

  Future<Map<String, dynamic>?> checkEmergentBoss(String userId) async {
    final response = await http.get(
      Uri.parse('$_apiBaseUrl/boss-battles/emerge?userId=$userId'),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final eval = data['evaluation'];
      if (eval != null && eval['trigger_emergence'] == true) {
        return eval;
      }
      return null;
    } else {
      throw Exception('Failed to run Emergent Boss check: ${response.body}');
    }
  }
}
