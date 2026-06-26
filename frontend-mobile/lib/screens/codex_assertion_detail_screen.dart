import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../services/game_state.dart';

class CodexAssertionDetailScreen extends StatefulWidget {
  final String? claimText;
  final double? confidenceScore;
  final List<String>? empiricalEvidence;
  final bool? isRetconned;

  const CodexAssertionDetailScreen({
    Key? key,
    this.claimText,
    this.confidenceScore,
    this.empiricalEvidence,
    this.isRetconned,
  }) : super(key: key);

  @override
  State<CodexAssertionDetailScreen> createState() => _CodexAssertionDetailScreenState();
}

class _CodexAssertionDetailScreenState extends State<CodexAssertionDetailScreen> {
  bool _isSavingRetcon = false;

  void _showRetconDialog(BuildContext context, String entryId) {
    String selectedImportance = 'HIGH';
    final TextEditingController reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (statefulContext, setDialogState) {
            return AlertDialog(
              backgroundColor: const Color(0xFF07070C),
              title: const Text(
                'HISTORICAL RETCON DECLARATION',
                style: TextStyle(
                  fontFamily: 'Courier',
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFD97706),
                ),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Time provides perspective. Adjust the narrative weight of this chronicle entry.',
                    style: TextStyle(fontSize: 11, color: Colors.white60),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: selectedImportance,
                    dropdownColor: const Color(0xFF07070C),
                    decoration: const InputDecoration(
                      labelText: 'NEW VALUE IMPORTANCE',
                      labelStyle: TextStyle(fontFamily: 'Courier', fontSize: 10, color: Colors.white38),
                      enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'COMMON', child: Text('COMMON', style: TextStyle(color: Colors.white))),
                      DropdownMenuItem(value: 'HIGH', child: Text('HIGH', style: TextStyle(color: Colors.white))),
                      DropdownMenuItem(value: 'EPIC', child: Text('EPIC', style: TextStyle(color: Color(0xFFA855F7)))),
                      DropdownMenuItem(value: 'LEGENDARY', child: Text('LEGENDARY', style: TextStyle(color: Color(0xFFF59E0B)))),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setDialogState(() {
                          selectedImportance = val;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: reasonController,
                    maxLines: 3,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: const InputDecoration(
                      hintText: 'Enter chronological reason or reframed lessons learned...',
                      hintStyle: TextStyle(color: Colors.white24, fontSize: 11),
                      enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                      focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Color(0xFFD97706))),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  child: const Text('DISCARD', style: TextStyle(color: Colors.white38, fontFamily: 'Courier', fontSize: 11)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD97706),
                  ),
                  onPressed: _isSavingRetcon
                      ? null
                      : () async {
                          final reason = reasonController.text.trim();
                          if (reason.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Rationale is required to rewrite timeline.')),
                            );
                            return;
                          }

                          Navigator.pop(dialogContext);
                          await _executeRetconMutation(entryId, selectedImportance, reason);
                        },
                  child: const Text('SUBMIT MUTATION', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontFamily: 'Courier', fontSize: 11)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _executeRetconMutation(String entryId, String importance, String reason) async {
    setState(() {
      _isSavingRetcon = true;
    });

    final gameState = Provider.of<GameState>(context, listen: false);
    final userId = gameState.userId;

    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/system/codex/retcon'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': userId,
          'entryId': entryId,
          'newImportance': importance,
          'retconReason': reason,
        }),
      );

      if (response.statusCode == 200) {
        await gameState.fetchStatus();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('HISTORICAL REALITY REWRITTEN SUCCESSFUL.'),
            backgroundColor: Color(0xFF10B981),
          ),
        );
        Navigator.pop(context, true);
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Mutation error: ${response.statusCode}'),
            backgroundColor: const Color(0xFFEF4444),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Network error: $e'),
          backgroundColor: const Color(0xFFEF4444),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSavingRetcon = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;

    final displayClaim = widget.claimText ?? args?['claimText'] ?? 'Unspecified Codex Assertion';
    final displayScore = widget.confidenceScore ?? args?['confidenceScore'] ?? 0.85;
    final displayEvidence = widget.empiricalEvidence ??
        (args?['empiricalEvidence'] as List?)?.map((e) => e.toString()).toList() ??
        ['No empirical evidence logged.'];
    final displayRetcon = widget.isRetconned ?? args?['isRetconned'] ?? false;
    final displayId = args?['id'] ?? '';

    return Scaffold(
      backgroundColor: const Color(0xFF020203), // Pure obsidian floor
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
              // System Assertion Header Track
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'SYSTEMIC ASSERTION CORE',
                    style: TextStyle(
                      fontFamily: 'Courier',
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.white38,
                      letterSpacing: 2.0,
                    ),
                  ),
                  Text(
                    'CONFID: ${(displayScore * 100).toStringAsFixed(0)}%',
                    style: TextStyle(
                      fontFamily: 'Courier',
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: displayScore >= 0.85 ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // The Asserted Claim Presentation
              Text(
                '"$displayClaim"',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFE2E8F0),
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 36),

              // THE EMPIRICAL EVIDENCE MATRIX LIST
              const Text(
                'FOUNDATIONAL EVIDENCE LAYER',
                style: TextStyle(
                  fontFamily: 'Courier',
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFD97706),
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  itemCount: displayEvidence.length,
                  itemBuilder: (context, index) {
                    return Container(
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF09090D),
                        border: Border.all(color: Colors.white10),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.analytics_outlined, size: 14, color: Colors.white24),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              displayEvidence[index],
                              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13, fontFamily: 'Courier'),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 16),

              // THE RETCON ACTION TRIGGER CONTROLLER
              if (displayId.isNotEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0x0DFFFFFF),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'HISTORICAL RETCON MATRIX',
                            style: TextStyle(fontFamily: 'Courier', fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white38),
                          ),
                          if (displayRetcon)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              color: const Color(0x3DF59E0B),
                              child: const Text(
                                'MUTATED',
                                style: TextStyle(fontFamily: 'Courier', fontSize: 8, color: Color(0xFFF59E0B), fontWeight: FontWeight.bold),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Has time changed the weight of this event? Retroactively elevate its significance inside your permanent legend archive.',
                        style: TextStyle(fontSize: 11, color: Colors.white54, height: 1.4),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 44,
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0x4DD97706)),
                            shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                          ),
                          icon: const Icon(Icons.history_edu, size: 16, color: Color(0xFFD97706)),
                          label: const Text('REWRITE HISTORICAL IMPORTANCE', style: TextStyle(fontFamily: 'Courier', fontSize: 12, color: Color(0xFFD97706))),
                          onPressed: _isSavingRetcon ? null : () => _showRetconDialog(context, displayId),
                        ),
                      )
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
