import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/game_state.dart';
import 'screens/hub_screen.dart';
import 'screens/codex_screen.dart';
import 'screens/skills_screen.dart';
import 'screens/chronicle_screen.dart';
import 'screens/auth_screen.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => GameState(),
      child: const TheForgeApp(),
    ),
  );
}

class TheForgeApp extends StatelessWidget {
  const TheForgeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'THE FORGE',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF02040A),
        primaryColor: const Color(0xFFA855F7),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFA855F7),
          secondary: Color(0xFF06B6D4),
          surface: Color(0xFF070913),
          error: Colors.redAccent,
        ),
        textTheme: const TextTheme(
          bodyMedium: TextStyle(color: Colors.white, fontFamily: 'sans-serif'),
        ),
        useMaterial3: true,
      ),
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HubScreen(),
    CodexScreen(),
    SkillsScreen(),
    ChronicleScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<GameState>(context);

    // Loading / Initializing SharedPreferences
    if (!state.initialized) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFFA855F7)),
        ),
      );
    }

    // Require Auth
    if (state.userId.isEmpty) {
      return const AuthScreen();
    }

    // If character not created yet, show HubScreen which handles the creation wizard
    final hideNav = state.character == null;

    return Scaffold(
      body: _screens[hideNav ? 0 : _currentIndex],
      bottomNavigationBar: hideNav
          ? null
          : Container(
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: Color(0xFF1E1E2C), width: 0.8)),
              ),
              child: BottomNavigationBar(
                currentIndex: _currentIndex,
                onTap: (index) => setState(() => _currentIndex = index),
                backgroundColor: const Color(0xFF05070F),
                selectedItemColor: const Color(0xFF06B6D4),
                unselectedItemColor: Colors.grey,
                type: BottomNavigationBarType.fixed,
                selectedLabelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                unselectedLabelStyle: const TextStyle(fontSize: 10),
                items: const [
                  BottomNavigationBarItem(
                    icon: Icon(Icons.dashboard),
                    label: 'HUB',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.book),
                    label: 'CODEX',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.account_tree),
                    label: 'SKILLS',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.edit_document),
                    label: 'LOG',
                  ),
                ],
              ),
            ),
    );
  }
}
