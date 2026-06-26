import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../services/game_state.dart';

class ChronicleScreen extends StatefulWidget {
  const ChronicleScreen({super.key});

  @override
  State<ChronicleScreen> createState() => _ChronicleScreenState();
}

class _ChronicleScreenState extends State<ChronicleScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Daily log form states
  final TextEditingController _notesController = TextEditingController();
  final TextEditingController _weightController = TextEditingController();
  String _mood = 'FOCUSED';
  double _energy = 7.0;

  bool _submitting = false;
  Map<String, dynamic>? _dailyResult;

  // Archive compile state
  bool _compiling = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _notesController.dispose();
    _weightController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  // Handle daily log submission
  void _submitChronicle(GameState state) async {
    final text = _notesController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _submitting = true;
      _dailyResult = null;
    });

    final res = await state.submitDailyLog(text, _mood, _energy.toInt(), _weightController.text.trim());

    setState(() {
      _submitting = false;
      if (res != null) {
        _dailyResult = res;
        _notesController.clear();
        _weightController.clear();
        _mood = 'FOCUSED';
        _energy = 7.0;
      }
    });
  }

  // Compile weekly narrative
  void _compileWeekly(GameState state) async {
    setState(() => _compiling = true);
    final success = await state.compileWeeklyChapter();
    setState(() => _compiling = false);
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Weekly chapter compiled successfully. Check timeline below.'),
          backgroundColor: Color(0xFF06B6D4),
        )
      );
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
      appBar: AppBar(
        backgroundColor: const Color(0xFF070913),
        elevation: 0,
        toolbarHeight: 0, // hide top bar, only show tabs
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF06B6D4),
          unselectedLabelColor: Colors.grey,
          indicatorColor: const Color(0xFF06B6D4),
          tabs: const [
            Tab(text: 'DAILY LOG'),
            Tab(text: 'CHAPTER ARCHIVE'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Daily Log Form & Evaluation Result
          _buildDailyLogTab(state),
          // Tab 2: Compile Chapter & Chapters Archive
          _buildArchiveTab(state),
        ],
      ),
    );
  }

  Widget _buildDailyLogTab(GameState state) {
    if (_dailyResult != null) {
      final txList = _dailyResult!['xpTransactions'] ?? [];
      final quests = _dailyResult!['spawnedQuests'] ?? [];
      
      return SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFF3B0764)))),
              child: const Column(
                children: [
                  Text(
                    'CHRONICLE EVALUATION SUCCESSFUL',
                    style: TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
                  ),
                  SizedBox(height: 6),
                  Text('DAILY REWARD MOMENT', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // AI Narration
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0B0C16).withOpacity(0.8),
                border: Border.all(color: const Color(0xFF3B0764).withOpacity(0.4)),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('SYSTEM NARRATION', style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1)),
                  const SizedBox(height: 6),
                  Text(
                    '"${_dailyResult!['analysis']}"',
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontStyle: FontStyle.italic, height: 1.4),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // XP distributed
            const Text('EXPERIENCE DISTRIBUTED', style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1)),
            const SizedBox(height: 6),
            ...txList.map<Widget>((tx) => Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFA855F7).withOpacity(0.04),
                border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.1)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${tx['skillName']} Node', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                        Text(tx['reason'] ?? '', style: const TextStyle(color: Colors.grey, fontSize: 10)),
                      ],
                    ),
                  ),
                  Text('+${tx['xpGained']} XP', style: const TextStyle(color: Color(0xFFA855F7), fontSize: 13, fontWeight: FontWeight.w900, fontFamily: 'monospace')),
                ],
              ),
            )).toList(),
            const SizedBox(height: 16),

            // Quests spawned
            const Text('NEW QUESTS LOGGED FOR TOMORROW', style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1)),
            const SizedBox(height: 6),
            ...quests.map<Widget>((q) => Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.4),
                border: Border.all(color: const Color(0xFF3B0764).withOpacity(0.2)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.explore, color: Color(0xFFA855F7), size: 16),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(q['title'] ?? '', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                        Text(q['description'] ?? '', style: const TextStyle(color: Colors.grey, fontSize: 10)),
                      ],
                    ),
                  ),
                  Text('+${q['xp_reward']} XP', style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.w900, fontFamily: 'monospace')),
                ],
              ),
            )).toList(),
            const SizedBox(height: 16),

            // Highlights
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF06B6D4).withOpacity(0.05),
                      border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.1)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('APEX ATTRIBUTE', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 8, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(_dailyResult!['strengths'] ?? '', style: const TextStyle(color: Colors.white, fontSize: 9)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFA855F7).withOpacity(0.05),
                      border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.1)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('SYSTEM THREAT', style: TextStyle(color: Color(0xFFA855F7), fontSize: 8, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(_dailyResult!['weaknesses'] ?? '', style: const TextStyle(color: Colors.white, fontSize: 9)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: () {
                setState(() => _dailyResult = null);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF06B6D4),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('ACKNOWLEDGE PROGRESSION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Icon(Icons.history_edu, color: Color(0xFFD97706), size: 18),
              const SizedBox(width: 8),
              const Text('THE CHRONICLER PORTAL', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            "Inscribe today's journey through ambient conversational reflection. No sliders, no checkboxes.",
            style: TextStyle(color: Colors.grey, fontSize: 10),
          ),
          const SizedBox(height: 24),

          // Portal Gate Card
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
            decoration: BoxDecoration(
              color: const Color(0xFF090B15).withOpacity(0.4),
              border: Border.all(color: const Color(0xFFD97706).withOpacity(0.3)),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Column(
              children: [
                const Icon(
                  Icons.vpn_key_outlined,
                  color: Color(0xFFD97706),
                  size: 32,
                ),
                const SizedBox(height: 16),
                const Text(
                  'AMBIENT PORTAL ACTIVE',
                  style: TextStyle(
                    fontFamily: 'Courier',
                    color: Color(0xFFD97706),
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'The System evaluates your narratives dynamically, adjusting state metrics and evaluating active quests/phases automatically.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.6),
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 28),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD97706),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: const RoundedRectangleBorder(
                        borderRadius: BorderRadius.zero,
                      ),
                    ),
                    onPressed: () {
                      Navigator.pushNamed(context, '/open_chronicle');
                    },
                    child: const Text(
                      'OPEN REFLECTION PORTAL',
                      style: TextStyle(
                        fontFamily: 'Courier',
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          _buildCalendarView(state),
        ],
      ),
    );
  }

  Widget _buildCalendarView(GameState state) {
    final today = DateTime.now();
    final year = today.year;
    final month = today.month;
    final firstDay = DateTime(year, month, 1);
    final startingDayOfWeek = firstDay.weekday % 7;
    final totalDays = DateTime(year, month + 1, 0).day;

    final List<Widget> dayWidgets = [];

    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (var day in weekdays) {
      dayWidgets.add(
        Center(
          child: Text(
            day,
            style: const TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold),
          ),
        ),
      );
    }

    for (var i = 0; i < startingDayOfWeek; i++) {
      dayWidgets.add(const SizedBox());
    }

    for (var d = 1; d <= totalDays; d++) {
      final isToday = today.day == d;
      
      bool isLogged = state.dailyLogs.any((log) {
        try {
          final logDate = DateTime.parse(log['created_at']);
          return logDate.day == d && logDate.month == month && logDate.year == year;
        } catch (e) {
          return false;
        }
      });

      BoxDecoration decoration;
      Color textColor = Colors.grey;

      if (isLogged) {
        decoration = BoxDecoration(
          color: const Color(0xFF06B6D4).withOpacity(0.2),
          border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.6)),
          borderRadius: BorderRadius.circular(6),
        );
        textColor = const Color(0xFF06B6D4);
      } else if (isToday) {
        decoration = BoxDecoration(
          color: Colors.transparent,
          border: Border.all(color: const Color(0xFFA855F7)),
          borderRadius: BorderRadius.circular(6),
        );
        textColor = const Color(0xFFA855F7);
      } else {
        decoration = BoxDecoration(
          color: Colors.black12,
          borderRadius: BorderRadius.circular(6),
        );
      }

      dayWidgets.add(
        Container(
          alignment: Alignment.center,
          decoration: decoration,
          child: Text(
            '$d',
            style: TextStyle(color: textColor, fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF090B15).withOpacity(0.6),
        border: Border.all(color: const Color(0xFF3B0764).withOpacity(0.4)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('DAILY CHRONICLE CALENDAR', style: TextStyle(color: Colors.grey, fontSize: 9, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 7,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 4,
            crossAxisSpacing: 4,
            children: dayWidgets,
          ),
        ],
      ),
    );
  }

  Widget _buildArchiveTab(GameState state) {
    // We should display compile weekly chapters and timeline
    return FutureBuilder<http.Response>(
      future: http.get(Uri.parse('$apiBaseUrl/weekly-chapter?userId=${state.userId}')),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: Color(0xFF06B6D4)));
        }

        List<dynamic> chapters = [];
        if (snapshot.hasData && snapshot.data!.statusCode == 200) {
          chapters = json.decode(snapshot.data!.body)['chapters'] ?? [];
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Compile header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF090B15).withOpacity(0.6),
                  border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.15)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    const Text('ARCHIVES COMPILATION', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1)),
                    const SizedBox(height: 6),
                    const Text(
                      'Compile the last 7 days of daily entries and actions into a unified weekly chronicle chapter.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey, fontSize: 10),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: _compiling ? null : () => _compileWeekly(state),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF06B6D4),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text(_compiling ? 'COMPILING ERA...' : 'FORGE WEEKLY CHAPTER', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Chapters Timeline
              const Row(
                children: [
                  Icon(Icons.history, color: Color(0xFFA855F7), size: 16),
                  SizedBox(width: 6),
                  const Text('CHRONICLE OF THE FORGE', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                ],
              ),
              const SizedBox(height: 8),

              if (chapters.isEmpty)
                Container(
                  padding: const EdgeInsets.all(24),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(color: Colors.black.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                  child: const Text('No weekly chapters forged. Compile your first chapter using the console above.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 10)),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: chapters.length,
                  itemBuilder: (context, index) {
                    final c = chapters[index];
                    final title = c['title'] ?? 'Chapter';
                    final narrative = c['narrative'] ?? '';
                    final created = c['created_at']?.split('T')?[0] ?? '';

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF05070E),
                        border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.15)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'CHAPTER ${c['chapter_number']}',
                                style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1),
                              ),
                              Text(
                                created,
                                style: const TextStyle(color: Colors.grey, fontSize: 8, fontFamily: 'monospace'),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            title.split(': ').length > 1 ? title.split(': ')[1] : title,
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          const Divider(color: Colors.purple, height: 16),
                          Text(
                            narrative,
                            style: const TextStyle(color: Colors.grey, fontSize: 10, fontStyle: FontStyle.italic, height: 1.4),
                          ),
                        ],
                      ),
                    );
                  },
                )
            ],
          ),
        );
      },
    );
  }
}
