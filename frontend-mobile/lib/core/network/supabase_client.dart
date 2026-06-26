import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static bool _initialized = false;

  static Future<void> initialize() async {
    try {
      await Supabase.initialize(
        url: const String.fromEnvironment('SUPABASE_URL',
            defaultValue: 'https://sqoltnfdisyoiupbvloj.supabase.co'),
        anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY',
            defaultValue:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxb2x0bmZkaXN5b2l1cGJ2bG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkwODIzNjYsImV4cCI6MjAzNDY1ODM2Nn0.mock'),
      );
      _initialized = true;
    } catch (e) {
      _initialized = false;
      // ignore: avoid_print
      print('Supabase initialization error (running offline fallback): $e');
    }
  }

  static bool get isInitialized => _initialized;

  static SupabaseClient get client {
    if (!_initialized) {
      throw StateError(
          'Supabase is not initialized. Boss Battle features unavailable.');
    }
    return Supabase.instance.client;
  }
}
