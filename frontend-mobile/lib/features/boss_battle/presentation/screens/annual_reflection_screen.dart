import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../../../../core/theme/colors.dart';
import '../../../../services/game_state.dart';

class AnnualReflectionMirrorScreen extends StatefulWidget {
  const AnnualReflectionMirrorScreen({Key? key}) : super(key: key);

  @override
  State<AnnualReflectionMirrorScreen> createState() => _AnnualReflectionMirrorScreenState();
}

class _AnnualReflectionMirrorScreenState extends State<AnnualReflectionMirrorScreen> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _reflectionData;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchReflectionData();
    });
  }

  Future<void> _fetchReflectionData() async {
    final gameState = Provider.of<GameState>(context, listen: false);
    final userId = gameState.userId;

    try {
      final response = await http.get(
        Uri.parse('$apiBaseUrl/system/annual-reflection?userId=$userId'),
      );

      if (response.statusCode == 200) {
        setState(() {
          _reflectionData = json.decode(response.body);
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = 'Failed to retrieve analysis from The Forge system: Code ${response.statusCode}';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'The System is offline or unreachable: $e';
        _isLoading = false;
      });
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '365 DAYS AGO';
    try {
      final dt = DateTime.parse(dateStr);
      final months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
    } catch (e) {
      return dateStr;
    }
  }

  Color _getImportanceColor(String importance) {
    switch (importance.toUpperCase()) {
      case 'LEGENDARY':
        return const Color(0xFFF59E0B); // Amber/Gold
      case 'EPIC':
        return const Color(0xFFA855F7); // Purple
      case 'HIGH':
        return const Color(0xFF06B6D4); // Cyan
      default:
        return const Color(0xFF94A3B8); // Slate/Grey
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000000), // Double-void black baseline
      body: SafeArea(
        child: _isLoading
            ? _buildLoadingState()
            : _error != null
                ? _buildErrorState()
                : _buildContentState(),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(
            width: 40,
            height: 40,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFEF4444)),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'HOLDING MIRROR TO HISTORICAL COGNITION...',
            style: TextStyle(
              fontFamily: 'Courier',
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
              color: Colors.white.withOpacity(0.5),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            color: Color(0xFFEF4444),
            size: 48,
          ),
          const SizedBox(height: 16),
          const Text(
            'REFLECTION PIPELINE DISRUPTED',
            style: TextStyle(
              fontFamily: 'Courier',
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _error ?? 'An unknown disruption occurred.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 32),
          OutlinedButton(
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.white24),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            onPressed: () {
              setState(() {
                _isLoading = true;
                _error = null;
              });
              _fetchReflectionData();
            },
            child: const Text(
              'RECONNECT',
              style: TextStyle(
                fontFamily: 'Courier',
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContentState() {
    final data = _reflectionData!;
    final pastBeliefQuote = data['pastBeliefQuote'] ?? '';
    final pastBeliefDate = _formatDate(data['pastBeliefDate']);
    final analysis = data['analysis'] ?? '';
    final List turningPoints = data['turningPoints'] ?? [];

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Solemn Monospace Header
            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFFEF4444),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'THE ANNUAL REFLECTION MIRROR',
                  style: TextStyle(
                    fontFamily: 'Courier',
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                    color: Color(0xFFEF4444),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Immersive Intro
            Text(
              'Look upon the narrative your identity once declared as objective truth.',
              style: TextStyle(
                fontSize: 15,
                height: 1.5,
                color: Colors.white.withOpacity(0.6),
                fontStyle: FontStyle.italic,
              ),
            ),
            const SizedBox(height: 32),

            // Past Belief Quote Box (Muted Red Background, Premium Border)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF130305), // Extremely dark red tint
                border: Border.all(
                  color: const Color(0xFFEF4444).withOpacity(0.25),
                  width: 1,
                ),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'RECORDED BELIEF',
                        style: TextStyle(
                          fontFamily: 'Courier',
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFFEF4444).withOpacity(0.8),
                        ),
                      ),
                      Text(
                        pastBeliefDate,
                        style: TextStyle(
                          fontFamily: 'Courier',
                          fontSize: 10,
                          color: Colors.white.withOpacity(0.4),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    '"$pastBeliefQuote"',
                    style: const TextStyle(
                      fontSize: 15,
                      height: 1.5,
                      fontWeight: FontWeight.w400,
                      color: Color(0xFFFDA4AF), // Soft warm red
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 36),

            // Section Divider
            Center(
              child: Container(
                width: 60,
                height: 1,
                color: Colors.white24,
              ),
            ),
            const SizedBox(height: 36),

            // The Chronicler's Synthesis Panel
            Row(
              children: [
                const Icon(
                  Icons.history_edu,
                  color: Color(0xFFF59E0B),
                  size: 20,
                ),
                const SizedBox(width: 10),
                Text(
                  "THE CHRONICLER'S DECREE",
                  style: TextStyle(
                    fontFamily: 'Courier',
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                    color: const Color(0xFFF59E0B).withOpacity(0.9),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              analysis,
              style: const TextStyle(
                fontSize: 16,
                height: 1.6,
                fontFamily: 'Georgia', // Elegant, literary font family
                color: Color(0xFFE2E8F0),
              ),
            ),
            const SizedBox(height: 40),

            // Evidentiary Turning Points Header
            const Text(
              'EVIDENTIARY EVIDENCE (PAST 365 CYCLES)',
              style: TextStyle(
                fontFamily: 'Courier',
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
                color: Colors.white38,
              ),
            ),
            const SizedBox(height: 16),

            // Turning Points List
            ...turningPoints.map((tp) {
              final String quote = tp['quote'] ?? '';
              final String summary = tp['summary'] ?? '';
              final String importance = tp['importance'] ?? 'HIGH';
              final String date = _formatDate(tp['createdAt']);
              final Color impColor = _getImportanceColor(importance);

              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF07070C),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: impColor.withOpacity(0.1),
                            border: Border.all(color: impColor.withOpacity(0.3), width: 0.8),
                            borderRadius: BorderRadius.circular(2),
                          ),
                          child: Text(
                            importance.toUpperCase(),
                            style: TextStyle(
                              fontFamily: 'Courier',
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: impColor,
                            ),
                          ),
                        ),
                        Text(
                          date,
                          style: TextStyle(
                            fontFamily: 'Courier',
                            fontSize: 9,
                            color: Colors.white.withOpacity(0.3),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '"$quote"',
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w500,
                        color: Colors.white,
                        height: 1.4,
                      ),
                    ),
                    if (summary.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(
                        summary,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white.withOpacity(0.5),
                          height: 1.3,
                        ),
                      ),
                    ],
                  ],
                ),
              );
            }).toList(),

            const SizedBox(height: 48),

            // Outliner Control Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.white30, width: 1),
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.zero, // Minimalist crisp styling
                  ),
                ),
                onPressed: () {
                  Navigator.pop(context);
                },
                child: const Text(
                  'DISMISS THE MIRROR',
                  style: TextStyle(
                    fontFamily: 'Courier',
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                    color: Colors.white,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
