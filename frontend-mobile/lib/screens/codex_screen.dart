import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/game_state.dart';

class CodexScreen extends StatefulWidget {
  const CodexScreen({super.key});

  @override
  State<CodexScreen> createState() => _CodexScreenState();
}

class _CodexScreenState extends State<CodexScreen> {
  bool equipping = false;

  final List<Map<String, String>> allTitles = [
    { 'id': 'Wanderer', 'name': 'Wanderer', 'desc': 'A blank slate. Seeking purpose.' },
    { 'id': 'Pathfinder', 'name': 'Pathfinder', 'desc': 'One who steps off the beaten track. Unlock 3 skills.' },
    { 'id': 'Ascendant', 'name': 'Ascendant', 'desc': 'Rising above. Gained by reaching level 10.' },
    { 'id': 'Monarch', 'name': 'Monarch', 'desc': 'Ruler of one\'s domain. Reserved for Rank A masteries.' },
    { 'id': 'Sovereign', 'name': 'Sovereign', 'desc': 'Complete autonomy. Mastery in mind, wealth, influence.' },
    { 'id': 'Eternal', 'name': 'Eternal', 'desc': 'A legend carved in stone. Gained at level 50.' },
  ];

  final List<Map<String, dynamic>> allAchievements = [
    { 'id': 'First Workout', 'name': 'First Workout', 'desc': 'Took the first physical step.', 'icon': Icons.fitness_center },
    { 'id': 'First 100 XP', 'name': 'First 100 XP', 'desc': 'Accumulate 100 global XP.', 'icon': Icons.stars },
    { 'id': 'Level 10 Reached', 'name': 'Level 10 Reached', 'desc': 'Hit double digits global.', 'icon': Icons.bolt },
    { 'id': '100 Deep Work Hours', 'name': '100 Deep Work Hours', 'desc': 'Focused concentration.', 'icon': Icons.psychology },
    { 'id': 'First Client', 'name': 'First Client', 'desc': 'Secured financial trade.', 'icon': Icons.handshake },
    { 'id': '10kg Lost', 'name': '10kg Lost', 'desc': 'Shed physical excess.', 'icon': Icons.favorite },
    { 'id': '100 Consecutive Days Logged', 'name': '100 Consecutive Days Logged', 'desc': '100 logs in Chronicle.', 'icon': Icons.calendar_month },
  ];

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<GameState>(context);

    if (state.character == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF02040A),
        body: Center(
          child: Text('Initialize Character sheet first.', style: TextStyle(color: Colors.grey, fontSize: 11)),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF02040A),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Profile header Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF060814).withOpacity(0.8),
                  border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.15)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFFA855F7), width: 2),
                        borderRadius: BorderRadius.circular(8),
                        image: DecorationImage(
                          image: NetworkImage(state.character!.avatarUrl),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(state.character!.name, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(state.character!.charClass, style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                        const SizedBox(width: 8),
                        Container(width: 4, height: 4, decoration: const BoxDecoration(color: Colors.grey, shape: BoxShape.circle)),
                        const SizedBox(width: 8),
                        Text('RANK ${state.character!.currentRank}', style: const TextStyle(color: Color(0xFFA855F7), fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '"${state.character!.originStory}"',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.grey, fontSize: 11, fontStyle: FontStyle.italic, height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 2. Titles list
              const Row(
                children: [
                  Icon(Icons.shield, color: Color(0xFF06B6D4), size: 16),
                  SizedBox(width: 6),
                  Text('FORGE TITLES', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                ],
              ),
              const SizedBox(height: 8),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: allTitles.length,
                itemBuilder: (context, index) {
                  final t = allTitles[index];
                  final isUnlocked = state.unlockedTitleIds.contains(t['id']);
                  final isEquipped = state.currentTitle == t['id'];

                  return Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isEquipped ? const Color(0xFF06B6D4).withOpacity(0.04) : Colors.black.withOpacity(0.4),
                      border: Border.all(
                        color: isEquipped ? const Color(0xFF06B6D4).withOpacity(0.2) : isUnlocked ? const Color(0xFF3B0764).withOpacity(0.2) : Colors.transparent,
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Opacity(
                      opacity: isUnlocked ? 1.0 : 0.4,
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(t['name']!, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                                    if (isEquipped) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                        decoration: BoxDecoration(color: const Color(0xFF06B6D4).withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                                        child: const Text('EQUIPPED', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 7, fontWeight: FontWeight.bold)),
                                      )
                                    ]
                                  ],
                                ),
                                Text(t['desc']!, style: const TextStyle(color: Colors.grey, fontSize: 10)),
                              ],
                            ),
                          ),
                          if (isUnlocked && !isEquipped)
                            ElevatedButton(
                              onPressed: equipping ? null : () async {
                                setState(() => equipping = true);
                                await state.equipTitle(t['id']!);
                                setState(() => equipping = false);
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0F172A),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                              ),
                              child: const Text('EQUIP', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
                            )
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),

              // 3. Achievements list
              const Row(
                children: [
                  Icon(Icons.emoji_events, color: Color(0xFFA855F7), size: 16),
                  SizedBox(width: 6),
                  Text('LEGENDARY ACHIEVEMENTS', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                ],
              ),
              const SizedBox(height: 8),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: allAchievements.length,
                itemBuilder: (context, index) {
                  final ach = allAchievements[index];
                  final isUnlocked = state.unlockedAchievementIds.contains(ach['id']);

                  return Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isUnlocked ? const Color(0xFFA855F7).withOpacity(0.04) : Colors.black.withOpacity(0.1),
                      border: Border.all(
                        color: isUnlocked ? const Color(0xFFA855F7).withOpacity(0.15) : Colors.transparent,
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Opacity(
                      opacity: isUnlocked ? 1.0 : 0.3,
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: isUnlocked ? const Color(0xFF06B6D4).withOpacity(0.1) : Colors.grey.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(ach['icon'] as IconData, color: isUnlocked ? const Color(0xFF06B6D4) : Colors.grey, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(ach['name']!, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                                Text(ach['desc']!, style: const TextStyle(color: Colors.grey, fontSize: 10)),
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),

              // 4. Snapshots Timeline
              const Row(
                children: [
                  Icon(Icons.history, color: Colors.amber, size: 16),
                  SizedBox(width: 6),
                  Text('CHARACTER SNAPSHOTS', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                ],
              ),
              const SizedBox(height: 8),
              if (state.snapshots.isEmpty)
                Container(
                  padding: const EdgeInsets.all(16),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(color: Colors.black.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                  child: const Text('No milestones captured yet. release weekly chapter first.', style: TextStyle(color: Colors.grey, fontSize: 10)),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: state.snapshots.length,
                  itemBuilder: (context, index) {
                    final snap = state.snapshots[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF05070E),
                        border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.15)),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                snap.createdAt.split('T')[0],
                                style: const TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                decoration: BoxDecoration(color: Colors.purple.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                                child: Text('LVL ${snap.level} RANK ${snap.rank}', style: const TextStyle(color: Color(0xFFA855F7), fontSize: 8, fontWeight: FontWeight.bold)),
                              )
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text('Title: ${snap.title}', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text(
                            snap.narrative,
                            style: const TextStyle(color: Colors.grey, fontSize: 10, height: 1.4),
                          )
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
