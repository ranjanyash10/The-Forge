import 'dart:convert';

class BossPhaseModel {
  final String id;
  final String bossBattleId;
  final String title;
  final bool isCompleted;
  final DateTime? completedAt;

  BossPhaseModel({
    required this.id,
    required this.bossBattleId,
    required this.title,
    required this.isCompleted,
    this.completedAt,
  });

  factory BossPhaseModel.fromJson(Map<String, dynamic> json) {
    return BossPhaseModel(
      id: json['id'] ?? '',
      bossBattleId: json['boss_battle_id'] ?? json['bossBattleId'] ?? '',
      title: json['title'] ?? '',
      isCompleted: json['isCompleted'] ?? json['is_completed'] ?? false,
      completedAt: json['completedAt'] != null || json['completed_at'] != null
          ? DateTime.tryParse(json['completedAt'] ?? json['completed_at'])
          : null,
    );
  }
}

class ArchiveChapterModel {
  final String id;
  final String bossBattleId;
  final String chapterTitle;
  final int durationDays;
  final String lessonsLearned;
  final DateTime createdAt;

  ArchiveChapterModel({
    required this.id,
    required this.bossBattleId,
    required this.chapterTitle,
    required this.durationDays,
    required this.lessonsLearned,
    required this.createdAt,
  });

  factory ArchiveChapterModel.fromJson(Map<String, dynamic> json) {
    return ArchiveChapterModel(
      id: json['id'] ?? '',
      bossBattleId: json['boss_battle_id'] ?? json['bossBattleId'] ?? '',
      chapterTitle: json['chapter_title'] ?? json['chapterTitle'] ?? '',
      durationDays: json['duration_days'] ?? json['durationDays'] ?? 1,
      lessonsLearned: json['lessons_learned'] ?? json['lessonsLearned'] ?? '',
      createdAt: DateTime.tryParse(json['created_at'] ?? json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}

class BossBattleModel {
  final String id;
  final String userId;
  final String title;
  final String description;
  final String epicManifesto;
  final int difficultyScore;
  final String calculatedRank;
  final int preparationScore;
  final int victoryProbability;
  final List<Map<String, dynamic>> predictionReasoning;
  final String status;
  final String? outcome;
  final String originSource;
  final int attemptsCount;
  final int timeLimitHours;
  final List<String> unlockedSkills;
  final String? consequenceNarrative;
  final List<BossPhaseModel> phases;
  final ArchiveChapterModel? archiveChapter;
  final DateTime createdAt;

  BossBattleModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.description,
    required this.epicManifesto,
    required this.difficultyScore,
    required this.calculatedRank,
    required this.preparationScore,
    required this.victoryProbability,
    required this.predictionReasoning,
    required this.status,
    this.outcome,
    required this.originSource,
    required this.attemptsCount,
    required this.timeLimitHours,
    required this.unlockedSkills,
    this.consequenceNarrative,
    required this.phases,
    this.archiveChapter,
    required this.createdAt,
  });

  factory BossBattleModel.fromJson(Map<String, dynamic> json) {
    // Helper to decode reasoning JSON string if SQLite serialized
    List<Map<String, dynamic>> parsedReasoning = [];
    final reasoningRaw = json['predictionReasoning'] ?? json['prediction_reasoning'];
    if (reasoningRaw is String) {
      try {
        final decoded = jsonDecode(reasoningRaw);
        if (decoded is List) {
          parsedReasoning = decoded.map((e) => Map<String, dynamic>.from(e)).toList();
        }
      } catch (_) {}
    } else if (reasoningRaw is List) {
      parsedReasoning = reasoningRaw.map((e) => Map<String, dynamic>.from(e)).toList();
    }

    // Helper to decode unlocked skills JSON string if SQLite serialized
    List<String> parsedSkills = [];
    final skillsRaw = json['unlockedSkills'] ?? json['unlocked_skills'];
    if (skillsRaw is String) {
      try {
        final decoded = jsonDecode(skillsRaw);
        if (decoded is List) {
          parsedSkills = decoded.map((e) => e.toString()).toList();
        }
      } catch (_) {}
    } else if (skillsRaw is List) {
      parsedSkills = skillsRaw.map((e) => e.toString()).toList();
    }

    return BossBattleModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? json['user_id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      epicManifesto: json['epicManifesto'] ?? json['epic_manifesto'] ?? '',
      difficultyScore: json['difficultyScore'] ?? json['difficulty_score'] ?? 0,
      calculatedRank: json['calculatedRank'] ?? json['calculated_rank'] ?? 'D',
      preparationScore: json['preparationScore'] ?? json['preparation_score'] ?? 0,
      victoryProbability: json['victoryProbability'] ?? json['victory_probability'] ?? 50,
      predictionReasoning: parsedReasoning,
      status: json['status'] ?? 'IDENTIFIED',
      outcome: json['outcome'],
      originSource: json['originSource'] ?? json['origin_source'] ?? 'USER_DECLARATION',
      attemptsCount: json['attemptsCount'] ?? json['attempts_count'] ?? 1,
      timeLimitHours: json['timeLimitHours'] ?? json['time_limit_hours'] ?? 168,
      unlockedSkills: parsedSkills,
      consequenceNarrative: json['consequenceNarrative'] ?? json['consequence_narrative'],
      phases: (json['phases'] as List? ?? [])
          .map((e) => BossPhaseModel.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
      archiveChapter: json['archiveChapter'] != null || json['archive_chapter'] != null
          ? ArchiveChapterModel.fromJson(Map<String, dynamic>.from(json['archiveChapter'] ?? json['archive_chapter']))
          : null,
      createdAt: DateTime.tryParse(json['createdAt'] ?? json['created_at'] ?? '') ?? DateTime.now(),
    );
  }
}
