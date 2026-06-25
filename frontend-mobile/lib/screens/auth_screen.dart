import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/game_state.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isLogin = true;
  bool _showPassword = false;
  bool _submitting = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _submitting = true;
      _errorMessage = null;
    });

    final state = Provider.of<GameState>(context, listen: false);
    bool success;

    if (_isLogin) {
      success = await state.login(
        _emailController.text.trim(),
        _passwordController.text,
      );
    } else {
      success = await state.register(
        _emailController.text.trim(),
        _usernameController.text.trim(),
        _passwordController.text,
      );
    }

    if (!mounted) return;

    if (!success) {
      setState(() {
        _errorMessage = state.error ?? 'Authentication failed';
        _submitting = false;
      });
    } else {
      setState(() {
        _submitting = false;
      });
    }
  }

  Future<void> _handleDemoAccess() async {
    setState(() {
      _submitting = true;
      _errorMessage = null;
    });

    final state = Provider.of<GameState>(context, listen: false);
    await state.loginAsDemo();

    if (mounted) {
      setState(() {
        _submitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Stack(
        children: [
          // Ambient neon glow backgrounds
          Positioned(
            top: -150,
            left: size.width / 2 - 150,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFA855F7).withOpacity(0.12),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFA855F7).withOpacity(0.12),
                    blurRadius: 100,
                    spreadRadius: 50,
                  )
                ],
              ),
            ),
          ),
          Positioned(
            bottom: -100,
            right: -100,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF06B6D4).withOpacity(0.08),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF06B6D4).withOpacity(0.08),
                    blurRadius: 100,
                    spreadRadius: 40,
                  )
                ],
              ),
            ),
          ),

          // Main form content container
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Icon Shield Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.shield,
                        color: Color(0xFFA855F7),
                        size: 32,
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'THE FORGE',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2.0,
                          foreground: Paint()
                            ..shader = const LinearGradient(
                              colors: [Color(0xFFF1F5F9), Color(0xFFCBD5E1)],
                            ).createShader(
                              const Rect.fromLTWH(0.0, 0.0, 200.0, 70.0),
                            ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _isLogin ? 'ACCESS THE SYSTEM' : 'INITIALIZE NEW IDENTITY',
                    style: const TextStyle(
                      color: Color(0xFF06B6D4),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 3.0,
                    ),
                  ),
                  const SizedBox(height: 36),

                  // Auth Card Wrapper
                  Container(
                    width: double.infinity,
                    constraints: const BoxConstraints(maxWidth: 400),
                    padding: const EdgeInsets.all(24.0),
                    decoration: BoxDecoration(
                      color: const Color(0xFF070913).withOpacity(0.75),
                      border: Border.all(
                        color: const Color(0xFFA855F7).withOpacity(0.15),
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(16.0),
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Tab mode selector
                          Container(
                            padding: const EdgeInsets.all(4.0),
                            decoration: BoxDecoration(
                              color: const Color(0xFF02040A).withOpacity(0.6),
                              borderRadius: BorderRadius.circular(8.0),
                              border: Border.all(
                                color: const Color(0xFFA855F7).withOpacity(0.1),
                              ),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: InkWell(
                                    onTap: () {
                                      setState(() {
                                        _isLogin = true;
                                        _errorMessage = null;
                                      });
                                    },
                                    child: Container(
                                      alignment: Alignment.center,
                                      padding: const EdgeInsets.symmetric(vertical: 10),
                                      decoration: BoxDecoration(
                                        color: _isLogin
                                            ? const Color(0xFFA855F7).withOpacity(0.2)
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(6.0),
                                        border: _isLogin
                                            ? Border.all(color: const Color(0xFFA855F7).withOpacity(0.25))
                                            : null,
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.login,
                                            size: 13,
                                            color: _isLogin ? const Color(0xFFE2E8F0) : Colors.grey,
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            'LOGIN',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              letterSpacing: 0.5,
                                              color: _isLogin ? const Color(0xFFE2E8F0) : Colors.grey,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: InkWell(
                                    onTap: () {
                                      setState(() {
                                        _isLogin = false;
                                        _errorMessage = null;
                                      });
                                    },
                                    child: Container(
                                      alignment: Alignment.center,
                                      padding: const EdgeInsets.symmetric(vertical: 10),
                                      decoration: BoxDecoration(
                                        color: !_isLogin
                                            ? const Color(0xFF06B6D4).withOpacity(0.2)
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(6.0),
                                        border: !_isLogin
                                            ? Border.all(color: const Color(0xFF06B6D4).withOpacity(0.25))
                                            : null,
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.person_add,
                                            size: 13,
                                            color: !_isLogin ? const Color(0xFFE2E8F0) : Colors.grey,
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            'REGISTER',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              letterSpacing: 0.5,
                                              color: !_isLogin ? const Color(0xFFE2E8F0) : Colors.grey,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Error Display
                          if (_errorMessage != null) ...[
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.redAccent.withOpacity(0.1),
                                border: Border.all(color: Colors.redAccent.withOpacity(0.25)),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              child: Text(
                                _errorMessage!,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: Colors.redAccent,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Email Field
                          const Text(
                            'EMAIL',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.0,
                              color: Color(0xFF94A3B8),
                            ),
                          ),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            validator: (val) {
                              if (val == null || val.trim().isEmpty) {
                                return 'Email is required';
                              }
                              if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(val.trim())) {
                                return 'Enter a valid email address';
                              }
                              return null;
                            },
                            style: const TextStyle(fontSize: 14, color: Colors.white),
                            decoration: InputDecoration(
                              hintText: 'candidate@theforge.org',
                              hintStyle: TextStyle(color: Colors.white.withOpacity(0.2)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              fillColor: const Color(0xFF02040A).withOpacity(0.6),
                              filled: true,
                              border: OutlineInputBorder(
                                borderSide: BorderSide(color: const Color(0xFFA855F7).withOpacity(0.2)),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderSide: const BorderSide(color: Color(0xFFA855F7), width: 1.5),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Username Field (Registration only)
                          if (!_isLogin) ...[
                            const Text(
                              'USERNAME',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.0,
                                color: Color(0xFF94A3B8),
                              ),
                            ),
                            const SizedBox(height: 6),
                            TextFormField(
                              controller: _usernameController,
                              validator: (val) {
                                if (val == null || val.trim().isEmpty) {
                                  return 'Username is required';
                                }
                                if (val.trim().length < 3) {
                                  return 'Username must be at least 3 characters';
                                }
                                return null;
                              },
                              style: const TextStyle(fontSize: 14, color: Colors.white),
                              decoration: InputDecoration(
                                hintText: 'YourAlterEgo',
                                hintStyle: TextStyle(color: Colors.white.withOpacity(0.2)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                fillColor: const Color(0xFF02040A).withOpacity(0.6),
                                filled: true,
                                border: OutlineInputBorder(
                                  borderSide: BorderSide(color: const Color(0xFF06B6D4).withOpacity(0.2)),
                                  borderRadius: BorderRadius.circular(8.0),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderSide: const BorderSide(color: Color(0xFF06B6D4), width: 1.5),
                                  borderRadius: BorderRadius.circular(8.0),
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Password Field
                          const Text(
                            'PASSWORD',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.0,
                              color: Color(0xFF94A3B8),
                            ),
                          ),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: !_showPassword,
                            validator: (val) {
                              if (val == null || val.isEmpty) {
                                return 'Password is required';
                              }
                              if (val.length < 6) {
                                return 'Password must be at least 6 characters';
                              }
                              return null;
                            },
                            style: const TextStyle(fontSize: 14, color: Colors.white),
                            decoration: InputDecoration(
                              hintText: '••••••••',
                              hintStyle: TextStyle(color: Colors.white.withOpacity(0.2)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              fillColor: const Color(0xFF02040A).withOpacity(0.6),
                              filled: true,
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _showPassword ? Icons.visibility_off : Icons.visibility,
                                  color: Colors.grey,
                                  size: 20,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _showPassword = !_showPassword;
                                  });
                                },
                              ),
                              border: OutlineInputBorder(
                                borderSide: BorderSide(color: const Color(0xFFA855F7).withOpacity(0.2)),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderSide: const BorderSide(color: Color(0xFFA855F7), width: 1.5),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Submit Button
                          ElevatedButton(
                            onPressed: _submitting ? null : _handleSubmit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              shadowColor: Colors.transparent,
                            ),
                            child: Ink(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: _isLogin
                                      ? [const Color(0xFF7E22CE), const Color(0xFF9333EA)]
                                      : [const Color(0xFF0E7490), const Color(0xFF0891B2)],
                                ),
                                borderRadius: BorderRadius.circular(8.0),
                                boxShadow: [
                                  BoxShadow(
                                    color: (_isLogin ? const Color(0xFFA855F7) : const Color(0xFF06B6D4)).withOpacity(0.25),
                                    blurRadius: 15,
                                    spreadRadius: 1,
                                  )
                                ],
                              ),
                              child: Container(
                                alignment: Alignment.center,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                child: _submitting
                                    ? Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const SizedBox(
                                            width: 14,
                                            height: 14,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                              color: Colors.white,
                                            ),
                                          ),
                                          const SizedBox(width: 10),
                                          Text(
                                            _isLogin ? 'AUTHENTICATING...' : 'FORGING IDENTITY...',
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              letterSpacing: 1.0,
                                            ),
                                          ),
                                        ],
                                      )
                                    : Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            _isLogin ? Icons.login : Icons.person_add,
                                            size: 14,
                                            color: Colors.white,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            _isLogin ? 'ENTER THE FORGE' : 'INITIALIZE ACCOUNT',
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              letterSpacing: 1.0,
                                            ),
                                          ),
                                        ],
                                      ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Demo Access Button
                  TextButton(
                    onPressed: _submitting ? null : _handleDemoAccess,
                    child: const Text(
                      '▸ Access Demo Mode',
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),
                  const Text(
                    'Forging Legends Since 2026',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 9,
                      letterSpacing: 2.0,
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
