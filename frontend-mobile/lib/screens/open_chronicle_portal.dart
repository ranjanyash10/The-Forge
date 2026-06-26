import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../core/theme/colors.dart';
import '../services/game_state.dart';

class TheOpenChroniclePortal extends StatefulWidget {
  const TheOpenChroniclePortal({Key? key}) : super(key: key);

  @override
  State<TheOpenChroniclePortal> createState() => _TheOpenChroniclePortalState();
}

class _TheOpenChroniclePortalState extends State<TheOpenChroniclePortal> {
  final TextEditingController _reflectionController = TextEditingController();
  bool _isProcessing = false;

  Future<void> _submitReflection() async {
    final reflection = _reflectionController.text.trim();
    if (reflection.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Speak your thoughts to the system before resting.'),
          backgroundColor: Color(0xFFD97706),
        ),
      );
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    final gameState = Provider.of<GameState>(context, listen: false);
    final userId = gameState.userId;

    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/daily-logs'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': userId,
          'reflection': reflection,
        }),
      );

      if (response.statusCode == 200) {
        final resData = json.decode(response.body);
        
        // Refresh local status to pick up updated dynamic states, completed quests, and new attributes
        await gameState.fetchStatus();

        if (!mounted) return;

        // Check if any quest was completed dynamically via the Analyst
        final completedQuests = resData['spawnedQuests'] as List?;
        if (completedQuests != null && completedQuests.isNotEmpty) {
          final firstQuest = completedQuests.first;
          // Navigate to the reward cinematic sequence
          Navigator.pushReplacementNamed(
            context,
            '/reward_moment',
            arguments: {
              'questTitle': firstQuest['title'] ?? 'Reality Alignment',
              'alert': 'Quest Complete',
              'xpReward': firstQuest['xp_reward'] ?? 50,
              'difficulty': firstQuest['quest_type'] ?? 'SIDE',
              'rewardData': {
                'success': true,
                'quest': firstQuest,
                'xpGained': firstQuest['xp_reward'] ?? 50,
                'globalLevelUp': resData['globalLevelUp'] ?? false,
                'newGlobalLevel': resData['newGlobalLevel'] ?? gameState.character?.momentum, // or status value
              },
            },
          );
        } else {
          // No dynamic quest completion; pop back to the dashboard with standard notification
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('RECONSTRUCTION ALIGNED: ${resData['analysis'] ?? 'Reflective state logged.'}'),
              backgroundColor: const Color(0xFF10B981),
            ),
          );
          Navigator.pop(context);
        }
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Reflection alignment failed. Code: ${response.statusCode}'),
            backgroundColor: const Color(0xFFEF4444),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Network communication error: $e'),
          backgroundColor: const Color(0xFFEF4444),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _reflectionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020204), // Pure obsidian ink
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white70),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Immersive Status Area
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'THE CHRONICLER IS OBSERVING',
                    style: TextStyle(
                      fontFamily: 'Courier',
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2.5,
                      color: Color(0xFFD97706),
                    ),
                  ),
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: Color(0xFFD97706),
                      shape: BoxShape.circle,
                    ),
                  )
                ],
              ),
              const SizedBox(height: 24),
              
              // The Open System Prompt Frame
              const Text(
                'HOW DID TODAY UNFOLD?',
                style: TextStyle(
                  fontSize: 26,
                  fontStyle: FontStyle.italic,
                  fontWeight: FontWeight.w400,
                  color: Color(0xFFF8FAFC),
                ),
              ),
              const SizedBox(height: 24),
              
              // The Minimalist Open Input Workspace
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: TextField(
                    controller: _reflectionController,
                    maxLines: null,
                    enabled: !_isProcessing,
                    autofocus: true,
                    style: const TextStyle(
                      fontSize: 16.0,
                      height: 1.7,
                      letterSpacing: 0.3,
                      color: Color(0xFFCBD5E1),
                    ),
                    decoration: const InputDecoration(
                      hintText: "Speak freely of your actions, your choices, and your frame of mind...",
                      hintStyle: TextStyle(color: Colors.white24, fontSize: 16.0),
                      border: InputBorder.none,
                    ),
                  ),
                ),
              ),
              
              // Action Processing Overlay Control
              SizedBox(
                width: double.infinity,
                height: 54,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: _isProcessing ? Colors.white10 : const Color(0xFFD97706)),
                    backgroundColor: _isProcessing ? const Color(0xFF0A0A0F) : Colors.transparent,
                    shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.zero, // Minimalist outliner style
                    ),
                  ),
                  onPressed: _isProcessing ? null : _submitReflection,
                  child: _isProcessing 
                    ? const Text(
                        'THE SYSTEM IS ALIGNING REALITY...',
                        style: TextStyle(
                          fontFamily: 'Courier',
                          color: Colors.white38,
                        ),
                      )
                    : const Text(
                        'REST FOR THE CYCLE',
                        style: TextStyle(
                          fontFamily: 'Courier',
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 1.0,
                        ),
                      ),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
