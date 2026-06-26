import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/game_state.dart';

class SystemScreen extends StatefulWidget {
  const SystemScreen({super.key});

  @override
  State<SystemScreen> createState() => _SystemScreenState();
}

class _SystemScreenState extends State<SystemScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool sending = false;
  Map<String, dynamic>? charGeneratedResult;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<GameState>(context, listen: false).fetchSystemHistory().then((_) {
        _scrollToBottom();
      });
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty || sending) return;

    setState(() {
      sending = true;
    });
    _controller.clear();
    _scrollToBottom();

    final state = Provider.of<GameState>(context, listen: false);
    final res = await state.sendSystemMessage(text);
    
    if (res != null) {
      if (res['finished'] == true && res['analysis'] != null) {
        setState(() {
          charGeneratedResult = res['analysis'];
        });
      }
    }
    
    setState(() {
      sending = false;
    });
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<GameState>(context);
    final isGuest = state.character == null;

    if (state.loading && state.systemMessages.isEmpty) {
      return const Scaffold(
        backgroundColor: Color(0xFF02040A),
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFFA855F7)),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF02040A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF070913),
        title: Row(
          children: [
            const Icon(Icons.terminal, color: Color(0xFFA855F7), size: 20),
            const SizedBox(width: 8),
            Text(
              isGuest ? 'SYSTEM ASSESSMENT' : 'THE SYSTEM',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
        actions: [
          if (isGuest)
            IconButton(
              icon: const Icon(Icons.logout, color: Colors.grey, size: 20),
              onPressed: () => state.logout(),
              tooltip: 'Logout',
            ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 1. Assessment Progress Bar (Only during onboarding)
            if (isGuest && charGeneratedResult == null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                color: const Color(0xFF070913),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Synchronization Progress',
                          style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '${state.onboardingProgress}%',
                          style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: state.onboardingProgress / 100.0,
                        backgroundColor: Colors.black,
                        color: const Color(0xFFA855F7),
                        minHeight: 6,
                      ),
                    ),
                  ],
                ),
              ),

            // 2. Main Content View
            Expanded(
              child: charGeneratedResult != null
                  ? _buildCompilationCompleteScreen(state)
                  : _buildChatView(state),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChatView(GameState state) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: state.systemMessages.length + (sending ? 1 : 0),
            itemBuilder: (context, index) {
              if (index == state.systemMessages.length) {
                // Typing Indicator
                return _buildMessageBubble(
                  sender: 'SYSTEM',
                  content: '...',
                  isTyping: true,
                );
              }
              final msg = state.systemMessages[index];
              return _buildMessageBubble(
                sender: msg.sender,
                content: msg.content,
              );
            },
          ),
        ),
        
        // Chat Input Field
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: const BoxDecoration(
            color: Color(0xFF070913),
            border: Border(top: BorderSide(color: Color(0xFF1E1E2C), width: 0.8)),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  enabled: !sending,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: const InputDecoration(
                    hintText: 'Relay transmission to the System...',
                    hintStyle: TextStyle(color: Colors.grey, fontSize: 13),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                  ),
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.send, color: Color(0xFFA855F7)),
                onPressed: sending ? null : _sendMessage,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMessageBubble({required String sender, required String content, bool isTyping = false}) {
    final isSystem = sender == 'SYSTEM';
    return Align(
      alignment: isSystem ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
        child: Column(
          crossAxisAlignment: isSystem ? CrossAxisAlignment.start : CrossAxisAlignment.end,
          children: [
            Text(
              isSystem ? '▸ THE SYSTEM' : '▸ CANDIDATE',
              style: TextStyle(
                color: isSystem ? const Color(0xFFA855F7) : const Color(0xFF06B6D4),
                fontSize: 8,
                fontWeight: FontWeight.bold,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSystem ? const Color(0xFF0E1122) : const Color(0xFF062D3D).withOpacity(0.2),
                border: Border.all(
                  color: isSystem ? const Color(0xFF1E1E38) : const Color(0xFF06B6D4).withOpacity(0.2),
                  width: 0.8,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: isTyping
                  ? const SizedBox(
                      width: 24,
                      height: 8,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          CircleAvatar(radius: 2, backgroundColor: Color(0xFFA855F7)),
                          CircleAvatar(radius: 2, backgroundColor: Color(0xFFA855F7)),
                          CircleAvatar(radius: 2, backgroundColor: Color(0xFFA855F7)),
                        ],
                      ),
                    )
                  : Text(
                      content,
                      style: TextStyle(
                        color: isSystem ? const Color(0xFFE2E8F0) : Colors.white,
                        fontSize: 12,
                        height: 1.4,
                        fontFamily: isSystem ? 'monospace' : 'sans-serif',
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompilationCompleteScreen(GameState state) {
    final charClass = charGeneratedResult?['class'] ?? 'Unknown Class';
    final biography = charGeneratedResult?['biography'] ?? '';
    final values = charGeneratedResult?['values'] as List? ?? [];
    final attributes = charGeneratedResult?['attributes'] as Map? ?? {};

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF070913),
          border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.3)),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF06B6D4).withOpacity(0.08),
              blurRadius: 20,
              spreadRadius: 2,
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.auto_awesome, color: Color(0xFF06B6D4), size: 40),
            const SizedBox(height: 16),
            const Text(
              'Alter Ego Successfully Forged',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 2),
            ),
            const SizedBox(height: 8),
            Text(
              charClass,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 16),
            const Divider(color: Color(0xFF1E1E2C)),
            const SizedBox(height: 8),
            Text(
              '"$biography"',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey, fontSize: 12, fontStyle: FontStyle.italic, height: 1.5),
            ),
            const SizedBox(height: 16),
            if (values.isNotEmpty) ...[
              const Text(
                'CORE INFERRED VALUES',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1),
              ),
              const SizedBox(height: 8),
              Wrap(
                alignment: WrapAlignment.center,
                spacing: 6,
                runSpacing: 6,
                children: values.map<Widget>((v) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black,
                      border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.3)),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      v.toString().toUpperCase(),
                      style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
            ],
            if (attributes.isNotEmpty) ...[
              const Text(
                'STARTING ATTRIBUTE BASELINES',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1),
              ),
              const SizedBox(height: 10),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                  childAspectRatio: 1.5,
                ),
                itemCount: attributes.length,
                itemBuilder: (context, index) {
                  final name = attributes.keys.elementAt(index);
                  final lvl = attributes[name]?['level'] ?? 10;
                  return Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.black54,
                      border: Border.all(color: const Color(0xFF1E1E2C)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.grey, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'LVL $lvl',
                          style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 20),
            ],
            ElevatedButton(
              onPressed: () async {
                setState(() {
                  charGeneratedResult = null;
                });
                await state.fetchStatus();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFA855F7),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text(
                'ENTER THE FORGE',
                style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.5),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
