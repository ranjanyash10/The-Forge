import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:get_it/get_it.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/foundation.dart';
import 'services/game_state.dart';
import 'screens/hub_screen.dart';
import 'screens/codex_screen.dart';
import 'screens/skills_screen.dart';
import 'screens/chronicle_screen.dart';
import 'screens/auth_screen.dart';
import 'screens/system_screen.dart';
import 'screens/open_chronicle_portal.dart';
import 'screens/codex_assertion_detail_screen.dart';
import 'core/network/supabase_client.dart';
import 'core/theme/colors.dart';
import 'features/reward_moment/presentation/reward_moment_screen.dart';
import 'features/boss_battle/data/datasources/boss_api_client.dart';
import 'features/boss_battle/bloc/boss_battle_bloc.dart';
import 'features/boss_battle/presentation/screens/boss_prediction_screen.dart';
import 'features/boss_battle/presentation/screens/active_boss_screen.dart';
import 'features/boss_battle/presentation/screens/annual_reflection_screen.dart';

final GetIt locator = GetIt.instance;

void setupLocator() {
  if (SupabaseService.isInitialized) {
    locator.registerLazySingleton<SupabaseClient>(() => SupabaseService.client);
  }
  locator.registerLazySingleton<BossApiClient>(() => BossApiClient());
  locator.registerLazySingleton<BossBattleBloc>(
      () => BossBattleBloc(apiClient: locator<BossApiClient>()));
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SupabaseService.initialize();
  setupLocator();
  runApp(
    ChangeNotifierProvider(
      create: (_) => GameState(),
      child: BlocProvider<BossBattleBloc>(
        // lazy: true so the bloc is only created when first accessed,
        // preventing a crash if Supabase/BossApiClient fails to initialize.
        lazy: true,
        create: (_) {
          try {
            return locator<BossBattleBloc>();
          } catch (e) {
            if (kDebugMode) print('BossBattleBloc init error: $e');
            return BossBattleBloc(apiClient: BossApiClient());
          }
        },
        child: const TheForgeApp(),
      ),
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
        scaffoldBackgroundColor: ForgeColors.background,
        primaryColor: ForgeColors.purple,
        colorScheme: const ColorScheme.dark(
          primary: ForgeColors.purple,
          secondary: ForgeColors.cyan,
          surface: ForgeColors.surface,
          error: ForgeColors.red,
        ),
        textTheme: const TextTheme(
          bodyMedium: TextStyle(color: Colors.white, fontFamily: 'sans-serif'),
        ),
        useMaterial3: true,
      ),
      home: const MainNavigationShell(),
      routes: {
        '/reward_moment': (context) => const RewardMomentScreen(),
        '/boss_prediction': (context) => const BossPredictionScreen(),
        '/active_boss': (context) => const ActiveBossScreen(),
        '/annual_reflection': (context) => const AnnualReflectionMirrorScreen(),
        '/open_chronicle': (context) => const TheOpenChroniclePortal(),
        '/assertion_detail': (context) => const CodexAssertionDetailScreen(),
      },
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
    SystemScreen(),
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

    // If character not created yet, show conversational onboarding SystemScreen
    final hideNav = state.character == null;

    return Scaffold(
      body: hideNav ? const SystemScreen() : _screens[_currentIndex],
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
                  BottomNavigationBarItem(
                    icon: Icon(Icons.terminal),
                    label: 'SYSTEM',
                  ),
                ],
              ),
            ),
    );
  }
}
