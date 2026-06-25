import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/game_state.dart';

class SkillsScreen extends StatefulWidget {
  const SkillsScreen({super.key});

  @override
  State<SkillsScreen> createState() => _SkillsScreenState();
}

class _SkillsScreenState extends State<SkillsScreen> {
  final TextEditingController _proposalController = TextEditingController();
  bool discovering = false;
  bool accepting = false;
  Map<String, dynamic>? discoveryResult;

  @override
  void dispose() {
    _proposalController.dispose();
    super.dispose();
  }

  IconData _getCategoryIcon(String cat) {
    switch (cat.toUpperCase()) {
      case 'BODY': return Icons.favorite;
      case 'WEALTH': return Icons.attach_money;
      case 'MIND': return Icons.psychology;
      case 'INFLUENCE': return Icons.record_voice_over;
      default: return Icons.bolt;
    }
  }

  Color _getCategoryColor(String cat) {
    switch (cat.toUpperCase()) {
      case 'BODY': return Colors.redAccent;
      case 'WEALTH': return Colors.greenAccent;
      case 'MIND': return Colors.purpleAccent;
      case 'INFLUENCE': return Colors.blueAccent;
      default: return Colors.cyanAccent;
    }
  }

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
              // 1. Skill Discovery Terminal
              const Row(
                children: [
                  Icon(Icons.terminal, color: Color(0xFF06B6D4), size: 16),
                  SizedBox(width: 6),
                  Text('SKILL DISCOVERY TERMINAL', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                ],
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF090B15).withOpacity(0.6),
                  border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.2)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _proposalController,
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontFamily: 'monospace'),
                            decoration: const InputDecoration(
                              hintText: 'Suggest skill intent... (e.g. Boxing, SaaS)',
                              hintStyle: TextStyle(color: Colors.grey, fontSize: 11),
                              enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF3B0764))),
                              focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF06B6D4))),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        ElevatedButton(
                          onPressed: (discovering || accepting) ? null : () async {
                            final text = _proposalController.text.trim();
                            if (text.isNotEmpty) {
                              setState(() {
                                discovering = true;
                                discoveryResult = null;
                              });
                              final res = await state.discoverSkill(text);
                              setState(() {
                                discovering = false;
                                discoveryResult = res;
                              });
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF06B6D4),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                          ),
                          child: const Text('DISCOVER', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                        )
                      ],
                    ),
                    
                    if (discovering) ...[
                      const SizedBox(height: 16),
                      const Center(
                        child: Column(
                          children: [
                            SizedBox(height: 10, width: 10, child: CircularProgressIndicator(color: Color(0xFF06B6D4), strokeWidth: 2)),
                            SizedBox(height: 8),
                            Text('THE SYSTEM EVALUATING PATHWAY STRANDS...', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 8, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                          ],
                        ),
                      )
                    ],

                    if (discoveryResult != null) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF06B6D4).withOpacity(0.02),
                          border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.2)),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  discoveryResult!['name'] ?? '',
                                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: _getCategoryColor(discoveryResult!['category'] ?? '').withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    (discoveryResult!['category'] ?? '').toString().toUpperCase(),
                                    style: TextStyle(color: _getCategoryColor(discoveryResult!['category'] ?? ''), fontSize: 7, fontWeight: FontWeight.bold),
                                  ),
                                )
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Text('DIFFICULTY ${discoveryResult!['difficulty']}', style: const TextStyle(color: Colors.purpleAccent, fontSize: 9, fontWeight: FontWeight.bold)),
                                const SizedBox(width: 8),
                                const Text('|', style: TextStyle(color: Colors.grey, fontSize: 9)),
                                const SizedBox(width: 8),
                                const Text('STARTING RANK E', style: TextStyle(color: Colors.amber, fontSize: 9, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              discoveryResult!['description'] ?? '',
                              style: const TextStyle(color: Colors.grey, fontSize: 10, height: 1.4),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              icon: const Icon(Icons.check, size: 12),
                              label: Text(accepting ? 'SYNCING...' : 'ACCEPT PATH'),
                              onPressed: accepting ? null : () async {
                                setState(() => accepting = true);
                                final success = await state.acceptSkill(discoveryResult!);
                                setState(() {
                                  accepting = false;
                                  if (success) {
                                    discoveryResult = null;
                                    _proposalController.clear();
                                  }
                                });
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF06B6D4),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton.icon(
                            icon: const Icon(Icons.close, size: 12),
                            label: const Text('DECLINE'),
                            onPressed: accepting ? null : () {
                              setState(() {
                                discoveryResult = null;
                                _proposalController.clear();
                              });
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0F172A),
                              foregroundColor: Colors.grey,
                              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                            ),
                          ),
                        ],
                      )
                    ]
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 2. Tracks Node List
              const Row(
                children: [
                  Icon(Icons.account_tree, color: Color(0xFFA855F7), size: 16),
                  SizedBox(width: 6),
                  Text('TRACKED NODE ARCHITECTURES', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                ],
              ),
              const SizedBox(height: 8),
              if (state.skills.isEmpty)
                Container(
                  padding: const EdgeInsets.all(16),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(color: Colors.black.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                  child: const Text('No active skills tracked.', style: TextStyle(color: Colors.grey, fontSize: 10)),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: state.skills.length,
                  itemBuilder: (context, index) {
                    final s = state.skills[index];
                    final skillXpNeeded = s.level * 100;
                    final skillXpPct = (s.xp / skillXpNeeded).clamp(0.0, 1.0);

                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF090C18).withOpacity(0.5),
                        border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.15)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: _getCategoryColor(s.category).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  children: [
                                    Icon(_getCategoryIcon(s.category), color: _getCategoryColor(s.category), size: 10),
                                    const SizedBox(width: 4),
                                    Text(s.category.toUpperCase(), style: TextStyle(color: _getCategoryColor(s.category), fontSize: 7, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  const Text('RANK', style: TextStyle(color: Colors.grey, fontSize: 6, fontWeight: FontWeight.bold)),
                                  Text(s.rank, style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 16, fontWeight: FontWeight.w900, fontFamily: 'monospace')),
                                ],
                              )
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(s.name, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                          Text(s.description, style: const TextStyle(color: Colors.grey, fontSize: 10)),
                          const SizedBox(height: 12),
                          
                          // XP progress indicators
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Node Level: ${s.level}', style: const TextStyle(color: Colors.grey, fontSize: 9)),
                              Text('${s.xp} / $skillXpNeeded XP', style: const TextStyle(color: Colors.grey, fontSize: 9, fontFamily: 'monospace')),
                            ],
                          ),
                          const SizedBox(height: 4),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: SizedBox(
                              height: 6,
                              child: LinearProgressIndicator(
                                value: skillXpPct,
                                backgroundColor: Colors.black,
                                color: const Color(0xFFA855F7),
                              ),
                            ),
                          )
                        ],
                      ),
                    );
                  },
                )
            ],
          ),
        ),
      ),
    );
  }
}
