import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/game_state.dart';

class HubScreen extends StatefulWidget {
  const HubScreen({super.key});

  @override
  State<HubScreen> createState() => _HubScreenState();
}

class _HubScreenState extends State<HubScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Character wizard state variables
  final _wizardFormKey = GlobalKey<FormState>();
  String _wizardName = '';
  String _wizardAspirations = '';
  String _wizardStrengths = '';
  String _wizardWeaknesses = '';
  String _wizardWeight = '';
  String _wizardHeight = '';
  String _wizardFitnessGoals = '';
  double _wizardExec = 5.0;
  double _wizardAdap = 5.0;
  double _wizardResi = 5.0;
  double _wizardSelf = 5.0;
  double _wizardEgo = 5.0;
  bool _wizardSubmitting = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<GameState>(context, listen: false).fetchStatus();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // Display RPG Post-Match reward modal dialog
  void _showRewardDialog(BuildContext context, Map<String, dynamic> data) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        final achievements = data['unlockedAchievements'] ?? [];
        final titles = data['unlockedTitles'] ?? [];
        final isLevelUp = data['globalLevelUp'] ?? false;
        final newLevel = data['newGlobalLevel'] ?? 1;
        
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.symmetric(horizontal: 20),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF090B15),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.3), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF06B6D4).withOpacity(0.15),
                  blurRadius: 20,
                  spreadRadius: 2,
                )
              ]
            ),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Badge header
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF06B6D4).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.3)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.stars, color: Color(0xFF06B6D4), size: 14),
                        SizedBox(width: 6),
                        Text(
                          'QUEST COMPLETED',
                          style: TextStyle(
                            color: Color(0xFF06B6D4),
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Quest Title
                  Text(
                    data['quest']?['title'] ?? 'Task Complete',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // XP Reward text
                  const Text(
                    'PROGRESSION UNLOCKED',
                    style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                  ),
                  Text(
                    '+${data['xpGained']} XP',
                    style: const TextStyle(
                      color: Color(0xFFA855F7),
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'monospace',
                    ),
                  ),
                  if (data['updatedSkill'] != null)
                    Text(
                      'REFINING SKILL: ${data['updatedSkill']['name'].toUpperCase()}',
                      style: const TextStyle(color: Color(0xFFA855F7), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  const SizedBox(height: 16),
                  
                  // Level Up Alert Banner
                  if (isLevelUp) ...[
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.1),
                        border: Border.symmetric(horizontal: BorderSide(color: Colors.amber.withOpacity(0.3))),
                      ),
                      child: Column(
                        children: [
                          const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.bolt, color: Colors.amber, size: 16),
                              SizedBox(width: 4),
                              Text('LEVEL UP AVAILABLE', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'You have ascended to Global Level $newLevel',
                            style: const TextStyle(color: Colors.white, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Unlocked achievements list
                  if (achievements.isNotEmpty) ...[
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: Text('ACHIEVEMENTS UNLOCKED', style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1)),
                    ),
                    const SizedBox(height: 6),
                    ...achievements.map<Widget>((achName) => Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFA855F7).withOpacity(0.05),
                        border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.1)),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.emoji_events, color: const Color(0xFFA855F7).withOpacity(0.6), size: 16),
                          const SizedBox(width: 8),
                          Text(achName.toString(), style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )).toList(),
                    const SizedBox(height: 16),
                  ],

                  // Unlocked titles list
                  if (titles.isNotEmpty) ...[
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: Text('LEGENDARY TITLES FORGED', style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1)),
                    ),
                    const SizedBox(height: 6),
                    ...titles.map<Widget>((tName) => Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF06B6D4).withOpacity(0.05),
                        border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.1)),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.verified_user, color: const Color(0xFF06B6D4).withOpacity(0.6), size: 16),
                          const SizedBox(width: 8),
                          Text(tName.toString(), style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )).toList(),
                    const SizedBox(height: 16),
                  ],

                  // Confirmation Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF06B6D4),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('ACKNOWLEDGE PROGRESSION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // Display dialog form for new quest creation
  void _showAddQuestDialog(BuildContext context, GameState state) {
    String title = '';
    String desc = '';
    String type = 'SIDE';
    String difficulty = 'E';

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: const Color(0xFF090B15),
              title: const Text('FORGE NEW QUEST', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      onChanged: (v) => title = v,
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      decoration: const InputDecoration(
                        labelText: 'Quest Title',
                        labelStyle: TextStyle(color: Colors.grey, fontSize: 11),
                        enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.purple)),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      onChanged: (v) => desc = v,
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      decoration: const InputDecoration(
                        labelText: 'Quest Description',
                        labelStyle: TextStyle(color: Colors.grey, fontSize: 11),
                        enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.purple)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Quest Type dropdown
                    DropdownButtonFormField<String>(
                      value: type,
                      dropdownColor: const Color(0xFF090B15),
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      decoration: const InputDecoration(labelText: 'Quest Type', labelStyle: TextStyle(color: Colors.grey, fontSize: 11)),
                      items: const [
                        DropdownMenuItem(value: 'SIDE', child: Text('Side Quest (20 XP)')),
                        DropdownMenuItem(value: 'MAIN', child: Text('Main Quest (50 XP)')),
                        DropdownMenuItem(value: 'ELITE', child: Text('Elite Quest (100 XP)')),
                        DropdownMenuItem(value: 'BOSS', child: Text('Boss Battle (300 XP)')),
                      ],
                      onChanged: (v) => setDialogState(() => type = v!),
                    ),
                    const SizedBox(height: 10),
                    
                    // Difficulty
                    DropdownButtonFormField<String>(
                      value: difficulty,
                      dropdownColor: const Color(0xFF090B15),
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      decoration: const InputDecoration(labelText: 'Quest Difficulty', labelStyle: TextStyle(color: Colors.grey, fontSize: 11)),
                      items: const [
                        DropdownMenuItem(value: 'E', child: Text('Rank E')),
                        DropdownMenuItem(value: 'D', child: Text('Rank D')),
                        DropdownMenuItem(value: 'C', child: Text('Rank C')),
                        DropdownMenuItem(value: 'B', child: Text('Rank B')),
                        DropdownMenuItem(value: 'A', child: Text('Rank A')),
                        DropdownMenuItem(value: 'S', child: Text('Rank S')),
                      ],
                      onChanged: (v) => setDialogState(() => difficulty = v!),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('CANCEL', style: TextStyle(color: Colors.grey, fontSize: 11)),
                ),
                TextButton(
                  onPressed: () async {
                    if (title.trim().isNotEmpty) {
                      final success = await state.createQuest(title, desc, type, difficulty);
                      if (success) {
                        Navigator.pop(context);
                      }
                    }
                  },
                  child: const Text('FORGE', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  // Display Alter Ego Wizard if no character active
  Widget _buildAlterEgoWizard(GameState state) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _wizardFormKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'THE SYSTEM REQUIRES IDENTITY',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Color(0xFFA855F7),
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'You are entering a realm of progression. Compile your alter ego character sheet.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 11),
              ),
              const SizedBox(height: 24),
              
              // Inputs card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withOpacity(0.4),
                  border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.15)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    TextFormField(
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: const InputDecoration(
                        labelText: 'Character Name',
                        labelStyle: TextStyle(color: Colors.grey, fontSize: 11),
                        enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF3B0764))),
                      ),
                      validator: (v) => v!.isEmpty ? 'Name is required' : null,
                      onSaved: (v) => _wizardName = v!,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: const InputDecoration(
                        labelText: 'Aspirations',
                        labelStyle: TextStyle(color: Colors.grey, fontSize: 11),
                        enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF3B0764))),
                      ),
                      onSaved: (v) => _wizardAspirations = v ?? '',
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: const InputDecoration(
                        labelText: 'Strengths',
                        labelStyle: TextStyle(color: Colors.grey, fontSize: 11),
                        enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF3B0764))),
                      ),
                      onSaved: (v) => _wizardStrengths = v ?? '',
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: const InputDecoration(
                        labelText: 'Weaknesses',
                        labelStyle: TextStyle(color: Colors.grey, fontSize: 11),
                        enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF3B0764))),
                      ),
                      onSaved: (v) => _wizardWeaknesses = v ?? '',
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                            decoration: const InputDecoration(
                              labelText: 'Weight (e.g. 78 kg)',
                              labelStyle: TextStyle(color: Colors.grey, fontSize: 11),
                              enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF3B0764))),
                            ),
                            onSaved: (v) => _wizardWeight = v ?? '',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                            decoration: const InputDecoration(
                              labelText: 'Height (e.g. 180 cm)',
                              labelStyle: TextStyle(color: Colors.grey, fontSize: 11),
                              enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF3B0764))),
                            ),
                            onSaved: (v) => _wizardHeight = v ?? '',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: const InputDecoration(
                        labelText: 'Fitness Goals',
                        labelStyle: TextStyle(color: Colors.grey, fontSize: 11),
                        enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF3B0764))),
                      ),
                      onSaved: (v) => _wizardFitnessGoals = v ?? '',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              
              // Sliders Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withOpacity(0.4),
                  border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.15)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'INITIAL MINDSET BASELINES (1-10)',
                      style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    _buildSliderItem('Execution', _wizardExec, (v) => setState(() => _wizardExec = v)),
                    _buildSliderItem('Adaptability', _wizardAdap, (v) => setState(() => _wizardAdap = v)),
                    _buildSliderItem('Resilience', _wizardResi, (v) => setState(() => _wizardResi = v)),
                    _buildSliderItem('Self-Awareness', _wizardSelf, (v) => setState(() => _wizardSelf = v)),
                    _buildSliderItem('Ego Resistance', _wizardEgo, (v) => setState(() => _wizardEgo = v)),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              
              ElevatedButton(
                onPressed: _wizardSubmitting ? null : () async {
                  if (_wizardFormKey.currentState!.validate()) {
                    _wizardFormKey.currentState!.save();
                    setState(() => _wizardSubmitting = true);
                    try {
                      final aiGen = await state.createCharacter(
                        name: _wizardName,
                        aspirations: _wizardAspirations,
                        strengths: _wizardStrengths,
                        weaknesses: _wizardWeaknesses,
                        weight: _wizardWeight,
                        height: _wizardHeight,
                        fitnessGoals: _wizardFitnessGoals,
                        executionBase: _wizardExec.round(),
                        adaptabilityBase: _wizardAdap.round(),
                        resilienceBase: _wizardResi.round(),
                        selfAwarenessBase: _wizardSelf.round(),
                        egoResistanceBase: _wizardEgo.round(),
                      );
                      setState(() => _wizardSubmitting = false);
                      if (aiGen != null && context.mounted) {
                        showDialog(
                          context: context,
                          barrierDismissible: false,
                          builder: (context) => AlertDialog(
                            backgroundColor: const Color(0xFF090B15),
                            title: Text(aiGen['class'] ?? 'ALTER EGO COMPILED', style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                            content: Text(
                              '"${aiGen['biography']}"',
                              style: const TextStyle(color: Colors.grey, fontSize: 12, fontStyle: FontStyle.italic, height: 1.4),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: const Text('ENTER THE FORGE', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold)),
                              )
                            ],
                          ),
                        );
                      } else if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(state.error ?? 'Character forging failed. Check connection.'),
                            backgroundColor: Colors.redAccent,
                          ),
                        );
                      }
                    } catch (e) {
                      setState(() => _wizardSubmitting = false);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Error: $e'),
                            backgroundColor: Colors.redAccent,
                          ),
                        );
                      }
                    }
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF701A75),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: Text(
                  _wizardSubmitting ? 'FORGING...' : 'INITIATE SYNCHRONIZATION',
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  state.logout();
                },
                child: const Text(
                  '▸ Logout / Switch Account',
                  style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSliderItem(String label, double val, ValueChanged<double> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(color: Colors.grey, fontSize: 10)),
            Text('${val.round()}', style: const TextStyle(color: Color(0xFFA855F7), fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ),
        Slider(
          value: val,
          min: 1,
          max: 10,
          divisions: 9,
          activeColor: const Color(0xFFA855F7),
          inactiveColor: Colors.black26,
          onChanged: onChanged,
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<GameState>(context);

    if (state.loading && state.character == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF02040A),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: Color(0xFFA855F7)),
              SizedBox(height: 16),
              Text(
                'ACCESSING THE SYSTEM DATACORE...',
                style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
              ),
            ],
          ),
        ),
      );
    }

    if (state.character == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF02040A),
        body: _buildAlterEgoWizard(state),
      );
    }

    // Filter quests
    final active = state.quests.where((q) => q.status == 'ACTIVE').toList();
    final completed = state.quests.where((q) => q.status == 'COMPLETED').toList();

    // Determine total XP bar values
    final xpNeeded = state.globalLevel * 100;
    final xpPercent = (state.globalXp / xpNeeded).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: const Color(0xFF02040A),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. MMORPG Global Status HUD
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF070913),
                  border: Border(bottom: BorderSide(color: const Color(0xFF701A75).withOpacity(0.2))),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('THE FORGE', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 1)),
                            Text(
                              state.currentTitle.toUpperCase(),
                              style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.4),
                                border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.2)),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.shield, color: Color(0xFFA855F7), size: 14),
                                  const SizedBox(width: 4),
                                  Column(
                                    children: [
                                      const Text('RANK', style: TextStyle(color: Colors.grey, fontSize: 6, fontWeight: FontWeight.bold)),
                                      Text(state.character?.currentRank ?? 'E', style: const TextStyle(color: Color(0xFFA855F7), fontSize: 12, fontWeight: FontWeight.w900)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              constraints: const BoxConstraints(),
                              padding: EdgeInsets.zero,
                              icon: const Icon(Icons.logout, color: Colors.redAccent, size: 18),
                              onPressed: () {
                                showDialog(
                                  context: context,
                                  builder: (context) => AlertDialog(
                                    title: const Text('Logout'),
                                    content: const Text('Are you sure you want to exit the system?'),
                                    actions: [
                                      TextButton(
                                        child: const Text('CANCEL'),
                                        onPressed: () => Navigator.pop(context),
                                      ),
                                      TextButton(
                                        child: const Text('LOGOUT', style: TextStyle(color: Colors.redAccent)),
                                        onPressed: () {
                                          Navigator.pop(context);
                                          state.logout();
                                        },
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ],
                        )
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('GLOBAL PROGRESSION', style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold)),
                        Text(
                          'LVL ${state.globalLevel} (${state.globalXp}/$xpNeeded XP)',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: SizedBox(
                        height: 8,
                        child: LinearProgressIndicator(
                          value: xpPercent,
                          backgroundColor: Colors.black,
                          color: const Color(0xFF06B6D4),
                        ),
                      ),
                    )
                  ],
                ),
              ),

              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // 2. Character Portrait Card
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0A0D1D).withOpacity(0.4),
                        border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.1)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              border: Border.all(color: const Color(0xFFA855F7), width: 1.5),
                              borderRadius: BorderRadius.circular(4),
                              image: DecorationImage(
                                image: NetworkImage(state.character!.avatarUrl),
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(state.character!.name, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                                Text('Class: ${state.character!.charClass}', style: const TextStyle(color: Color(0xFFA855F7), fontSize: 10, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 4),
                                Text(
                                  '"${state.character!.originStory}"',
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(color: Colors.grey, fontSize: 10, fontStyle: FontStyle.italic),
                                ),
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Momentum & Physical parameters
                    Row(
                      children: [
                        // Momentum Card
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0A0D1D).withOpacity(0.4),
                              border: Border.all(color: const Color(0xFF3B0764).withOpacity(0.2)),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('MOMENTUM', style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 2),
                                      Text(
                                        state.character!.momentum >= 80 ? 'FLOW STATE' : state.character!.momentum < 20 ? 'SLUGGISH' : 'ACTIVE',
                                        style: TextStyle(
                                          color: state.character!.momentum >= 80 ? Colors.cyanAccent : state.character!.momentum < 20 ? Colors.redAccent : Colors.purpleAccent,
                                          fontSize: 9,
                                          fontWeight: FontWeight.w900,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.black26,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text('${state.character!.momentum}/100', style: const TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Physical Card
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0A0D1D).withOpacity(0.4),
                              border: Border.all(color: const Color(0xFF3B0764).withOpacity(0.2)),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('PHYSICAL PROFILE', style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 2),
                                Text(
                                  '${state.character!.weight.isNotEmpty ? state.character!.weight : "No weight"} | ${state.character!.height.isNotEmpty ? state.character!.height : "No height"}',
                                  style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Core RPG Stats Row
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0A0D1D).withOpacity(0.4),
                        border: Border.all(color: const Color(0xFF3B0764).withOpacity(0.2)),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.emoji_events, color: Color(0xFF06B6D4), size: 10),
                              SizedBox(width: 4),
                              Text('CORE RPG ATTRIBUTES', style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(child: _buildCoreStatCard('Strength', state.character!.strengthLvl, state.character!.strengthXp, Icons.shield, Colors.redAccent)),
                              const SizedBox(width: 8),
                              Expanded(child: _buildCoreStatCard('Willpower', state.character!.willpowerLvl, state.character!.willpowerXp, Icons.bolt, Colors.amberAccent)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(child: _buildCoreStatCard('Mobility', state.character!.mobilityLvl, state.character!.mobilityXp, Icons.directions_run, Colors.greenAccent)),
                              const SizedBox(width: 8),
                              Expanded(child: _buildCoreStatCard('Wisdom', state.character!.wisdomLvl, state.character!.wisdomXp, Icons.menu_book, Colors.blueAccent)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Mindset Stats Row
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0A0D1D).withOpacity(0.4),
                        border: Border.all(color: const Color(0xFF3B0764).withOpacity(0.2)),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('MINDSET ATTRIBUTES', style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _buildStatItem('Execution', state.character!.executionLvl),
                              _buildStatItem('Adaptability', state.character!.adaptabilityLvl),
                              _buildStatItem('Resilience', state.character!.resilienceLvl),
                              _buildStatItem('Awareness', state.character!.selfAwarenessLvl),
                              _buildStatItem('Ego Resist', state.character!.egoResistanceLvl),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // 3. Tracked Skills Summary
                    Row(
                      children: [
                        const Icon(Icons.bolt, color: Color(0xFF06B6D4), size: 16),
                        const SizedBox(width: 6),
                        const Text('ACTIVE SKILL NODES', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    if (state.skills.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(16),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: const Color(0xFF090B15).withOpacity(0.3),
                          border: Border.all(color: const Color(0xFF3B0764).withOpacity(0.1)),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text('No skills tracked. Discover skills in the Codex panel.', style: TextStyle(color: Colors.grey, fontSize: 10)),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: state.skills.length,
                        itemBuilder: (context, index) {
                          final skill = state.skills[index];
                          final skillXpNeeded = skill.level * 100;
                          final skillXpPct = (skill.xp / skillXpNeeded).clamp(0.0, 1.0);
                          
                          return Container(
                            margin: const EdgeInsets.only(bottom: 6),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF090B16).withOpacity(0.6),
                              border: Border.all(color: const Color(0xFF3B0764).withOpacity(0.2)),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(skill.name, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                          const SizedBox(width: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                            decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(4)),
                                            child: Text('LVL ${skill.level}', style: const TextStyle(color: Color(0xFFA855F7), fontSize: 8, fontWeight: FontWeight.bold)),
                                          )
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      SizedBox(
                                        height: 4,
                                        child: LinearProgressIndicator(
                                          value: skillXpPct,
                                          backgroundColor: Colors.black,
                                          color: const Color(0xFFA855F7),
                                        ),
                                      )
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Column(
                                  children: [
                                    const Text('RANK', style: TextStyle(color: Colors.grey, fontSize: 6, fontWeight: FontWeight.bold)),
                                    Text(skill.rank, style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 14, fontWeight: FontWeight.w900, fontFamily: 'monospace')),
                                  ],
                                )
                              ],
                            ),
                          );
                        },
                      ),
                    const SizedBox(height: 24),

                    // 4. Quest Log Tabs
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.shield, color: Color(0xFFA855F7), size: 16),
                            const SizedBox(width: 6),
                            const Text('ACTIVE QUEST LOGS', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                          ],
                        ),
                        InkWell(
                          onTap: () => _showAddQuestDialog(context, state),
                          child: const Row(
                            children: [
                              Icon(Icons.add_circle_outline, color: Color(0xFF06B6D4), size: 14),
                              SizedBox(width: 4),
                              Text('FORGE QUEST', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 10, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        )
                      ],
                    ),
                    const SizedBox(height: 8),
                    
                    // Tab Bar navigation
                    TabBar(
                      controller: _tabController,
                      labelColor: const Color(0xFFA855F7),
                      unselectedLabelColor: Colors.grey,
                      indicatorColor: const Color(0xFFA855F7),
                      tabs: [
                        Tab(text: 'ACTIVE (${active.length})'),
                        Tab(text: 'COMPLETED (${completed.length})'),
                      ],
                    ),
                    
                    const SizedBox(height: 8),
                    
                    // Tab View content
                    SizedBox(
                      height: 300,
                      child: TabBarView(
                        controller: _tabController,
                        children: [
                          _buildQuestList(active, state, true),
                          _buildQuestList(completed, state, false),
                        ],
                      ),
                    ),
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuestList(List<Quest> list, GameState state, bool isAvailable) {
    if (list.isEmpty) {
      return Container(
        margin: const EdgeInsets.only(top: 20),
        alignment: Alignment.topCenter,
        child: const Text('No quests in this catalog.', style: TextStyle(color: Colors.grey, fontSize: 11)),
      );
    }

    return ListView.builder(
      itemCount: list.length,
      itemBuilder: (context, index) {
        final q = list[index];

        Color borderColor = const Color(0xFF3B0764).withOpacity(0.2);
        Color bgColor = const Color(0xFF05070E).withOpacity(0.6);
        Color accentColor = const Color(0xFFA855F7);
        
        if (q.questType == 'BOSS') {
          borderColor = Colors.amber.withOpacity(0.3);
          bgColor = Colors.amber.withOpacity(0.02);
          accentColor = Colors.amber;
        } else if (q.questType == 'ELITE') {
          borderColor = const Color(0xFF06B6D4).withOpacity(0.3);
          bgColor = const Color(0xFF06B6D4).withOpacity(0.02);
          accentColor = const Color(0xFF06B6D4);
        }

        // Skill map suggestions
        String skillMapping = 'General';
        final lowerTitle = q.title.toLowerCase();
        if (lowerTitle.contains('run') || lowerTitle.contains('workout') || lowerTitle.contains('lift') || lowerTitle.contains('physique')) {
          skillMapping = 'Physique';
        } else if (lowerTitle.contains('code') || lowerTitle.contains('program') || lowerTitle.contains('schema') || lowerTitle.contains('api')) {
          skillMapping = 'Programming';
        } else if (lowerTitle.contains('client') || lowerTitle.contains('saas') || lowerTitle.contains('sale')) {
          skillMapping = 'SaaS';
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 6),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: bgColor,
            border: Border.all(color: borderColor),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                          decoration: BoxDecoration(
                            color: accentColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            q.questType,
                            style: TextStyle(color: accentColor, fontSize: 8, fontWeight: FontWeight.w900),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text('DIFFICULTY ${q.difficulty}', style: const TextStyle(color: Colors.grey, fontSize: 8)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(q.title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    if (q.description.isNotEmpty)
                      Text(q.description, style: const TextStyle(color: Colors.grey, fontSize: 10)),
                    const SizedBox(height: 6),
                    Text(
                      '+${q.xpReward} XP TO $skillMapping',
                      style: TextStyle(color: accentColor.withOpacity(0.8), fontSize: 9, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (isAvailable) ...[
                    IconButton(
                      icon: const Icon(Icons.check_circle_outline, color: Color(0xFF06B6D4)),
                      onPressed: () async {
                        final data = await state.completeQuest(q.id, skillMapping);
                        if (data != null && context.mounted) {
                          _showRewardDialog(context, data);
                        }
                      },
                    ),
                  ],
                  IconButton(
                    icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                    onPressed: () async {
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (context) => AlertDialog(
                          backgroundColor: const Color(0xFF0F111E),
                          title: const Text('Delete Quest', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                          content: const Text('Are you sure you want to delete this quest?', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context, false),
                              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
                            ),
                            TextButton(
                              onPressed: () => Navigator.pop(context, true),
                              child: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
                            ),
                          ],
                        ),
                      );
                      if (confirm == true) {
                        await state.deleteQuest(q.id);
                      }
                    },
                  ),
                ],
              )
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatItem(String label, int val) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 7, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text('$val', style: const TextStyle(color: Color(0xFFA855F7), fontSize: 11, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildCoreStatCard(String label, int lvl, int xp, IconData icon, Color color) {
    final reqXp = lvl * 100;
    final pct = (xp / reqXp).clamp(0.0, 1.0);
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFF090B16).withOpacity(0.6),
        border: Border.all(color: const Color(0xFF3B0764).withOpacity(0.15)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, size: 10, color: color),
                  const SizedBox(width: 4),
                  Text(label, style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  border: Border.all(color: const Color(0xFF1E293B)),
                  borderRadius: BorderRadius.circular(3),
                ),
                child: Text('LVL $lvl', style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 7, fontWeight: FontWeight.black)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('XP PROGRESS', style: TextStyle(color: Colors.grey, fontSize: 6, fontWeight: FontWeight.bold)),
              Text('$xp/$reqXp', style: const TextStyle(color: Colors.grey, fontSize: 6, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 3),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: pct,
              minHeight: 3,
              backgroundColor: const Color(0xFF020617),
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF06B6D4)),
            ),
          ),
        ],
      ),
    );
  }
}
