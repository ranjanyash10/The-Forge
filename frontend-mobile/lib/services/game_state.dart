import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// Dynamic API Base URL Resolver
String get apiBaseUrl {
  const envUrl = String.fromEnvironment('API_URL');
  if (envUrl.isNotEmpty) {
    return envUrl;
  }
  if (kIsWeb) {
    return 'http://localhost:3000/api';
  } else if (defaultTargetPlatform == TargetPlatform.android) {
    // Android emulator routing to host machine localhost
    return 'http://10.0.2.2:3000/api';
  } else {
    // iOS simulator / Desktop routing
    return 'http://localhost:3000/api';
  }
}

class Skill {
  final String id;
  final String name;
  final String description;
  final String category;
  final String rank;
  final int xp;
  final int level;

  Skill({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.rank,
    required this.xp,
    required this.level,
  });

  factory Skill.fromJson(Map<String, dynamic> json) {
    return Skill(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      rank: json['rank'] ?? 'E',
      xp: json['xp'] ?? 0,
      level: json['level'] ?? 1,
    );
  }
}

class Quest {
  final String id;
  final String title;
  final String description;
  final String difficulty;
  final int xpReward;
  final String status;
  final String questType;

  Quest({
    required this.id,
    required this.title,
    required this.description,
    required this.difficulty,
    required this.xpReward,
    required this.status,
    required this.questType,
  });

  factory Quest.fromJson(Map<String, dynamic> json) {
    return Quest(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      difficulty: json['difficulty'] ?? 'E',
      xpReward: json['xp_reward'] ?? 0,
      status: json['status'] ?? 'ACTIVE',
      questType: json['quest_type'] ?? 'SIDE',
    );
  }
}

class Character {
  final String id;
  final String name;
  final String charClass;
  final String originStory;
  final String avatarUrl;
  final String currentRank;
  final String weight;
  final String height;
  final String fitnessGoals;
  final int momentum;

  final int executionBase;
  final int executionLvl;
  final int executionXp;
  final int adaptabilityBase;
  final int adaptabilityLvl;
  final int adaptabilityXp;
  final int resilienceBase;
  final int resilienceLvl;
  final int resilienceXp;
  final int selfAwarenessBase;
  final int selfAwarenessLvl;
  final int selfAwarenessXp;
  final int egoResistanceBase;
  final int egoResistanceLvl;
  final int egoResistanceXp;

  final int strengthLvl;
  final int strengthXp;
  final int willpowerLvl;
  final int willpowerXp;
  final int mobilityLvl;
  final int mobilityXp;
  final int wisdomLvl;
  final int wisdomXp;

  Character({
    required this.id,
    required this.name,
    required this.charClass,
    required this.originStory,
    required this.avatarUrl,
    required this.currentRank,
    required this.weight,
    required this.height,
    required this.fitnessGoals,
    required this.momentum,
    required this.executionBase,
    required this.executionLvl,
    required this.executionXp,
    required this.adaptabilityBase,
    required this.adaptabilityLvl,
    required this.adaptabilityXp,
    required this.resilienceBase,
    required this.resilienceLvl,
    required this.resilienceXp,
    required this.selfAwarenessBase,
    required this.selfAwarenessLvl,
    required this.selfAwarenessXp,
    required this.egoResistanceBase,
    required this.egoResistanceLvl,
    required this.egoResistanceXp,
    required this.strengthLvl,
    required this.strengthXp,
    required this.willpowerLvl,
    required this.willpowerXp,
    required this.mobilityLvl,
    required this.mobilityXp,
    required this.wisdomLvl,
    required this.wisdomXp,
  });

  factory Character.fromJson(Map<String, dynamic> json) {
    final rawUrl = json['avatar_url'] ?? '';
    return Character(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      charClass: json['class'] ?? '',
      originStory: json['origin_story'] ?? '',
      avatarUrl: rawUrl.toString().replaceAll('/svg', '/png'),
      currentRank: json['current_rank'] ?? 'E',
      weight: json['weight'] ?? '',
      height: json['height'] ?? '',
      fitnessGoals: json['fitness_goals'] ?? '',
      momentum: json['momentum'] ?? 50,
      executionBase: json['execution_base'] ?? 5,
      executionLvl: json['execution_lvl'] ?? 5,
      executionXp: json['execution_xp'] ?? 0,
      adaptabilityBase: json['adaptability_base'] ?? 5,
      adaptabilityLvl: json['adaptability_lvl'] ?? 5,
      adaptabilityXp: json['adaptability_xp'] ?? 0,
      resilienceBase: json['resilience_base'] ?? 5,
      resilienceLvl: json['resilience_lvl'] ?? 5,
      resilienceXp: json['resilience_xp'] ?? 0,
      selfAwarenessBase: json['self_awareness_base'] ?? 5,
      selfAwarenessLvl: json['self_awareness_lvl'] ?? 5,
      selfAwarenessXp: json['self_awareness_xp'] ?? 0,
      egoResistanceBase: json['ego_resistance_base'] ?? 5,
      egoResistanceLvl: json['ego_resistance_lvl'] ?? 5,
      egoResistanceXp: json['ego_resistance_xp'] ?? 0,
      strengthLvl: json['strength_lvl'] ?? 1,
      strengthXp: json['strength_xp'] ?? 0,
      willpowerLvl: json['willpower_lvl'] ?? 1,
      willpowerXp: json['willpower_xp'] ?? 0,
      mobilityLvl: json['mobility_lvl'] ?? 1,
      mobilityXp: json['mobility_xp'] ?? 0,
      wisdomLvl: json['wisdom_lvl'] ?? 1,
      wisdomXp: json['wisdom_xp'] ?? 0,
    );
  }
}

class Snapshot {
  final String id;
  final String avatarUrl;
  final String rank;
  final int level;
  final String title;
  final String narrative;
  final String createdAt;

  Snapshot({
    required this.id,
    required this.avatarUrl,
    required this.rank,
    required this.level,
    required this.title,
    required this.narrative,
    required this.createdAt,
  });

  factory Snapshot.fromJson(Map<String, dynamic> json) {
    final rawUrl = json['avatar_url'] ?? '';
    return Snapshot(
      id: json['id'] ?? '',
      avatarUrl: rawUrl.toString().replaceAll('/svg', '/png'),
      rank: json['rank'] ?? 'E',
      level: json['level'] ?? 1,
      title: json['title'] ?? 'Wanderer',
      narrative: json['narrative'] ?? '',
      createdAt: json['created_at'] ?? '',
    );
  }
}

class Title {
  final String id;
  final String name;
  final String description;

  Title({required this.id, required this.name, required this.description});
}

class Achievement {
  final String id;
  final String name;
  final String description;
  final String badge;

  Achievement({required this.id, required this.name, required this.description, required this.badge});
}

class GameState extends ChangeNotifier {
  String userId = '';
  bool loading = false;
  String? error;

  // Character status properties
  String username = 'Candidate';
  int globalLevel = 1;
  int globalXp = 0;
  String currentTitle = 'Wanderer';
  Character? character;
  
  List<Skill> skills = [];
  List<Quest> quests = [];
  List<Snapshot> snapshots = [];
  List<dynamic> dailyLogs = [];
  Set<String> unlockedTitleIds = {};
  Set<String> unlockedAchievementIds = {};

  bool _initialized = false;
  bool get initialized => _initialized;

  GameState() {
    loadSession();
  }

  Future<void> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    userId = prefs.getString('forge_userId') ?? '';
    username = prefs.getString('forge_username') ?? 'Candidate';
    _initialized = true;
    if (userId.isNotEmpty) {
      await fetchStatus();
    } else {
      notifyListeners();
    }
  }

  // Login
  Future<bool> login(String email, String password) async {
    loading = true;
    error = null;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );

      final data = json.decode(response.body);
      if (response.statusCode == 200 && data['error'] == null) {
        final prefs = await SharedPreferences.getInstance();
        userId = data['userId'] ?? '';
        username = data['username'] ?? 'Candidate';
        await prefs.setString('forge_userId', userId);
        await prefs.setString('forge_username', username);
        await prefs.setString('forge_email', data['email'] ?? '');
        
        await fetchStatus();
        return true;
      } else {
        error = data['error'] ?? 'Authentication failed';
      }
    } catch (e) {
      error = e.toString();
    } finally {
      loading = false;
      notifyListeners();
    }
    return false;
  }

  // Register
  Future<bool> register(String email, String usernameInput, String password) async {
    loading = true;
    error = null;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'username': usernameInput,
          'password': password,
        }),
      );

      final data = json.decode(response.body);
      if (response.statusCode == 200 && data['error'] == null) {
        final prefs = await SharedPreferences.getInstance();
        userId = data['userId'] ?? '';
        username = data['username'] ?? usernameInput;
        await prefs.setString('forge_userId', userId);
        await prefs.setString('forge_username', username);
        await prefs.setString('forge_email', data['email'] ?? '');
        
        await fetchStatus();
        return true;
      } else {
        error = data['error'] ?? 'Registration failed';
      }
    } catch (e) {
      error = e.toString();
    } finally {
      loading = false;
      notifyListeners();
    }
    return false;
  }

  // Logout
  Future<void> logout() async {
    loading = true;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('forge_userId');
    await prefs.remove('forge_username');
    await prefs.remove('forge_email');

    userId = '';
    username = 'Candidate';
    globalLevel = 1;
    globalXp = 0;
    currentTitle = 'Wanderer';
    character = null;
    skills = [];
    quests = [];
    snapshots = [];
    dailyLogs = [];
    unlockedTitleIds = {};
    unlockedAchievementIds = {};
    
    loading = false;
    notifyListeners();
  }

  // Quick Demo Login
  Future<void> loginAsDemo() async {
    loading = true;
    error = null;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    userId = 'demo-user-id';
    username = 'ElysianMonarch';
    await prefs.setString('forge_userId', userId);
    await prefs.setString('forge_username', username);
    await prefs.setString('forge_email', 'demo@theforge.org');
    
    await fetchStatus();
  }

  // Fetch all user character state details
  Future<void> fetchStatus() async {
    if (userId.isEmpty) return;
    loading = true;
    error = null;
    notifyListeners();

    try {
      final response = await http.get(Uri.parse('$apiBaseUrl/character/status?userId=$userId'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final user = data['user'];
        
        username = user['username'] ?? 'ElysianMonarch';
        globalLevel = user['global_level'] ?? 1;
        globalXp = user['global_xp'] ?? 0;
        currentTitle = user['current_title'] ?? 'Wanderer';
        
        if (user['character'] != null) {
          character = Character.fromJson(user['character']);
          if (user['character']['snapshots'] != null) {
            snapshots = (user['character']['snapshots'] as List)
                .map((s) => Snapshot.fromJson(s))
                .toList();
          }
        } else {
          character = null;
          snapshots = [];
        }

        skills = (user['skills'] as List).map((s) => Skill.fromJson(s)).toList();
        quests = (user['quests'] as List).map((q) => Quest.fromJson(q)).toList();
        
        if (user['dailyLogs'] != null) {
          dailyLogs = user['dailyLogs'] as List;
        } else {
          dailyLogs = [];
        }
        
        unlockedTitleIds = (user['titles'] as List)
            .map<String>((t) => t['title_id']?.toString() ?? '')
            .toSet();
            
        unlockedAchievementIds = (user['achievements'] as List)
            .map<String>((a) => a['achievement_id']?.toString() ?? '')
            .toSet();
      } else {
        error = 'Failed to load system status: ${response.statusCode}';
      }
    } catch (e) {
      error = e.toString();
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  // Compile Alter Ego character sheet
  Future<Map<String, dynamic>?> createCharacter({
    required String name,
    required String aspirations,
    required String strengths,
    required String weaknesses,
    required String weight,
    required String height,
    required String fitnessGoals,
    required int executionBase,
    required int adaptabilityBase,
    required int resilienceBase,
    required int selfAwarenessBase,
    required int egoResistanceBase,
  }) async {
    loading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/character/create'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': userId,
          'name': name,
          'aspirations': aspirations,
          'strengths': strengths,
          'weaknesses': weaknesses,
          'weight': weight,
          'height': height,
          'fitnessGoals': fitnessGoals,
          'executionBase': executionBase,
          'adaptabilityBase': adaptabilityBase,
          'resilienceBase': resilienceBase,
          'selfAwarenessBase': selfAwarenessBase,
          'egoResistanceBase': egoResistanceBase,
        }),
      ).timeout(const Duration(seconds: 60));

      print('Character Create Response: ${response.statusCode}');
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('Character created successfully, fetching status...');
        await fetchStatus();
        return data['aiGeneration'];
      } else {
        print('Character creation failed: ${response.body}');
        error = 'Failed to forge character: ${response.statusCode}';
      }
    } catch (e) {
      print('Character Creation Exception: $e');
      error = e.toString();
    } finally {
      loading = false;
      notifyListeners();
    }
    return null;
  }

  // Create manual Quest
  Future<bool> createQuest(String title, String description, String type, String difficulty) async {
    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/quests'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': userId,
          'title': title,
          'description': description,
          'quest_type': type,
          'difficulty': difficulty,
        }),
      );
      if (response.statusCode == 200) {
        await fetchStatus();
        return true;
      }
    } catch (e) {
      print('Quest Creation Error: $e');
    }
    return false;
  }

  // Complete Quest
  Future<Map<String, dynamic>?> completeQuest(String questId, String skillName) async {
    try {
      // Find skill mapping ID if exists
      String? skillId;
      final match = skills.firstWhere(
        (s) => s.name.toLowerCase() == skillName.toLowerCase(),
        orElse: () => Skill(id: '', name: '', description: '', category: '', rank: 'E', xp: 0, level: 1),
      );
      if (match.id.isNotEmpty) {
        skillId = match.id;
      }

      final response = await http.post(
        Uri.parse('$apiBaseUrl/quests/complete'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': userId,
          'questId': questId,
          'skillId': skillId,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await fetchStatus();
        return data;
      }
    } catch (e) {
      print('Quest Completion Error: $e');
    }
    return null;
  }

  // Discover Skill Intent via AI evaluation
  Future<Map<String, dynamic>?> discoverSkill(String requestQuery) async {
    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/skills/discover'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': userId,
          'skillRequest': requestQuery,
        }),
      );
      if (response.statusCode == 200) {
        return json.decode(response.body)['evaluation'];
      }
    } catch (e) {
      print('Skill Discovery Error: $e');
    }
    return null;
  }

  // Accept Discovered Skill
  Future<bool> acceptSkill(Map<String, dynamic> skillData) async {
    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/skills/discover'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': userId,
          'accept': true,
          'name': skillData['name'],
          'category': skillData['category'],
          'difficulty': skillData['difficulty'],
          'description': skillData['description'],
        }),
      );
      if (response.statusCode == 200) {
        await fetchStatus();
        return true;
      }
    } catch (e) {
      print('Skill Acceptance Error: $e');
    }
    return false;
  }

  // Equip title
  Future<bool> equipTitle(String titleId) async {
    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/character/equip-title'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'userId': userId, 'titleId': titleId}),
      );
      if (response.statusCode == 200) {
        await fetchStatus();
        return true;
      }
    } catch (e) {
      print('Equip Title Error: $e');
    }
    return false;
  }

  // Submit Daily Chronicle
  Future<Map<String, dynamic>?> submitDailyLog(String notes, String mood, int energy, String weight) async {
    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/daily-logs'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': userId,
          'notes': notes,
          'mood': mood,
          'energy': energy,
          'weight': weight,
        }),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await fetchStatus();
        return data;
      }
    } catch (e) {
      print('Daily Chronicle Error: $e');
    }
    return null;
  }

  // Delete Quest
  Future<bool> deleteQuest(String questId) async {
    try {
      final response = await http.delete(
        Uri.parse('$apiBaseUrl/quests?questId=$questId'),
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode == 200) {
        await fetchStatus();
        return true;
      }
    } catch (e) {
      print('Delete Quest Error: $e');
    }
    return false;
  }

  // Compile Weekly chapter releases
  Future<bool> compileWeeklyChapter() async {
    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/weekly-chapter'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'userId': userId}),
      );
      if (response.statusCode == 200) {
        await fetchStatus();
        return true;
      }
    } catch (e) {
      print('Weekly chapter Compilation Error: $e');
    }
    return false;
  }
}
